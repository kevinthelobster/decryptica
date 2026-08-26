#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.env.WORKSPACE || '/Users/kevinsimac/.openclaw/workspace/decryptica';
const CANDIDATES_FILE = path.join(ROOT, 'data', 'kwr', 'keyword_candidates.json');
const DAILY_ARTICLE_LIMIT = Number.parseInt(process.env.DAILY_ARTICLE_LIMIT || '3', 10);
const CATEGORIES = ['crypto', 'ai', 'automation'];
const MIN_READY_PER_CATEGORY = Number.parseInt(process.env.KWR_MIN_READY_PER_CATEGORY || String(Math.max(DAILY_ARTICLE_LIMIT * 2, 6)), 10);
const MIN_READY_TOTAL = Number.parseInt(
  process.env.KWR_MIN_READY_TOTAL || String(Math.max(MIN_READY_PER_CATEGORY * CATEGORIES.length, DAILY_ARTICLE_LIMIT * 12)),
  10
);
const MAX_GENERATED_AGE_HOURS = Number.parseInt(process.env.KWR_MAX_GENERATED_AGE_HOURS || '36', 10);
const TARGET_LIMIT = String(process.env.KWR_CANDIDATE_LIMIT || '180');
const TARGET_MAX_PER_CLUSTER = String(process.env.KWR_MAX_PER_CLUSTER || '4');

function loadPayload() {
  if (!fs.existsSync(CANDIDATES_FILE)) {
    return { generatedAt: null, candidates: [] };
  }

  const parsed = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf-8'));
  return {
    generatedAt: parsed.generatedAt || null,
    candidates: Array.isArray(parsed.candidates) ? parsed.candidates : []
  };
}

function summarizeInventory(payload) {
  const readyUnused = payload.candidates.filter((candidate) => !candidate.usedAt && (!candidate.status || candidate.status === 'ready'));
  const perCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  const perCluster = Object.fromEntries(CATEGORIES.map((category) => [category, new Set()]));

  for (const candidate of readyUnused) {
    const category = CATEGORIES.includes(candidate.category) ? candidate.category : null;
    if (!category) continue;
    perCategory[category] += 1;
    perCluster[category].add(candidate.topicCluster || 'general');
  }

  const generatedAtMs = payload.generatedAt ? Date.parse(payload.generatedAt) : Number.NaN;
  const generatedAgeHours = Number.isFinite(generatedAtMs)
    ? (Date.now() - generatedAtMs) / (1000 * 60 * 60)
    : null;

  return {
    totalReadyUnused: readyUnused.length,
    perCategory,
    perCluster: Object.fromEntries(CATEGORIES.map((category) => [category, perCluster[category].size])),
    generatedAt: payload.generatedAt || null,
    generatedAgeHours
  };
}

function getRefreshReasons(summary) {
  const reasons = [];

  if (summary.totalReadyUnused < MIN_READY_TOTAL) {
    reasons.push(`total reserve ${summary.totalReadyUnused} < ${MIN_READY_TOTAL}`);
  }

  for (const category of CATEGORIES) {
    if (summary.perCategory[category] < MIN_READY_PER_CATEGORY) {
      reasons.push(`${category} reserve ${summary.perCategory[category]} < ${MIN_READY_PER_CATEGORY}`);
    }
  }

  if (summary.generatedAgeHours !== null && summary.generatedAgeHours > MAX_GENERATED_AGE_HOURS) {
    reasons.push(`inventory age ${summary.generatedAgeHours.toFixed(1)}h > ${MAX_GENERATED_AGE_HOURS}h`);
  }

  return reasons;
}

function formatSummary(summary) {
  const age = summary.generatedAgeHours === null ? 'unknown' : `${summary.generatedAgeHours.toFixed(1)}h`;
  return [
    `total=${summary.totalReadyUnused}`,
    `crypto=${summary.perCategory.crypto}/${summary.perCluster.crypto} clusters`,
    `ai=${summary.perCategory.ai}/${summary.perCluster.ai} clusters`,
    `automation=${summary.perCategory.automation}/${summary.perCluster.automation} clusters`,
    `age=${age}`
  ].join(', ');
}

function runRefresh() {
  execFileSync('node', ['scripts/kwr_pull_fresh_lists.js'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      WORKSPACE: ROOT,
      KWR_CANDIDATE_LIMIT: TARGET_LIMIT,
      KWR_MAX_PER_CLUSTER: TARGET_MAX_PER_CLUSTER,
      KWR_SKIP_SERP: process.env.KWR_SKIP_SERP || '1',
      KWR_PULL_MAX_QUERIES: process.env.KWR_PULL_MAX_QUERIES || '84'
    }
  });
}

function main() {
  const before = summarizeInventory(loadPayload());
  console.log(`[KWR Capacity] Before: ${formatSummary(before)}`);
  const refreshReasons = getRefreshReasons(before);

  if (refreshReasons.length === 0) {
    console.log('[KWR Capacity] Inventory healthy; no refresh needed.');
    return;
  }

  console.log(`[KWR Capacity] Refresh required: ${refreshReasons.join('; ')}`);
  console.log('[KWR Capacity] Inventory low; refreshing keyword candidates before article generation.');
  runRefresh();

  const after = summarizeInventory(loadPayload());
  console.log(`[KWR Capacity] After: ${formatSummary(after)}`);

  const remainingReasons = getRefreshReasons(after);
  if (remainingReasons.length > 0) {
    throw new Error(`Keyword candidate inventory still low after refresh (${remainingReasons.join('; ')} | ${formatSummary(after)})`);
  }
}

main();
