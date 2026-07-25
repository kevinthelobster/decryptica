#!/usr/bin/env node
/**
 * Decryptica Vercel Web Analytics monitor.
 *
 * Requires:
 * - VERCEL_TOKEN: Vercel personal API token with access to the project
 * - VERCEL_PROJECT_ID / VERCEL_TEAM_ID optional; falls back to .vercel/project.json
 *
 * Usage:
 *   node scripts/vercel_analytics_monitor.js --mode report
 *   node scripts/vercel_analytics_monitor.js --mode check
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_FILE = path.join(ROOT, '.vercel', 'project.json');
const STATE_DIR = path.join(ROOT, 'data', 'vercel-analytics');
const STATE_FILE = path.join(STATE_DIR, 'monitor-state.json');
const API_BASE = 'https://api.vercel.com/v1/query/web-analytics';

const WATCHED_PATHS = [
  '/blog/solana-rpc-providers-compared',
  '/prompts',
  '/tools/ai-price-calculator',
];

function parseArgs() {
  const args = new Map();
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, true);
    } else {
      args.set(key, next);
      i++;
    }
  }
  return {
    mode: args.get('mode') || 'check',
    hours: Number(args.get('hours') || 24),
    spikePct: Number(args.get('spike-pct') || 75),
    dropPct: Number(args.get('drop-pct') || 60),
    minViews: Number(args.get('min-views') || 100),
  };
}

function readProjectConfig() {
  try {
    return JSON.parse(fs.readFileSync(PROJECT_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function iso(date) {
  return date.toISOString();
}

function pctChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function numberFromResponse(json) {
  if (typeof json === 'number') return json;
  if (!json || typeof json !== 'object') return 0;
  for (const key of ['total', 'count', 'visits', 'pageviews', 'pageViews', 'value']) {
    if (typeof json[key] === 'number') return json[key];
  }
  if (json.data) return numberFromResponse(json.data);
  return 0;
}

function rowsFromResponse(json) {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== 'object') return [];
  for (const key of ['rows', 'data', 'items', 'result']) {
    if (Array.isArray(json[key])) return json[key];
  }
  return [];
}

function rowMetric(row) {
  if (!row || typeof row !== 'object') return 0;
  for (const key of ['count', 'visits', 'pageviews', 'pageViews', 'value', 'total']) {
    if (typeof row[key] === 'number') return row[key];
  }
  return 0;
}

function rowPath(row) {
  if (!row || typeof row !== 'object') return '';
  return row.requestPath || row.route || row.path || row.name || row.key || '';
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeState(state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function query(token, endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text.slice(0, 500) };
  }

  if (!res.ok) {
    const message = json?.error?.message || json?.message || json?.error || `HTTP ${res.status}`;
    throw new Error(`Vercel Web Analytics API failed: ${message}`);
  }

  return json;
}

async function main() {
  const options = parseArgs();
  const projectConfig = readProjectConfig();
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID || projectConfig.projectId;
  const teamId = process.env.VERCEL_TEAM_ID || projectConfig.orgId;

  if (!token || !projectId) {
    console.log('BLOCKED: Vercel analytics monitor is installed, but VERCEL_TOKEN is missing. Add a Vercel personal API token to decryptica/.env.local as VERCEL_TOKEN=... and rerun npm run analytics:vercel.');
    process.exit(2);
  }

  const now = new Date();
  const currentStart = new Date(now.getTime() - options.hours * 60 * 60 * 1000);
  const previousStart = new Date(now.getTime() - options.hours * 2 * 60 * 60 * 1000);
  const common = { projectId, teamId };

  const [currentRaw, previousRaw, topRaw, watchedRaw] = await Promise.all([
    query(token, 'visits/count', { ...common, since: iso(currentStart), until: iso(now) }),
    query(token, 'visits/count', { ...common, since: iso(previousStart), until: iso(currentStart) }),
    query(token, 'visits/aggregate', { ...common, since: iso(currentStart), until: iso(now), by: 'requestPath', limit: 10 }),
    Promise.all(WATCHED_PATHS.map(async (requestPath) => ({
      requestPath,
      count: numberFromResponse(await query(token, 'visits/count', {
        ...common,
        since: iso(currentStart),
        until: iso(now),
        filter: `requestPath eq '${requestPath}'`,
      })),
    }))),
  ]);

  const currentViews = numberFromResponse(currentRaw);
  const previousViews = numberFromResponse(previousRaw);
  const change = pctChange(currentViews, previousViews);
  const topPages = rowsFromResponse(topRaw)
    .map((row) => ({ path: rowPath(row), views: rowMetric(row) }))
    .filter((row) => row.path)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const state = readState();
  const alerts = [];

  if (currentViews >= options.minViews && change >= options.spikePct) {
    alerts.push(`traffic spike: ${currentViews} views in the last ${options.hours}h, up ${Math.round(change)}% vs previous window`);
  }

  if (previousViews >= options.minViews && change <= -options.dropPct) {
    alerts.push(`traffic drop: ${currentViews} views in the last ${options.hours}h, down ${Math.abs(Math.round(change))}% vs previous window`);
  }

  for (const page of watchedRaw) {
    const previous = state.watched?.[page.requestPath]?.count || 0;
    const watchedChange = pctChange(page.count, previous);
    if (page.count >= options.minViews && watchedChange >= options.spikePct) {
      alerts.push(`${page.requestPath} is moving: ${page.count} views, up ${Math.round(watchedChange)}% since the last monitor snapshot`);
    }
  }

  writeState({
    checkedAt: iso(now),
    hours: options.hours,
    totalViews: currentViews,
    previousViews,
    topPages,
    watched: Object.fromEntries(watchedRaw.map((page) => [page.requestPath, { count: page.count }])),
  });

  const lines = [
    `Vercel analytics: ${currentViews} views in the last ${options.hours}h (${previousViews} previous, ${Math.round(change)}%).`,
  ];

  if (topPages.length) {
    lines.push(`Top pages: ${topPages.map((page) => `${page.path} ${page.views}`).join('; ')}`);
  }

  const watchedSummary = watchedRaw.map((page) => `${page.requestPath} ${page.count}`).join('; ');
  if (watchedSummary) lines.push(`Watched pages: ${watchedSummary}`);

  if (options.mode === 'report') {
    console.log(lines.join('\n'));
    return;
  }

  if (alerts.length) {
    console.log(`ALERT: ${alerts.join(' | ')}\n${lines.join('\n')}`);
  } else {
    console.log(`SILENT: ${lines[0]}`);
  }
}

main().catch((err) => {
  console.log(`BLOCKED: ${err.message}`);
  process.exit(1);
});
