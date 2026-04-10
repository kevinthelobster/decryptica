#!/usr/bin/env node
/**
 * SEO Daily Checkpoint Report Generator
 * Generates a structured SEO telemetry checkpoint report from Vercel KV data.
 *
 * Usage: node scripts/seo_daily_checkpoint.js [YYYY-MM-DD]
 * Cron example: 0 8 * * * (every day at 8am Eastern)
 *
 * Part of DEC-111: SEO instrumentation and ranking telemetry
 */

const { kv } = require('@vercel/kv');

const SEO_KV = {
  checkpointKey: (date) => `seo:checkpoint:${date}`,
};

const CWV_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  ttfb: { good: 800, needsImprovement: 1800 },
  fcp: { good: 1800, needsImprovement: 3000 },
};

// ─── KV Helpers ───────────────────────────────────────────────────────────────

async function getOr0(key) {
  const v = await kv.get(key).catch(() => null);
  return (v ?? 0);
}

async function getSetMembers(key) {
  const result = await kv.zrange(key, 0, -1).catch(() => []);
  return result ?? [];
}

async function getCheckpoint(date) {
  const key = `seo:checkpoint:${date}`;
  const raw = await kv.get(key).catch(() => null);
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectTemplateFromUrl(url) {
  if (url === '/' || url === '') return 'home';
  if (url.startsWith('/topic/')) return 'topic';
  if (url.startsWith('/blog/')) return 'article';
  if (url === '/blog') return 'blog-list';
  if (url.startsWith('/tools')) return 'tools';
  if (url === '/about') return 'about';
  if (url === '/contact') return 'contact';
  if (url === '/privacy') return 'privacy';
  if (url.startsWith('/prompts')) return 'prompts';
  if (url.startsWith('/builds')) return 'builds';
  if (url.startsWith('/toolbox')) return 'toolbox';
  return 'article';
}

function rateCwv(metric, value) {
  if (value <= CWV_THRESHOLDS[metric].good) return 'good';
  if (value <= CWV_THRESHOLDS[metric].needsImprovement) return 'needs-improvement';
  return 'poor';
}

function computeCwvScore(cwv) {
  const lcpScore = Math.max(0, 1 - cwv.lcp / 5000) * 25;
  const fidScore = Math.max(0, 1 - cwv.fid / 500) * 25;
  const clsScore = Math.max(0, 1 - cwv.cls / 0.5) * 25;
  const ttfbScore = Math.max(0, 1 - cwv.ttfb / 3000) * 12.5;
  const fcpScore = Math.max(0, 1 - cwv.fcp / 4000) * 12.5;
  return Math.round(lcpScore + fidScore + clsScore + ttfbScore + fcpScore);
}

function getDateRange(days) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ─── Main Report Generator ───────────────────────────────────────────────────

async function generateDailyReport(date) {
  console.log(`[SEO Checkpoint] Generating report for ${date}...`);

  const report = {
    generatedAt: new Date().toISOString(),
    date,
    summary: {
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      totalArticles: 0,
      avgCwvScore: 0,
      pagesAboveCwvThreshold: 0,
      totalIndexedPages: 0,
      totalTrackedKeywords: 0,
      keywordsInTop10: 0,
      keywordsInTop3: 0,
      avgSearchRanking: 0,
    },
    byCategory: [],
    topPages: [],
    cwvBreakdown: [],
    rankingChanges: [],
    indexationStatus: { totalUrls: 0, indexed: 0, notIndexed: 0, indexRate: 0 },
  };

  // ── 1. Category page view totals ──────────────────────────────────────────
  const categories = ['crypto', 'ai', 'automation'];
  const catMetrics = [];

  for (const cat of categories) {
    const pvKey = `seo:cat:pv:${date}:${cat}`;
    const pageViews = await getOr0(pvKey);
    catMetrics.push({ category: cat, pageViews, articles: 0, avgCwvScore: 0 });
    report.summary.totalPageViews += pageViews;
  }
  report.byCategory = catMetrics;

  // ── 2. Top pages by page views ─────────────────────────────────────────────
  try {
    const allKeys = await kv.keys(`seo:pv:${date}:*`).catch(() => []);
    const pvKeys = allKeys.slice(0, 50);

    const pageMetrics = [];
    for (const key of pvKeys) {
      const url = key.replace(`seo:pv:${date}:`, '');
      const pv = await getOr0(key);
      const uv = await kv.scard(`seo:uv:${date}:${url}`).catch(() => 0);
      const lcpP75 = await getPercentileFromSet(`seo:cwv:set:${date}:${url}:lcp`, 75);

      pageMetrics.push({
        url,
        pageViews: pv,
        uniqueVisitors: uv,
        articleSlug: url.startsWith('/blog/') ? url.replace('/blog/', '') : undefined,
        lcpP75: lcpP75 ? Math.round(lcpP75) : undefined,
      });
    }

    pageMetrics.sort((a, b) => b.pageViews - a.pageViews);
    report.topPages = pageMetrics.slice(0, 10).map((pm) => ({
      url: pm.url,
      slug: pm.articleSlug,
      pageViews: pm.pageViews,
      cwvScore: pm.lcpP75 ? computeCwvScore({ lcp: pm.lcpP75, fid: 0, cls: 0, ttfb: 0, fcp: 0 }) : undefined,
    }));
  } catch (err) {
    console.warn('[SEO Checkpoint] Could not fetch top pages:', err.message || err);
  }

  // ── 3. CWV breakdown across all pages ─────────────────────────────────────
  const metricNames = ['lcp', 'fid', 'cls', 'ttfb', 'fcp'];
  const cwvBreakdown = [];

  for (const metric of metricNames) {
    try {
      const allSetKeys = await kv.keys(`seo:cwv:set:${date}:*:${metric}`).catch(() => []);
      let allValues = [];
      let goodCount = 0;
      let needsImproveCount = 0;
      let poorCount = 0;

      for (const setKey of allSetKeys) {
        const values = await getSetMembers(setKey);
        for (const v of values) {
          const num = parseFloat(v);
          if (isNaN(num)) continue;
          allValues.push(num);
          const rating = rateCwv(metric, num);
          if (rating === 'good') goodCount++;
          else if (rating === 'needs-improvement') needsImproveCount++;
          else poorCount++;
        }
      }

      if (allValues.length > 0) {
        allValues.sort((a, b) => a - b);
        const p50 = allValues[Math.floor(allValues.length * 0.5)] ?? 0;
        const p75 = allValues[Math.floor(allValues.length * 0.75)] ?? 0;
        const p95 = allValues[Math.floor(allValues.length * 0.95)] ?? 0;
        const totalCount = allValues.length;

        cwvBreakdown.push({
          metric,
          p50: Math.round(p50),
          p75: Math.round(p75),
          p95: Math.round(p95),
          goodPct: +((goodCount / totalCount) * 100).toFixed(1),
          needsImprovementPct: +((needsImproveCount / totalCount) * 100).toFixed(1),
          poorPct: +((poorCount / totalCount) * 100).toFixed(1),
        });
      }
    } catch (err) {
      console.warn(`[SEO Checkpoint] Could not fetch CWV metric ${metric}:`, err.message || err);
    }
  }
  report.cwvBreakdown = cwvBreakdown;

  // ── 4. Summary calculations ────────────────────────────────────────────────
  if (cwvBreakdown.length > 0) {
    const avgScore = cwvBreakdown.reduce((sum, m) => sum + m.goodPct, 0) / cwvBreakdown.length;
    report.summary.avgCwvScore = Math.round(avgScore);

    const lcpMetric = cwvBreakdown.find((m) => m.metric === 'lcp');
    if (lcpMetric) {
      const totalPages = report.topPages.length;
      report.summary.pagesAboveCwvThreshold = Math.round((lcpMetric.goodPct / 100) * totalPages);
    }
  }

  // ── 5. Indexation status ───────────────────────────────────────────────────
  try {
    const indexed = await getOr0(`seo:idx:status:${date}:indexed`);
    const notIndexed = await getOr0(`seo:idx:status:${date}:not_indexed`);
    report.indexationStatus = {
      totalUrls: indexed + notIndexed,
      indexed,
      notIndexed,
      indexRate: indexed + notIndexed > 0 ? +(indexed / (indexed + notIndexed)).toFixed(3) : 0,
    };
    report.summary.totalIndexedPages = indexed;
  } catch (err) {
    console.warn('[SEO Checkpoint] Could not fetch indexation status:', err.message || err);
  }

  // ── 6. Ranking changes ─────────────────────────────────────────────────────
  try {
    const rankKeys = await kv.keys('seo:rank:history:*').catch(() => []);
    const changes = [];
    let top10Count = 0;
    let top3Count = 0;
    let totalPosition = 0;
    let validRankCount = 0;

    for (const histKey of rankKeys.slice(0, 100)) {
      const historyRaw = await kv.lrange(histKey, 0, 1).catch(() => []);
      if (!historyRaw || historyRaw.length < 2) continue;

      let current = {};
      let previous = {};
      try {
        current = typeof historyRaw[0] === 'string' ? JSON.parse(historyRaw[0]) : historyRaw[0];
        previous = typeof historyRaw[1] === 'string' ? JSON.parse(historyRaw[1]) : historyRaw[1];
      } catch {
        continue;
      }

      if (current.position === undefined || previous.position === undefined) continue;
      if (current.position === previous.position) continue;

      const keyword = histKey.replace('seo:rank:history:', '');
      const change = previous.position - current.position;
      changes.push({
        keyword,
        articleSlug: current.articleSlug || '',
        previousPosition: previous.position,
        currentPosition: current.position,
        change,
        changeType: previous.position === 0 ? 'new' : change > 0 ? 'improved' : 'declined',
      });

      if (current.position <= 10) top10Count++;
      if (current.position <= 3) top3Count++;
      totalPosition += current.position;
      validRankCount++;
    }

    changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    report.rankingChanges = changes.slice(0, 20);
    report.summary.totalTrackedKeywords = rankKeys.length;
    report.summary.keywordsInTop10 = top10Count;
    report.summary.keywordsInTop3 = top3Count;
    report.summary.avgSearchRanking = validRankCount > 0 ? Math.round(totalPosition / validRankCount) : 0;
  } catch (err) {
    console.warn('[SEO Checkpoint] Could not fetch ranking changes:', err.message || err);
  }

  // ── 7. Save checkpoint report ───────────────────────────────────────────────
  try {
    const checkpointKey = SEO_KV.checkpointKey(date);
    await kv.set(checkpointKey, JSON.stringify(report), { ex: 365 * 24 * 60 * 60 });
    console.log(`[SEO Checkpoint] Report saved to ${checkpointKey}`);
  } catch (err) {
    console.warn('[SEO Checkpoint] Could not save report to KV:', err.message || err);
  }

  return report;
}

async function getPercentileFromSet(setKey, p) {
  try {
    const count = await kv.zcard(setKey).catch(() => 0);
    if (!count || count === 0) return null;
    const rank = Math.ceil((p / 100) * count) - 1;
    const result = await kv.zrange(setKey, rank, rank).catch(() => []);
    if (!result || result.length === 0) return null;
    const raw = Array.isArray(result) ? result[0] : result;
    const num = parseFloat(String(raw));
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────

const date = process.argv[2] || new Date().toISOString().split('T')[0];

generateDailyReport(date)
  .then((report) => {
    console.log('\n=== SEO Daily Checkpoint Report ===');
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('[SEO Checkpoint] Fatal error:', err);
    process.exit(1);
  });
