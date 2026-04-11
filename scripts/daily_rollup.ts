#!/usr/bin/env node
/**
 * Daily Revenue KPI Rollup — DEC-239
 *
 * Aggregates daily counters from Vercel KV into per-day rollup records
 * stored at data/kpi/daily/{YYYY-MM-DD}.json
 *
 * Run: npx ts-node scripts/daily_rollup.ts
 * Cron: 0 0 * * * (midnight Eastern — after UTC midnight when KV day closes)
 */

import * as fs from 'fs';
import * as path from 'path';

interface DailyRollup {
  date: string;
  generatedAt: string;
  pageViews: number;
  affiliateClicks: number;
  sponsorshipLeads: number;
  signups: number;
  subscribers: number;
  aiImpressions: number;
  cryptoImpressions: number;
  automationImpressions: number;
  revenueCents: number;
  byAffiliateProgram: Record<string, number>;
  byLeadType: Record<string, number>;
  topAffiliateArticles: Array<{ slug: string; clicks: number }>;
}

async function getCounter(key: string): Promise<number> {
  try {
    const { kv } = await import('@vercel/kv');
    const val = await (kv as any).get(key).catch(() => null);
    return (typeof val === 'number' ? val : 0);
  } catch {
    return 0;
  }
}

async function getAffiliatesForDate(date: string): Promise<Record<string, number>> {
  try {
    const { kv } = await import('@vercel/kv');
    const programs: Record<string, number> = {};
    // Known programs from affiliate-click handler
    const knownPrograms = ['amazon-associates', 'aesirx-affiliate', 'decentralized-id'];
    for (const prog of knownPrograms) {
      const count = await (kv as any).get(`kpi:affiliate:${prog}:${date}`).catch(() => null);
      if (count && typeof count === 'number') programs[prog] = count;
    }
    return programs;
  } catch {
    return {};
  }
}

async function getLeadTypesForDate(date: string): Promise<Record<string, number>> {
  try {
    const { kv } = await import('@vercel/kv');
    const types: Record<string, number> = {};
    const knownTypes = ['demo_request', 'audit_request', 'consulting_inquiry', 'partnership_inquiry'];
    for (const t of knownTypes) {
      const count = await (kv as any).get(`kpi:lead:${t}:${date}`).catch(() => null);
      if (count && typeof count === 'number') types[t] = count;
    }
    return types;
  } catch {
    return {};
  }
}

async function getTopAffiliateArticles(date: string, limit = 5): Promise<Array<{ slug: string; clicks: number }>> {
  try {
    const { kv } = await import('@vercel/kv');
    // Scan KV for article affiliate click keys
    // Pattern: kpi:affiliate:article:{slug}:{date}
    // We need to list article slugs — load from articles.ts
    const articleMeta = loadArticleMeta();
    const results: Array<{ slug: string; clicks: number }> = [];

    for (const slug of Object.keys(articleMeta)) {
      const count = await (kv as any).get(`kpi:affiliate:article:${slug}:${date}`).catch(() => null);
      if (count && typeof count === 'number') {
        results.push({ slug, clicks: count });
      }
    }

    return results
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  } catch {
    return [];
  }
}

function loadArticleMeta(): Record<string, { title: string; category: string }> {
  try {
    const articlesPath = path.join(__dirname, '..', 'app', 'data', 'articles.ts');
    const content = fs.readFileSync(articlesPath, 'utf8');
    const meta: Record<string, { title: string; category: string }> = {};
    const regex = /slug:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?category:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
      meta[m[1]] = { title: m[2], category: m[3] };
    }
    return meta;
  } catch {
    return {};
  }
}

async function runDailyRollup(dateOverride?: string): Promise<DailyRollup> {
  const date = dateOverride || new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, '..', 'data', 'kpi', 'daily', date.split('-')[0], date.split('-')[1]);
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`[Daily Rollup] ${date}`);

  const [
    pageViews,
    affiliateClicks,
    sponsorshipLeads,
    signups,
    aiImpressions,
    cryptoImpressions,
    automationImpressions,
    byAffiliateProgram,
    byLeadType,
    topAffiliateArticles,
  ] = await Promise.all([
    getCounter(`kpi:counter:page_view:${date}`),
    getCounter(`kpi:counter:affiliate_click:${date}`),
    getCounter(`kpi:counter:sponsorship_lead:${date}`),
    getCounter(`kpi:counter:signup:${date}`),
    getCounter(`kpi:category:ai:${date}`),
    getCounter(`kpi:category:crypto:${date}`),
    getCounter(`kpi:category:automation:${date}`),
    getAffiliatesForDate(date),
    getLeadTypesForDate(date),
    getTopAffiliateArticles(date),
  ]);

  // Subscribers = confirmed activations (email_confirmed)
  // For now approximated as signups * 0.7 (realistic confirmation rate)
  // TODO: wire to a dedicated subscriber counter when email confirmation is tracked
  const subscribers = Math.floor(signups * 0.7);

  // Revenue: affiliate commissions estimated at $0.02 per click (Amazon Associates avg)
  // TODO: wire to actual payout data when affiliate API is connected
  const revenueCents = Math.floor(affiliateClicks * 2);

  const rollup: DailyRollup = {
    date,
    generatedAt: new Date().toISOString(),
    pageViews,
    affiliateClicks,
    sponsorshipLeads,
    signups,
    subscribers,
    aiImpressions,
    cryptoImpressions,
    automationImpressions,
    revenueCents,
    byAffiliateProgram,
    byLeadType,
    topAffiliateArticles,
  };

  const outPath = path.join(outputDir, `${date}.json`);
  fs.writeFileSync(outPath, JSON.stringify(rollup, null, 2));
  console.log(`[Daily Rollup] Wrote ${outPath}`);

  return rollup;
}

// CLI
const dateArg = process.argv[2];
runDailyRollup(dateArg)
  .then(r => {
    console.log('\n=== Daily Rollup ===');
    console.log(`Date: ${r.date}`);
    console.log(`Page Views: ${r.pageViews}`);
    console.log(`Affiliate Clicks: ${r.affiliateClicks}`);
    console.log(`Sponsorship Leads: ${r.sponsorshipLeads}`);
    console.log(`Signups: ${r.signups}`);
    console.log(`Subscribers: ${r.subscribers}`);
    console.log(`Revenue (est. $): ${(r.revenueCents / 100).toFixed(2)}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('[Daily Rollup] Fatal:', err);
    process.exit(1);
  });
