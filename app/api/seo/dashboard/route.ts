/**
 * SEO Dashboard API — GET /api/seo/dashboard
 * Returns the current SEO dashboard state: rankings, CWV, indexation, trends.
 *
 * Part of DEC-111: SEO instrumentation and ranking telemetry
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import {
  SeoDashboard,
  PAGE_TEMPLATE_SLUGS,
} from '@/app/data/seo-telemetry';

const SEO_KV = {
  rankingKey: (keyword: string, engine: string, country: string, device: string) =>
    `seo:rank:${engine}:${country}:${device}:${keyword}`,
  checkpointKey: (date: string) => `seo:checkpoint:${date}`,
  catPvKey: (date: string, cat: string) => `seo:cat:pv:${date}:${cat}`,
};

function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

async function getOr0(key: string): Promise<number> {
  const v = await kv.get<number>(key).catch(() => null);
  return v ?? 0;
}

async function getCheckpoint(date: string): Promise<Record<string, unknown> | null> {
  const key = `seo:checkpoint:${date}`;
  const raw = await kv.get<string>(key).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ANALYTICS_DEBUG_TOKEN || 'decryptica-debug';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const dates7d = getDateRange(7);
    const dates30d = getDateRange(30);

    const dashboard: SeoDashboard = {
      current: {
        pageViews30d: 0,
        uniqueVisitors30d: 0,
        indexedPages: 0,
        trackedKeywords: 0,
        top10Keywords: 0,
        top3Keywords: 0,
        avgCwvScore: 0,
        avgSearchRanking: 0,
      },
      trends: {
        pageViewsTrend: 0,
        rankingTrend: 0,
        cwvTrend: 0,
        indexationTrend: 0,
      },
      byTemplate: [],
      topKeywords: [],
      crawlHealth: {
        pagesCrawled: 0,
        errors: 0,
        avgResponseTime: 0,
      },
    };

    // ── 1. Page views (last 30 days) ─────────────────────────────────────────
    let totalPvCurrent = 0;
    let totalPvPrevious = 0;
    for (const date of dates30d) {
      for (const cat of ['crypto', 'ai', 'automation'] as const) {
        totalPvCurrent += await getOr0(`seo:cat:pv:${date}:${cat}`);
      }
    }
    // Previous 30d (days 30-60)
    for (let i = 30; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      for (const cat of ['crypto', 'ai', 'automation'] as const) {
        totalPvPrevious += await getOr0(`seo:cat:pv:${date}:${cat}`);
      }
    }
    dashboard.current.pageViews30d = totalPvCurrent;
    dashboard.trends.pageViewsTrend =
      totalPvPrevious > 0
        ? +(((totalPvCurrent - totalPvPrevious) / totalPvPrevious) * 100).toFixed(1)
        : 0;

    // ── 2. Tracked keywords and rankings ──────────────────────────────────────
    try {
      const rankKeys = await kv.keys('seo:rank:google:us:all:*');
      const top10Count = 0;
      const top3Count = 0;
      let totalPosition = 0;
      const keywordData: SeoDashboard['topKeywords'] = [];

      for (const key of rankKeys.slice(0, 50)) {
        const raw = await kv.get<string>(key).catch(() => null);
        if (!raw) continue;
        const rank = JSON.parse(raw);
        const position = rank.position ?? 999;

        if (position <= 10) (top10Count as unknown as number)++;
        if (position <= 3) (top3Count as unknown as number)++;
        totalPosition += position;

        keywordData.push({
          keyword: rank.keyword || key.split(':').pop() || '',
          articleSlug: rank.articleSlug || '',
          position,
          impressions: rank.impressions ?? 0,
          clicks: rank.clicks ?? 0,
          ctr: rank.ctr ?? 0,
          trend: rank.previousPosition ? rank.previousPosition - position : 0,
        });
      }

      dashboard.current.trackedKeywords = rankKeys.length;
      dashboard.current.top10Keywords = top10Count as unknown as number;
      dashboard.current.top3Keywords = dashboard.current.top10Keywords;
      if (keywordData.length > 0) {
        dashboard.current.avgSearchRanking = Math.round(totalPosition / keywordData.length);
      }

      keywordData.sort((a, b) => a.position - b.position);
      dashboard.topKeywords = keywordData.slice(0, 20);
    } catch (err) {
      console.warn('[Dashboard] Could not fetch ranking data:', err);
    }

    // ── 3. CWV Score from latest checkpoint ──────────────────────────────────
    const todayCheckpoint = await getCheckpoint(today);
    const yesterdayCheckpoint = await getCheckpoint(yesterday);
    if (todayCheckpoint && typeof todayCheckpoint === 'object' && 'summary' in todayCheckpoint) {
      const s = todayCheckpoint.summary as { avgCwvScore?: number };
      dashboard.current.avgCwvScore = s.avgCwvScore ?? 0;
      if (yesterdayCheckpoint && typeof yesterdayCheckpoint === 'object' && 'summary' in yesterdayCheckpoint) {
        const ys = yesterdayCheckpoint.summary as { avgCwvScore?: number };
        dashboard.trends.cwvTrend = (s.avgCwvScore ?? 0) - (ys.avgCwvScore ?? 0);
      }
    }

    // ── 4. Indexation from checkpoint ────────────────────────────────────────
    if (todayCheckpoint && typeof todayCheckpoint === 'object' && 'indexationStatus' in todayCheckpoint) {
      const idx = todayCheckpoint.indexationStatus as { indexed?: number; totalUrls?: number };
      dashboard.current.indexedPages = idx.indexed ?? 0;
      dashboard.crawlHealth.pagesCrawled = idx.totalUrls ?? 0;
    }

    // ── 5. By-template breakdown (last 7 days aggregated) ────────────────────
    const templates = ['home', 'topic', 'article', 'blog-list', 'tools', 'about'];
    const templateMetrics: SeoDashboard['byTemplate'] = [];

    for (const tpl of templates) {
      let totalPv = 0;
      let lcpSum = 0;
      let lcpCount = 0;
      let clsSum = 0;
      let clsCount = 0;
      let fidSum = 0;
      let fidCount = 0;
      let indexedCount = 0;
      let totalCount = 0;

      for (const date of dates7d) {
        try {
          const setKeys = await kv.keys(`seo:cwv:set:${date}:*:${tpl}*`);
          for (const setKey of setKeys) {
            const values = await kv.zrange(setKey, 0, -1).catch(() => []);
            for (const v of values as string[]) {
              const num = parseFloat(v);
              if (isNaN(num)) continue;
              if (setKey.includes(':lcp')) {
                lcpSum += num;
                lcpCount++;
              } else if (setKey.includes(':cls')) {
                clsSum += num;
                clsCount++;
              } else if (setKey.includes(':fid')) {
                fidSum += num;
                fidCount++;
              }
              totalCount++;
            }
          }
        } catch (_) {}

        // Page views for template
        const templatePattern = tpl === 'article' ? '/blog/' : `/${tpl}`;
        try {
          const keys = await kv.keys(`seo:pv:${date}:*${templatePattern}*`);
          for (const k of keys) {
            totalPv += await getOr0(k);
          }
        } catch (_) {}
      }

      templateMetrics.push({
        template: tpl as SeoDashboard['byTemplate'][0]['template'],
        pageViews: totalPv,
        avgLcp: lcpCount > 0 ? Math.round(lcpSum / lcpCount) : 0,
        avgCls: clsCount > 0 ? Math.round((clsSum / clsCount) * 1000) / 1000 : 0,
        avgFid: fidCount > 0 ? Math.round(fidSum / fidCount) : 0,
        indexRate: totalCount > 0 ? +(indexedCount / totalCount).toFixed(3) : 0,
      });
    }
    dashboard.byTemplate = templateMetrics;

    return NextResponse.json(dashboard, { status: 200 });
  } catch (err) {
    console.error('[Dashboard API] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
