import { kv } from '@vercel/kv';
import { SeoDashboard } from '@/app/data/seo-telemetry';

const CATEGORIES = ['crypto', 'ai', 'automation'] as const;
const MS_IN_DAY = 86_400_000;

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * MS_IN_DAY);
    dates.push(toDateString(d));
  }
  return dates;
}

async function getOr0(key: string): Promise<number> {
  const value = await kv.get<number>(key).catch(() => null);
  return value ?? 0;
}

async function getCheckpoint(date: string): Promise<Record<string, unknown> | null> {
  const raw = await kv.get<string>(`seo:checkpoint:${date}`).catch(() => null);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface BuildSeoDashboardOptions {
  rangeDays?: number;
}

export async function buildSeoDashboard(options: BuildSeoDashboardOptions = {}): Promise<SeoDashboard> {
  const rangeDays = options.rangeDays ?? 14;
  const datesRange = getDateRange(rangeDays);
  const dates30d = getDateRange(30);
  const today = datesRange[datesRange.length - 1];
  const yesterday = datesRange[datesRange.length - 2] ?? today;

  const CHANNELS = ['organic', 'social', 'referral', 'direct'] as const;

  const dailyTraffic = await Promise.all(
    datesRange.map(async (date) => {
      let pageViews = 0;
      let uniqueVisitors = 0;
      const trafficSources: Record<string, number> = {};

      // Sum page views and unique visitors across categories
      for (const category of CATEGORIES) {
        pageViews += await getOr0(`seo:cat:pv:${date}:${category}`);
      }

      // Aggregate unique visitors: count distinct session IDs across all URL unique-key sets
      // We approximate by scanning keys — this is a best-effort query against Vercel KV
      // Only actual traffic will populate this; 0 means no instrumentation data yet
      try {
        const allPvKeys = await kv.keys(`seo:pv:${date}:*`);
        let totalUniqueSessions = 0;
        const seenSessions = new Set<string>();
        for (const pvKey of allPvKeys) {
          const url = pvKey.replace(`seo:pv:${date}:`, '');
          const uvKey = `seo:uv:${date}:${url}`;
          // Use SCARD to get unique session count per URL
          const count = await kv.scard(uvKey).catch(() => 0);
          totalUniqueSessions += count ?? 0;
        }
        // Estimate deduplicated total (session may appear across multiple URLs)
        // For now use sum as lower-bound; real deduplication requires tracking session-to-URL mapping
        uniqueVisitors = totalUniqueSessions;
      } catch {
        uniqueVisitors = 0;
      }

      // Aggregate traffic sources by channel for the day
      for (const channel of CHANNELS) {
        const srcKey = `seo:src:pv:${date}:${channel}`;
        const count = await getOr0(srcKey);
        if (count > 0) {
          trafficSources[channel] = count;
        }
      }

      return { date, pageViews, uniqueVisitors, trafficSources };
    })
  );

  let pageViews30d = 0;
  for (const date of dates30d) {
    for (const category of CATEGORIES) {
      pageViews30d += await getOr0(`seo:cat:pv:${date}:${category}`);
    }
  }

  let previousPageViews30d = 0;
  for (let i = 30; i < 60; i += 1) {
    const date = toDateString(new Date(Date.now() - i * MS_IN_DAY));
    for (const category of CATEGORIES) {
      previousPageViews30d += await getOr0(`seo:cat:pv:${date}:${category}`);
    }
  }

  let trackedKeywords = 0;
  let top10Keywords = 0;
  let top3Keywords = 0;
  let avgSearchRanking = 0;
  let rankingTrend = 0;
  const topKeywords: SeoDashboard['topKeywords'] = [];

  try {
    const rankKeys = await kv.keys('seo:rank:google:us:all:*');
    trackedKeywords = rankKeys.length;

    let totalPosition = 0;
    let totalPreviousPosition = 0;
    let trendSamples = 0;

    for (const key of rankKeys.slice(0, 100)) {
      const raw = await kv.get<string>(key).catch(() => null);
      if (!raw) continue;

      const rank = JSON.parse(raw) as {
        keyword?: string;
        articleSlug?: string;
        position?: number;
        previousPosition?: number;
        impressions?: number;
        clicks?: number;
        ctr?: number;
      };

      const position = rank.position ?? 999;
      const previousPosition = rank.previousPosition ?? null;

      if (position <= 10) top10Keywords += 1;
      if (position <= 3) top3Keywords += 1;

      totalPosition += position;
      if (typeof previousPosition === 'number') {
        totalPreviousPosition += previousPosition;
        trendSamples += 1;
      }

      topKeywords.push({
        keyword: rank.keyword || key.split(':').pop() || '',
        articleSlug: rank.articleSlug || '',
        position,
        impressions: rank.impressions ?? 0,
        clicks: rank.clicks ?? 0,
        ctr: rank.ctr ?? 0,
        trend: typeof previousPosition === 'number' ? previousPosition - position : 0,
      });
    }

    if (topKeywords.length > 0) {
      avgSearchRanking = Math.round(totalPosition / topKeywords.length);
    }
    if (trendSamples > 0) {
      rankingTrend = Number(((totalPreviousPosition - totalPosition) / trendSamples).toFixed(1));
    }

    topKeywords.sort((a, b) => a.position - b.position);
  } catch {
    // Ignore ranking fetch errors and return partial dashboard data.
  }

  const todayCheckpoint = await getCheckpoint(today);
  const yesterdayCheckpoint = await getCheckpoint(yesterday);

  let avgCwvScore = 0;
  let cwvTrend = 0;
  let indexedPages = 0;
  let indexationTrend = 0;
  let pagesCrawled = 0;

  if (todayCheckpoint && 'summary' in todayCheckpoint) {
    const summary = todayCheckpoint.summary as { avgCwvScore?: number };
    avgCwvScore = summary?.avgCwvScore ?? 0;
  }

  if (todayCheckpoint && 'indexationStatus' in todayCheckpoint) {
    const indexation = todayCheckpoint.indexationStatus as {
      indexed?: number;
      indexRate?: number;
      totalUrls?: number;
    };
    indexedPages = indexation?.indexed ?? 0;
    pagesCrawled = indexation?.totalUrls ?? 0;

    const yesterdayIndexation =
      yesterdayCheckpoint && 'indexationStatus' in yesterdayCheckpoint
        ? (yesterdayCheckpoint.indexationStatus as { indexRate?: number })
        : null;

    if (typeof indexation?.indexRate === 'number' && typeof yesterdayIndexation?.indexRate === 'number') {
      indexationTrend = Number(((indexation.indexRate - yesterdayIndexation.indexRate) * 100).toFixed(1));
    }
  }

  if (todayCheckpoint && yesterdayCheckpoint && 'summary' in todayCheckpoint && 'summary' in yesterdayCheckpoint) {
    const todaySummary = todayCheckpoint.summary as { avgCwvScore?: number };
    const yesterdaySummary = yesterdayCheckpoint.summary as { avgCwvScore?: number };
    cwvTrend = Number(((todaySummary.avgCwvScore ?? 0) - (yesterdaySummary.avgCwvScore ?? 0)).toFixed(1));
  }

  const byTemplate: SeoDashboard['byTemplate'] = [
    { template: 'home', pageViews: 0, avgLcp: 0, avgCls: 0, avgFid: 0, indexRate: 0 },
    { template: 'topic', pageViews: 0, avgLcp: 0, avgCls: 0, avgFid: 0, indexRate: 0 },
    { template: 'article', pageViews: 0, avgLcp: 0, avgCls: 0, avgFid: 0, indexRate: 0 },
    { template: 'blog-list', pageViews: 0, avgLcp: 0, avgCls: 0, avgFid: 0, indexRate: 0 },
    { template: 'tools', pageViews: 0, avgLcp: 0, avgCls: 0, avgFid: 0, indexRate: 0 },
    { template: 'about', pageViews: 0, avgLcp: 0, avgCls: 0, avgFid: 0, indexRate: 0 },
  ];

  return {
    current: {
      pageViews30d,
      uniqueVisitors30d: dailyTraffic.reduce((sum, d) => sum + (d.uniqueVisitors ?? 0), 0),
      indexedPages,
      trackedKeywords,
      top10Keywords,
      top3Keywords,
      avgCwvScore,
      avgSearchRanking,
    },
    trends: {
      pageViewsTrend:
        previousPageViews30d > 0
          ? Number((((pageViews30d - previousPageViews30d) / previousPageViews30d) * 100).toFixed(1))
          : 0,
      rankingTrend,
      cwvTrend,
      indexationTrend,
    },
    dailyTraffic,
    byTemplate,
    topKeywords: topKeywords.slice(0, 20),
    crawlHealth: {
      pagesCrawled,
      errors: 0,
      avgResponseTime: 0,
    },
  };
}
