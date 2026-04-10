/**
 * SEO Events API — POST /api/seo/events
 * Ingests SEO telemetry events: page views, CWV snapshots, ranking updates, indexation checks.
 *
 * Part of DEC-111: SEO instrumentation and ranking telemetry
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import {
  SeoEvent,
  SeoEventType,
  SEO_KV,
  detectTemplateFromUrl,
  todayDate,
} from '@/app/data/seo-telemetry';

const TTL_90_DAYS = 60 * 60 * 24 * 90;
const TTL_365_DAYS = 60 * 60 * 24 * 365;
const ALLOWED_TYPES: SeoEventType[] = ['page_view', 'cwv_snapshot', 'ranking_update', 'indexation_check'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !ALLOWED_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid event type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const event = body as SeoEvent;
    const timestamp = event.timestamp || new Date().toISOString();
    const date = timestamp.split('T')[0];

    // ── Persist raw event ──────────────────────────────────────────────────
    const sessionId = 'sessionId' in event ? (event.sessionId as string) : 'anon';
    const eventKey = SEO_KV.eventKey(event.type, sessionId, timestamp);
    await kv.set(eventKey, JSON.stringify(event), { ex: TTL_90_DAYS });

    // ── Aggregate based on event type ─────────────────────────────────────
    switch (event.type) {
      case 'page_view': {
        const url = event.url || '/';
        const slug = event.articleSlug || detectTemplateFromUrl(url);

        // Daily page view counter
        const pvKey = SEO_KV.dailyPvKey(date, url);
        await kv.incr(pvKey);
        await kv.expire(pvKey, TTL_365_DAYS);

        // Unique visitor (by session)
        if (event.sessionId) {
          const uvKey = SEO_KV.dailyUniqueKey(date, url);
          await kv.sadd(uvKey, event.sessionId);
          await kv.expire(uvKey, TTL_365_DAYS);
        }

        // Organic search detection counter
        if (event.isOrganicSearch) {
          const organicKey = `seo:organic:${date}:${url}`;
          await kv.incr(organicKey);
          await kv.expire(organicKey, TTL_365_DAYS);
        }

        // Category-level aggregation
        if (event.category) {
          const catPvKey = `seo:cat:pv:${date}:${event.category}`;
          await kv.incr(catPvKey);
          await kv.expire(catPvKey, TTL_365_DAYS);
        }
        break;
      }

      case 'cwv_snapshot': {
        const { metrics, url } = event;
        if (!metrics) break;

        // Store metric values in sorted set for percentile calculation
        // We use a "metric:value:count" hash approach for space efficiency
        const metricNames = ['lcp', 'fid', 'cls', 'ttfb', 'fcp'] as const;
        for (const m of metricNames) {
          const value = metrics[m];
          if (value === undefined) continue;
          const setKey = `seo:cwv:set:${date}:${url}:${m}`;
          // Store as sorted set with score = value for percentile queries
          await kv.zadd(setKey, { score: value, member: `${Date.now()}:${Math.random()}` });
          await kv.expire(setKey, TTL_90_DAYS);
          // Also track running totals for fast avg
          const totalKey = `seo:cwv:total:${date}:${url}:${m}`;
          await kv.hincrby(totalKey, 'sum', Math.round(value));
          await kv.hincrby(totalKey, 'count', 1);
          await kv.expire(totalKey, TTL_90_DAYS);
        }
        break;
      }

      case 'ranking_update': {
        const { keyword, position, engine, country, device } = event;
        if (!keyword) break;

        // Store current ranking
        const rankKey = SEO_KV.rankingKey(keyword, engine || 'google', country || 'us', device || 'all');
        const existing = await kv.get<string>(rankKey);
        const previousPosition = existing ? JSON.parse(existing).position : undefined;

        await kv.set(rankKey, JSON.stringify({
          ...event,
          previousPosition,
          updatedAt: timestamp,
        }), { ex: TTL_365_DAYS });

        // Append to ranking history (keep last 90 days)
        const histKey = SEO_KV.rankingHistoryKey(keyword);
        await kv.lpush(histKey, JSON.stringify({ position, timestamp }));
        await kv.ltrim(histKey, 0, 89);
        await kv.expire(histKey, TTL_365_DAYS);
        break;
      }

      case 'indexation_check': {
        const { url, status } = event;
        if (!url) break;

        const idxKey = SEO_KV.indexationKey(url);
        await kv.set(idxKey, JSON.stringify({ ...event, checkedAt: timestamp }), { ex: TTL_90_DAYS });

        // Counters by status
        const statusCountKey = `seo:idx:status:${date}:${status}`;
        await kv.incr(statusCountKey);
        await kv.expire(statusCountKey, TTL_365_DAYS);
        break;
      }
    }

    return NextResponse.json({ success: true, eventKey }, { status: 200 });
  } catch (err) {
    console.error('[SEO API] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/seo/events — Returns SEO telemetry summary (admin/debug)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ANALYTICS_DEBUG_TOKEN || 'decryptica-debug';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = new Date().toISOString().split('T')[0];

    // Collect today's counters
    const counters: Record<string, number> = {};

    // Page views by template pattern (approximation)
    const categories: Array<'crypto' | 'ai' | 'automation'> = ['crypto', 'ai', 'automation'];
    for (const cat of categories) {
      const key = `seo:cat:pv:${date}:${cat}`;
      const count = await kv.get<number>(key).catch(() => 0);
      counters[`${cat}_pageviews`] = count ?? 0;
    }

    // Indexation status
    const indexedKey = `seo:idx:status:${date}:indexed`;
    const notIndexedKey = `seo:idx:status:${date}:not_indexed`;
    const indexed = (await kv.get<number>(indexedKey).catch(() => 0)) ?? 0;
    const notIndexed = (await kv.get<number>(notIndexedKey).catch(() => 0)) ?? 0;

    return NextResponse.json({
      date,
      counters,
      indexation: {
        indexed,
        notIndexed,
        indexRate: indexed + notIndexed > 0 ? +(indexed / (indexed + notIndexed)).toFixed(3) : null,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('[SEO API] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
