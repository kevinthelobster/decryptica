#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.env.WORKSPACE || '/Users/kevinsimac/.openclaw/workspace/decryptica';
const SEEDS_FILE = path.join(ROOT, 'data', 'kwr', 'seeds.json');
const IMPORT_DIR = path.join(ROOT, 'data', 'kwr', 'imports');
const MAX_FILES = 30;

const QUERY_TEMPLATES = [
  (seed) => seed,
  (seed) => `best ${seed} tools`,
  (seed) => `${seed} for beginners`,
  (seed) => `${seed} review`,
  (seed) => `${seed} pricing`,
  (seed) => `${seed} alternatives`,
  (seed) => `how to use ${seed}`
];

function timestampStamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

function normalizeKeyword(keyword) {
  return keyword.trim().replace(/\s+/g, ' ').toLowerCase();
}

function csvEscape(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadSeeds() {
  return JSON.parse(fs.readFileSync(SEEDS_FILE, 'utf-8'));
}

async function fetchJsonWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; DecrypticaKWRHarvester/1.0)'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function buildQueries(category, seeds) {
  const queries = [];
  for (const seed of seeds) {
    for (const buildQuery of QUERY_TEMPLATES) {
      queries.push({ category, seed, query: buildQuery(seed) });
    }
  }
  return queries;
}

async function fetchGoogleSuggestions(query) {
  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'firefox');
  url.searchParams.set('q', query);

  const payload = await fetchJsonWithTimeout(url);
  return Array.isArray(payload[1]) ? payload[1] : [];
}

async function fetchBingSuggestions(query) {
  const url = new URL('https://api.bing.com/osjson.aspx');
  url.searchParams.set('query', query);

  const payload = await fetchJsonWithTimeout(url);
  return Array.isArray(payload[1]) ? payload[1] : [];
}

function pickType(keyword) {
  const lower = keyword.toLowerCase();
  if (/\bvs\b|\bversus\b|\bcompare\b|\bcomparison\b/.test(lower)) return 'comparison';
  if (/\bhow\b|\bwhat\b|\bwhy\b|\bwhen\b/.test(lower)) return 'question';
  if (/\bfor\b|\bwithout\b|\bwith\b|\bnear\b/.test(lower)) return 'preposition';
  return 'suggestion';
}

function trimOldImports() {
  if (!fs.existsSync(IMPORT_DIR)) return;
  const files = fs.readdirSync(IMPORT_DIR)
    .filter((name) => name.endsWith('.csv'))
    .map((name) => ({
      name,
      path: path.join(IMPORT_DIR, name),
      mtime: fs.statSync(path.join(IMPORT_DIR, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const file of files.slice(MAX_FILES)) {
    fs.unlinkSync(file.path);
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  ensureDir(IMPORT_DIR);
  const seeds = loadSeeds();
  const allQueries = Object.entries(seeds).flatMap(([category, values]) => buildQueries(category, values));
  const byKeyword = new Map();
  const fetchers = [
    { sourceEngine: 'google-autocomplete', fetchSuggestions: fetchGoogleSuggestions },
    { sourceEngine: 'bing-autocomplete', fetchSuggestions: fetchBingSuggestions }
  ];

  for (const item of allQueries) {
    for (const fetcher of fetchers) {
      try {
        const suggestions = await fetcher.fetchSuggestions(item.query);
        for (const suggestion of suggestions) {
          const normalized = normalizeKeyword(suggestion);
          if (!normalized || normalized.length < 8) continue;
          if (!byKeyword.has(normalized)) {
            byKeyword.set(normalized, {
              keyword: normalized,
              category: item.category,
              sourceSeed: item.seed,
              sourceQuery: item.query,
              sourceEngine: fetcher.sourceEngine,
              type: pickType(normalized),
              fetchedAt: new Date().toISOString()
            });
            continue;
          }

          const existing = byKeyword.get(normalized);
          const engines = new Set(String(existing.sourceEngine || '').split('|').filter(Boolean));
          engines.add(fetcher.sourceEngine);
          existing.sourceEngine = Array.from(engines).sort().join('|');
          if (!existing.sourceQuery.includes(item.query)) {
            existing.sourceQuery = `${existing.sourceQuery} | ${item.query}`;
          }
          if (!existing.sourceSeed.includes(item.seed)) {
            existing.sourceSeed = `${existing.sourceSeed} | ${item.seed}`;
          }
        }
      } catch (error) {
        console.warn(`[KWR Pull] Failed ${fetcher.sourceEngine} query "${item.query}": ${error.message}`);
      }
      await sleep(150);
    }
  }

  const rows = Array.from(byKeyword.values()).sort((a, b) => a.keyword.localeCompare(b.keyword));
  const outputFile = path.join(IMPORT_DIR, `autocomplete_${timestampStamp()}.csv`);
  const header = ['Keyword', 'Category', 'Type', 'Source Seed', 'Source Query', 'Source Engine', 'Fetched At'];
  const lines = [header.join(',')];

  for (const row of rows) {
    lines.push([
      row.keyword,
      row.category,
      row.type,
      row.sourceSeed,
      row.sourceQuery,
      row.sourceEngine,
      row.fetchedAt
    ].map(csvEscape).join(','));
  }

  fs.writeFileSync(outputFile, `${lines.join('\n')}\n`);
  trimOldImports();

  console.log(`[KWR Pull] Wrote ${rows.length} keywords to ${outputFile}`);

  execFileSync('node', ['scripts/kwr_build_candidates.js', '--limit', '20'], {
    cwd: ROOT,
    stdio: 'inherit'
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`[KWR Pull] Fatal: ${error.message}`);
    process.exit(1);
  });
