#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.env.WORKSPACE || '/Users/kevinsimac/.openclaw/workspace/decryptica';
const OUTPUT_FILE = path.join(ROOT, 'data', 'kwr', 'keyword_candidates.json');
const REPORT_FILE = path.join(ROOT, 'data', 'kwr', 'keyword_candidates.md');
const DEFAULT_IMPORT_DIR = path.join(ROOT, 'data', 'kwr', 'imports');

const WEAK_DOMAINS = new Set([
  'reddit.com',
  'www.reddit.com',
  'quora.com',
  'www.quora.com',
  'medium.com',
  'www.medium.com',
  'youtube.com',
  'www.youtube.com',
  'github.com',
  'www.github.com',
  'stackoverflow.com',
  'www.stackoverflow.com',
  'substack.com',
  'www.substack.com'
]);

const STRONG_DOMAINS = new Set([
  'ahrefs.com',
  'www.ahrefs.com',
  'semrush.com',
  'www.semrush.com',
  'investopedia.com',
  'www.investopedia.com',
  'forbes.com',
  'www.forbes.com',
  'nerdwallet.com',
  'www.nerdwallet.com',
  'cointelegraph.com',
  'www.cointelegraph.com',
  'coindesk.com',
  'www.coindesk.com',
  'zapier.com',
  'www.zapier.com',
  'openai.com',
  'www.openai.com',
  'hubspot.com',
  'www.hubspot.com'
]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function titleCaseWords(input) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createTitleFromKeyword(keyword, category) {
  const normalized = keyword.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  if (lower.startsWith('best ')) return `${titleCaseWords(normalized)}: What Actually Matters in 2026`;
  if (lower.startsWith('how ')) return `${titleCaseWords(normalized)}: What Actually Works in 2026`;
  if (lower.startsWith('what ')) return `${titleCaseWords(normalized)}: A Practical 2026 Guide`;
  if (lower.startsWith('why ')) return `${titleCaseWords(normalized)}: The Real Answer in 2026`;
  if (lower.includes(' vs ')) return `${titleCaseWords(normalized)}: Which One Makes More Sense in 2026?`;

  const suffix = category === 'crypto'
    ? 'What the Market Gets Wrong in 2026'
    : category === 'ai'
      ? 'What Actually Matters in 2026'
      : 'A Practical 2026 Guide';
  return `${titleCaseWords(normalized)}: ${suffix}`;
}

function normalizeKeyword(keyword) {
  return keyword.trim().replace(/\s+/g, ' ').toLowerCase();
}

function slugify(keyword) {
  return normalizeKeyword(keyword).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[$,]/g, '').trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map((cell) => cell.trim());
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] || '').trim();
    });
    return record;
  });
}

function pickField(record, names) {
  const lowered = Object.fromEntries(Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]));
  for (const name of names) {
    if (lowered[name.toLowerCase()] !== undefined && lowered[name.toLowerCase()] !== '') {
      return lowered[name.toLowerCase()];
    }
  }
  return null;
}

function inferCategory(keyword, fallbackCategory) {
  if (fallbackCategory) return fallbackCategory;
  const lower = keyword.toLowerCase();
  if (/bitcoin|ethereum|solana|crypto|defi|wallet|token|nft|on-chain|blockchain/.test(lower)) return 'crypto';
  if (/ai|chatgpt|claude|llm|prompt|agent|midjourney|cursor|copilot/.test(lower)) return 'ai';
  return 'automation';
}

function inferTopicCluster(keyword, category, sourceSeed) {
  const lower = normalizeKeyword(keyword);
  const seed = normalizeKeyword(sourceSeed || '');
  const match = (pattern) => pattern.test(lower) || pattern.test(seed);

  if (category === 'crypto') {
    if (match(/\bbitcoin\b|\bbtc\b|\betf\b/)) return 'bitcoin';
    if (match(/\bethereum\b|\beth\b/)) return 'ethereum';
    if (match(/\bsolana\b|\bsol\b/)) return 'solana';
    if (match(/\bdefi\b|\bdex\b|\bamm\b|\bliquidity\b/)) return 'defi';
    if (match(/\btax\b/)) return 'crypto-tax';
    if (match(/\bwallet\b|\bledger\b|\btrezor\b/)) return 'wallets';
    if (match(/\bportfolio\b|\btracker\b|\bon-chain analytics\b|\banalytics\b/)) return 'portfolio-analytics';
    if (match(/\bnft\b|\bweb3\b|\btoken\b|\bblockchain\b/)) return 'web3';
    return 'crypto-general';
  }

  if (category === 'ai') {
    if (match(/\bagents?\b/)) return 'ai-agents';
    if (match(/\bcoding\b|\bcode\b|\bcursor\b|\bcopilot\b|\bwindsurf\b/)) return 'ai-coding';
    if (match(/\bllm\b|\bmodel\b|\bapi\b|\brag\b/)) return 'llm-stack';
    if (match(/\bchatgpt\b|\bclaude\b|\bassistant\b/)) return 'chat-assistants';
    if (match(/\bimage\b|\bart\b|\bmidjourney\b|\bstable diffusion\b/)) return 'ai-image';
    if (match(/\bprompt\b/)) return 'prompting';
    if (match(/\bautomation\b|\bworkflow\b/)) return 'ai-automation';
    return 'ai-general';
  }

  if (match(/\bworkflow\b|\bprocess\b|\borchestration\b/)) return 'workflow-ops';
  if (match(/\bzapier\b|\bmake\b|\bn8n\b|\bintegration\b/)) return 'integration-tools';
  if (match(/\bapi\b|\bmonitoring\b|\bwebhook\b/)) return 'api-ops';
  if (match(/\binternal tools?\b|\bback office\b/)) return 'internal-tools';
  if (match(/\bno code\b|\bno-code\b|\bbubble\b/)) return 'no-code';
  if (match(/\bbusiness\b|\bteam\b|\bproductivity\b/)) return 'business-automation';
  return 'automation-general';
}

function scoreIntent(keyword) {
  const lower = keyword.toLowerCase();
  let score = 0;
  if (/\b(best|top|vs|versus|alternative|alternatives|software|tool|tools|app|apps)\b/.test(lower)) score += 18;
  if (/\bfor\b/.test(lower)) score += 16;
  if (/\bhow\b|\bwhat\b|\bwhy\b/.test(lower)) score += 8;
  if (/\bsmall\b|\bbeginner\b|\bcheap\b|\blow cost\b|\bfree\b|\bwithout\b/.test(lower)) score += 10;
  if (/\bcrypto\b|\bai\b|\bautomation\b|\bdefi\b|\bagent\b/.test(lower)) score += 6;
  return Math.min(score, 40);
}

function scoreMonetization(keyword, cpc) {
  const lower = keyword.toLowerCase();
  let score = 0;

  if (/\b(best|top|vs|versus|alternative|alternatives|compare|comparison)\b/.test(lower)) score += 16;
  if (/\bsoftware\b|\btool\b|\btools\b|\bplatform\b|\bapp\b|\bapps\b|\bservice\b/.test(lower)) score += 16;
  if (/\bfor\b/.test(lower)) score += 12;
  if (/\bpricing\b|\bprice\b|\bcost\b|\breview\b|\breviews\b/.test(lower)) score += 10;
  if (/\bsmall business\b|\bbeginners?\b|\bcreators?\b|\bfreelancers?\b|\binvestors?\b|\btraders?\b/.test(lower)) score += 10;
  if (/\bwallet\b|\btax\b|\btracker\b|\bportfolio\b|\bapi\b|\bworkflow\b|\bautomation\b/.test(lower)) score += 8;
  if (/\bfree\b/.test(lower)) score -= 4;

  if (cpc !== null) {
    if (cpc >= 5) score += 10;
    else if (cpc >= 2) score += 6;
  }

  return Math.max(0, Math.min(score, 50));
}

function scoreVolume(volume) {
  if (volume === null) return 8;
  if (volume >= 20 && volume <= 250) return 22;
  if (volume > 250 && volume <= 1000) return 18;
  if (volume >= 10 && volume < 20) return 16;
  if (volume > 1000 && volume <= 3000) return 10;
  if (volume < 10) return 6;
  return 4;
}

function scoreCpc(cpc) {
  if (cpc === null) return 4;
  if (cpc >= 4) return 14;
  if (cpc >= 2) return 10;
  if (cpc >= 0.75) return 6;
  return 2;
}

function scoreLength(keyword) {
  const words = normalizeKeyword(keyword).split(' ').filter(Boolean).length;
  if (words >= 4 && words <= 8) return 14;
  if (words === 3 || words === 9) return 10;
  if (words >= 10) return 8;
  return 3;
}

function classifyDomain(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (WEAK_DOMAINS.has(domain)) return 'weak';
    if (STRONG_DOMAINS.has(domain)) return 'strong';
    return 'neutral';
  } catch {
    return 'neutral';
  }
}

function decodeDuckDuckGoUrl(url) {
  try {
    const parsed = new URL(url, 'https://duckduckgo.com');
    const actual = parsed.searchParams.get('uddg');
    return actual ? decodeURIComponent(actual) : parsed.toString();
  } catch {
    return url;
  }
}

async function fetchSerpProfile(keyword) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let html;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; DecrypticaKWR/1.0)'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo returned ${response.status}`);
    }

    html = await response.text();
  } finally {
    clearTimeout(timeout);
  }
  const matches = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const results = matches.slice(0, 8).map((match) => {
    const rawUrl = match[1];
    const resultUrl = decodeDuckDuckGoUrl(rawUrl);
    const title = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return {
      title,
      url: resultUrl,
      strength: classifyDomain(resultUrl)
    };
  });

  const weakCount = results.filter((result) => result.strength === 'weak').length;
  const strongCount = results.filter((result) => result.strength === 'strong').length;
  const neutralCount = results.length - weakCount - strongCount;

  return {
    weakCount,
    strongCount,
    neutralCount,
    results
  };
}

function scoreSerp(profile) {
  if (!profile || !profile.results) return 0;
  return (profile.weakCount * 8) + (profile.neutralCount * 2) - (profile.strongCount * 6);
}

function buildReasoning(candidate) {
  const reasons = [];
  if (candidate.intentScore >= 20) reasons.push('strong commercial/problem-solving intent');
  if (candidate.monetizationScore >= 24) reasons.push('affiliate/comparison angle looks monetizable');
  if (candidate.volume !== null && candidate.volume <= 250) reasons.push('long-tail search volume range');
  if (candidate.cpc !== null && candidate.cpc >= 2) reasons.push('meaningful CPC signal');
  if (candidate.serp.weakCount >= 2) reasons.push('SERP has weaker community/content results');
  if (candidate.serp.strongCount === 0) reasons.push('no dominant authority domain in sampled results');
  return reasons;
}

function keywordThemeTokens(keyword) {
  const stopWords = new Set([
    'best', 'top', 'tool', 'tools', 'software', 'platform', 'app', 'apps', 'for', 'the', 'and', 'with', 'without',
    'review', 'reviews', 'pricing', 'price', 'cost', 'guide', 'vs', 'versus', 'what', 'how', 'why', 'which',
    'a', 'an', 'in', 'on', 'to', 'of', '2025', '2026'
  ]);

  return normalizeKeyword(keyword)
    .split(' ')
    .map((word) => word.replace(/[^a-z0-9]/g, ''))
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .map((word) => word.endsWith('s') ? word.slice(0, -1) : word);
}

function isNearDuplicateKeyword(candidate, selectedCandidates) {
  const candidateTokens = keywordThemeTokens(candidate.keyword);
  if (!candidateTokens.length) return false;

  return selectedCandidates.some((selected) => {
    if (selected.category !== candidate.category) return false;

    const selectedTokens = keywordThemeTokens(selected.keyword);
    const sharedCount = candidateTokens.filter((token) => selectedTokens.includes(token)).length;
    const minLength = Math.min(candidateTokens.length, selectedTokens.length);

    return minLength >= 2 && sharedCount >= minLength - 1;
  });
}

function isUsefulKeyword(keyword) {
  const normalized = normalizeKeyword(keyword);
  const words = normalized.split(' ').filter(Boolean);

  if (normalized.length < 8) return false;
  if (words.length < 3 || words.length > 12) return false;
  if (/[()\[\]]/.test(keyword)) return false;
  if (/\breddit\b|\bgithub\b|\bpdf\b|\bjobs?\b|\bsalary\b|\bcourse\b|\byoutube\b|\btiktok\b|\bdownload\b|\bmicrosoft learn\b|\bnear me\b/.test(normalized)) return false;

  return true;
}

function normalizeRecord(record, fallbackCategory, sourceFile) {
  const keyword = pickField(record, ['keyword', 'keywords', 'search term', 'search terms', 'question', 'query']);
  if (!keyword) return null;

  const normalizedKeyword = normalizeKeyword(keyword);
  if (!isUsefulKeyword(normalizedKeyword)) return null;

  const volume = parseNumber(pickField(record, ['search volume', 'volume', 'searches']));
  const cpc = parseNumber(pickField(record, ['cpc', 'cost per click']));
  const sourceType = pickField(record, ['type', 'modifier', 'report', 'branch']) || 'suggestion';
  const sourceEngine = pickField(record, ['source engine', 'engine', 'source']) || 'unknown';
  const sourceSeed = pickField(record, ['source seed', 'seed']) || '';
  const sourceQuery = pickField(record, ['source query', 'query']) || '';
  const category = inferCategory(keyword, fallbackCategory);

  return {
    keyword: normalizedKeyword,
    volume,
    cpc,
    sourceType,
    sourceEngine,
    sourceSeed,
    sourceQuery,
    category,
    sourceFile: path.basename(sourceFile)
  };
}

function loadExistingCandidates() {
  try {
    if (!fs.existsSync(OUTPUT_FILE)) return [];
    const parsed = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    return Array.isArray(parsed.candidates) ? parsed.candidates : [];
  } catch {
    return [];
  }
}

function parseInputFiles(inputArg) {
  if (inputArg) {
    return inputArg.split(',').map((entry) => entry.trim()).filter(Boolean);
  }

  if (!fs.existsSync(DEFAULT_IMPORT_DIR)) return [];
  return fs.readdirSync(DEFAULT_IMPORT_DIR)
    .filter((name) => name.toLowerCase().endsWith('.csv'))
    .map((name) => path.join(DEFAULT_IMPORT_DIR, name))
    .sort();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputFiles = parseInputFiles(args.input);
  const fallbackCategory = args.category || null;
  const limit = Number(args.limit || 20);

  if (!inputFiles.length) {
    throw new Error('No CSV inputs found. Put AnswerThePublic exports in data/kwr/imports or pass --input path/to/file.csv');
  }

  const existingCandidates = loadExistingCandidates();
  const existingByKeyword = new Map(existingCandidates.map((candidate) => [normalizeKeyword(candidate.keyword), candidate]));
  const rawCandidates = [];

  for (const file of inputFiles) {
    const csvText = fs.readFileSync(file, 'utf-8');
    const rows = parseCsv(csvText);
    for (const row of rows) {
      const normalized = normalizeRecord(row, fallbackCategory, file);
      if (normalized) rawCandidates.push(normalized);
    }
  }

  const uniqueKeywords = [];
  const seen = new Set();
  for (const candidate of rawCandidates) {
    if (seen.has(candidate.keyword)) continue;
    seen.add(candidate.keyword);
    uniqueKeywords.push(candidate);
  }

  const preScoredKeywords = uniqueKeywords.map((candidate) => {
    const intentScore = scoreIntent(candidate.keyword);
    const monetizationScore = scoreMonetization(candidate.keyword, candidate.cpc);
    const volumeScore = scoreVolume(candidate.volume);
    const cpcScore = scoreCpc(candidate.cpc);
    const lengthScore = scoreLength(candidate.keyword);

    return {
      ...candidate,
      topicCluster: inferTopicCluster(candidate.keyword, candidate.category, candidate.sourceSeed),
      intentScore,
      monetizationScore,
      volumeScore,
      cpcScore,
      lengthScore,
      baseOpportunityScore: intentScore + monetizationScore + volumeScore + cpcScore + lengthScore
    };
  });

  preScoredKeywords.sort((a, b) => {
    if (b.baseOpportunityScore !== a.baseOpportunityScore) return b.baseOpportunityScore - a.baseOpportunityScore;
    const volumeA = a.volume === null ? Number.MAX_SAFE_INTEGER : a.volume;
    const volumeB = b.volume === null ? Number.MAX_SAFE_INTEGER : b.volume;
    return volumeA - volumeB;
  });

  const serpCandidatePoolSize = Math.max(limit * 4, 80);
  const selectedKeywords = preScoredKeywords.slice(0, serpCandidatePoolSize);
  const builtCandidates = [];

  for (const candidate of selectedKeywords) {
    let serp = { weakCount: 0, strongCount: 0, neutralCount: 0, results: [] };
    try {
      serp = await fetchSerpProfile(candidate.keyword);
    } catch (error) {
      console.warn(`[KWR] SERP fetch failed for "${candidate.keyword}": ${error.message}`);
    }

    const intentScore = candidate.intentScore;
    const monetizationScore = candidate.monetizationScore;
    const volumeScore = candidate.volumeScore;
    const cpcScore = candidate.cpcScore;
    const lengthScore = candidate.lengthScore;
    const serpScore = scoreSerp(serp);
    const opportunityScore = intentScore + monetizationScore + volumeScore + cpcScore + lengthScore + serpScore;
    const previous = existingByKeyword.get(candidate.keyword) || {};

    const built = {
      id: previous.id || slugify(candidate.keyword),
      keyword: candidate.keyword,
      category: candidate.category,
      volume: candidate.volume,
      cpc: candidate.cpc,
      source: candidate.sourceEngine,
      sourceType: candidate.sourceType,
      sourceSeed: candidate.sourceSeed,
      sourceQuery: candidate.sourceQuery,
      sourceFile: candidate.sourceFile,
      topicCluster: candidate.topicCluster,
      suggestedTitle: previous.suggestedTitle || createTitleFromKeyword(candidate.keyword, candidate.category),
      intentScore,
      monetizationScore,
      volumeScore,
      cpcScore,
      lengthScore,
      baseOpportunityScore: candidate.baseOpportunityScore,
      serpScore,
      opportunityScore,
      reasoning: buildReasoning({ ...candidate, serp, intentScore, monetizationScore }),
      serp,
      status: previous.status || 'ready',
      usedAt: previous.usedAt || null,
      usedBy: previous.usedBy || null,
      updatedAt: new Date().toISOString()
    };

    builtCandidates.push(built);
  }

  builtCandidates.sort((a, b) => b.opportunityScore - a.opportunityScore);

  const maxPerCluster = Math.max(1, Number(args['max-per-cluster'] || 2));
  const finalCandidates = [];
  const clusterCounts = new Map();
  const clusterOrder = [];

  for (const candidate of builtCandidates) {
    const clusterKey = `${candidate.category}:${candidate.topicCluster || 'general'}`;
    if (!clusterOrder.includes(clusterKey)) clusterOrder.push(clusterKey);
  }

  for (const clusterKey of clusterOrder) {
    const next = builtCandidates.find((candidate) => {
      const candidateClusterKey = `${candidate.category}:${candidate.topicCluster || 'general'}`;
      return candidateClusterKey === clusterKey && !finalCandidates.includes(candidate) && !isNearDuplicateKeyword(candidate, finalCandidates);
    });
    if (!next) continue;
    finalCandidates.push(next);
    clusterCounts.set(clusterKey, 1);
    if (finalCandidates.length >= limit) break;
  }

  for (const candidate of builtCandidates) {
    if (finalCandidates.length >= limit) break;
    if (finalCandidates.includes(candidate)) continue;
    if (isNearDuplicateKeyword(candidate, finalCandidates)) continue;
    const clusterKey = `${candidate.category}:${candidate.topicCluster || 'general'}`;
    const currentCount = clusterCounts.get(clusterKey) || 0;
    if (currentCount >= maxPerCluster) continue;
    finalCandidates.push(candidate);
    clusterCounts.set(clusterKey, currentCount + 1);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    sourceFiles: inputFiles.map((file) => path.basename(file)),
    clustering: {
      maxPerCluster,
      serpCandidatePoolSize
    },
    candidates: finalCandidates
  };

  ensureDir(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  const reportLines = [
    '# Decryptica Keyword Candidates',
    '',
    `Generated: ${output.generatedAt}`,
    `Sources: ${output.sourceFiles.join(', ')}`,
    '',
    '| Keyword | Category | Score | Volume | CPC | Notes |',
    '| --- | --- | ---: | ---: | ---: | --- |'
  ];

  for (const candidate of finalCandidates.slice(0, 25)) {
    const volume = candidate.volume === null ? 'n/a' : String(candidate.volume);
    const cpc = candidate.cpc === null ? 'n/a' : candidate.cpc.toFixed(2);
    const notes = candidate.reasoning.join('; ') || 'manual review needed';
    reportLines.push(`| ${candidate.keyword} | ${candidate.category}/${candidate.topicCluster} | ${candidate.opportunityScore} | ${volume} | ${cpc} | ${notes} |`);
  }

  ensureDir(REPORT_FILE);
  fs.writeFileSync(REPORT_FILE, `${reportLines.join('\n')}\n`);

  console.log(`[KWR] Scored ${builtCandidates.length} candidates from ${inputFiles.length} file(s)`);
  console.log(`[KWR] Selected ${finalCandidates.length} clustered candidates (max ${maxPerCluster} per cluster)`);
  console.log(`[KWR] JSON: ${OUTPUT_FILE}`);
  console.log(`[KWR] Report: ${REPORT_FILE}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`[KWR] Fatal: ${error.message}`);
    process.exit(1);
  });
