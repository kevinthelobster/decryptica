#!/usr/bin/env node
/**
 * Sprint KPI Dashboard Export
 *
 * Builds a weekly sprint snapshot from existing KPI artifacts and writes:
 * - data/kpi/sprint/{week}/snapshot.json
 * - data/kpi/sprint/{week}/dashboard.md
 *
 * Usage:
 *   npx tsx scripts/export_sprint_dashboard.ts --week 2026-W15
 */

import * as fs from 'fs';
import * as path from 'path';

type WeeklyKpi = {
  week: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  ctr: {
    overallCtr: number;
  };
  sessions: {
    totalOrganicSessions: number;
  };
  conversions: {
    totalAffiliateClicks: number;
  };
};

type DailyRollup = {
  date: string;
  pageViews: number;
  affiliateClicks: number;
  signups: number;
  revenueCents: number;
};

type SourceStatus = 'ready' | 'placeholder' | 'missing';

const NET_NEW_MRR_ATTRIBUTION = {
  sourceOfTruth: [
    'billing.subscription_events',
    'billing.invoices',
    'analytics.attribution_touches',
  ],
  grain: 'weekly by event_date (America/New_York), rolled up by channel and campaign',
  formula:
    'net_new_mrr_attributed = new_logo_mrr + expansion_mrr + trial_conversion_mrr - refund_mrr - churn_mrr_offset',
  exclusions: [
    'internal/test accounts',
    'one-time services revenue',
    'reactivations older than 90 days',
    'fully unattributed conversions routed to channel=unknown',
  ],
  assistedAttributionRule:
    '70% credit to last non-direct touch, 30% credit to first qualifying touch; direct-only paths get 100% direct',
  trialConversionRule:
    'Include only when trial converts to paid and first successful invoice posts; use conversion date for recognition',
  exportFields: [
    'week_start',
    'channel',
    'campaign',
    'new_logo_mrr',
    'expansion_mrr',
    'trial_conversion_mrr',
    'refund_mrr',
    'churn_mrr_offset',
    'net_new_mrr_attributed',
  ],
} as const;

function parseArgs(argv: string[]): { week?: string } {
  const out: { week?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--week') out.week = argv[i + 1];
  }
  return out;
}

function safeReadJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function findLatestDailyRollup(rootDir: string): DailyRollup | null {
  const dailyRoot = path.join(rootDir, 'data', 'kpi', 'daily');
  if (!fs.existsSync(dailyRoot)) return null;

  const files = fs.readdirSync(dailyRoot, { recursive: true }) as string[];
  const candidates = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dailyRoot, f))
    .sort();

  if (candidates.length === 0) return null;
  return safeReadJson<DailyRollup>(candidates[candidates.length - 1]);
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function usd(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function weekFromDate(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const weekNum = Math.ceil((days + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function statusLabel(status: SourceStatus): string {
  if (status === 'ready') return 'ready';
  if (status === 'placeholder') return 'placeholder';
  return 'missing';
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const week = args.week || weekFromDate(new Date());
  const kpiPath = path.join(cwd, 'data', 'kpi', 'weekly', week, 'kpi.json');
  const weekly = safeReadJson<WeeklyKpi>(kpiPath);

  if (!weekly) {
    throw new Error(`Weekly KPI not found: ${kpiPath}`);
  }

  const daily = findLatestDailyRollup(cwd);
  const dailyPageViews = daily?.pageViews ?? 0;
  const dailySignups = daily?.signups ?? 0;
  const dailyRevenueCents = daily?.revenueCents ?? 0;
  const dailyAffiliateClicks = daily?.affiliateClicks ?? weekly.conversions.totalAffiliateClicks ?? 0;

  const cvr = pct(dailySignups, dailyPageViews);
  const epc = dailyAffiliateClicks > 0 ? Number((usd(dailyRevenueCents) / dailyAffiliateClicks).toFixed(4)) : 0;
  const rpm = dailyPageViews > 0 ? Number(((usd(dailyRevenueCents) * 1000) / dailyPageViews).toFixed(2)) : 0;
  const netNewMrrUsd = usd(dailyRevenueCents);

  const gscConfigured = Boolean(process.env.GSC_API_KEY);
  const kvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  const sourceMap = {
    sessions: {
      source: 'data/kpi/weekly/{week}/kpi.json.sessions.totalOrganicSessions',
      status: weekly.sessions.totalOrganicSessions > 0 ? 'ready' : (gscConfigured ? 'placeholder' : 'missing'),
    },
    organicCtr: {
      source: 'data/kpi/weekly/{week}/kpi.json.ctr.overallCtr',
      status: weekly.ctr.overallCtr > 0 ? 'ready' : (gscConfigured ? 'placeholder' : 'missing'),
    },
    cvr: {
      source: 'data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json (signups/pageViews)',
      status: daily ? (kvConfigured ? 'ready' : 'placeholder') : 'missing',
    },
    epc: {
      source: 'data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json (revenue/affiliateClicks)',
      status: daily ? (kvConfigured ? 'ready' : 'placeholder') : 'missing',
    },
    rpm: {
      source: 'data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json ((revenue*1000)/pageViews)',
      status: daily ? (kvConfigured ? 'ready' : 'placeholder') : 'missing',
    },
    netNewMrr: {
      source: 'data/kpi/daily/{yyyy}/{mm}/{yyyy-mm-dd}.json.revenueCents (proxy until subscription MRR feed)',
      status: daily ? 'placeholder' : 'missing',
    },
  } as const;

  const snapshot = {
    generatedAt: new Date().toISOString(),
    week: weekly.week,
    weekStart: weekly.weekStart,
    weekEnd: weekly.weekEnd,
    weekLabel: 'W1',
    metrics: {
      sessions: weekly.sessions.totalOrganicSessions,
      organicCtrPct: weekly.ctr.overallCtr,
      cvrPct: cvr,
      epcUsd: epc,
      rpmUsd: rpm,
      netNewMrrUsd,
    },
    sourceMap,
    netNewMrrAttribution: NET_NEW_MRR_ATTRIBUTION,
    telemetryGaps: [
      !gscConfigured ? 'GSC_API_KEY missing in runtime for non-placeholder sessions/CTR.' : null,
      !kvConfigured ? 'KV_REST_API_URL and/or KV_REST_API_TOKEN missing in runtime for non-placeholder CVR/EPC/RPM.' : null,
      'Subscription-grade net new MRR source is not wired; current value is revenue proxy.',
    ].filter(Boolean),
  };

  const outDir = path.join(cwd, 'data', 'kpi', 'sprint', week);
  fs.mkdirSync(outDir, { recursive: true });
  const snapshotPath = path.join(outDir, 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

  const markdown = [
    `# Sprint KPI Dashboard Snapshot — ${weekly.week} (W1)`,
    ``,
    `Period: ${weekly.weekStart} to ${weekly.weekEnd}`,
    `Generated: ${snapshot.generatedAt}`,
    ``,
    `## Source Mapping`,
    `- Sessions: \`${sourceMap.sessions.source}\` (${statusLabel(sourceMap.sessions.status)})`,
    `- Organic CTR: \`${sourceMap.organicCtr.source}\` (${statusLabel(sourceMap.organicCtr.status)})`,
    `- CVR: \`${sourceMap.cvr.source}\` (${statusLabel(sourceMap.cvr.status)})`,
    `- EPC: \`${sourceMap.epc.source}\` (${statusLabel(sourceMap.epc.status)})`,
    `- RPM: \`${sourceMap.rpm.source}\` (${statusLabel(sourceMap.rpm.status)})`,
    `- Net New MRR: \`${sourceMap.netNewMrr.source}\` (${statusLabel(sourceMap.netNewMrr.status)})`,
    ``,
    `## Net-New MRR Attribution (DEC-266)`,
    `- Source of truth: \`${NET_NEW_MRR_ATTRIBUTION.sourceOfTruth.join('`, `')}\``,
    `- Grain: ${NET_NEW_MRR_ATTRIBUTION.grain}`,
    `- Formula: \`${NET_NEW_MRR_ATTRIBUTION.formula}\``,
    `- Assisted attribution: ${NET_NEW_MRR_ATTRIBUTION.assistedAttributionRule}`,
    `- Trial conversion: ${NET_NEW_MRR_ATTRIBUTION.trialConversionRule}`,
    `- Export fields: \`${NET_NEW_MRR_ATTRIBUTION.exportFields.join('`, `')}\``,
    ``,
    `## Weekly Snapshot Format`,
    `| Week | Sessions | Organic CTR | CVR | EPC | RPM | Net New MRR |`,
    `|------|----------|-------------|-----|-----|-----|-------------|`,
    `| W1 (${weekly.week}) | ${snapshot.metrics.sessions} | ${snapshot.metrics.organicCtrPct}% | ${snapshot.metrics.cvrPct}% | $${snapshot.metrics.epcUsd} | $${snapshot.metrics.rpmUsd} | $${snapshot.metrics.netNewMrrUsd} |`,
    `| W2 | TBC | TBC | TBC | TBC | TBC | TBC |`,
    `| W3 | TBC | TBC | TBC | TBC | TBC | TBC |`,
    `| W4 | TBC | TBC | TBC | TBC | TBC | TBC |`,
    ``,
    `## Missing Telemetry (Owner + Ask)`,
    ...snapshot.telemetryGaps.map((g) => `- ${g}`),
    ``,
    `## Reuse Process`,
    `1. Run \`npx tsx scripts/seo_kpi_feed.ts\``,
    `2. Run \`npx tsx scripts/daily_rollup.ts\``,
    `3. Run \`npx tsx scripts/export_sprint_dashboard.ts --week ${weekly.week}\``,
    ``,
  ].join('\n');

  const mdPath = path.join(outDir, 'dashboard.md');
  fs.writeFileSync(mdPath, markdown);

  console.log(`[Sprint Dashboard] Wrote ${snapshotPath}`);
  console.log(`[Sprint Dashboard] Wrote ${mdPath}`);
}

main();
