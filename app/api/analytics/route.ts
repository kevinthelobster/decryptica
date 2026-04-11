/**
 * Analytics Events API — POST /api/analytics/events
 * Ingests KPI events from client-side tracking
 * 
 * Event shape:
 * {
 *   type: 'page_view' | 'signup' | 'activation' | 'paid_conversion' | 'mrr' | 'churn' | 'intent_router_impression' | 'intent_set' | 'intent_switch' | 'intent_banner_dismiss',
 *   timestamp: ISO8601,
 *   sessionId: string,
 *   anonymousId?: string,
 *   userId?: string,
 *   articleSlug?: string,
 *   metadata?: Record<string, string | number | boolean>
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const TTL_90_DAYS = 60 * 60 * 24 * 90;
const ALLOWED_TYPES = new Set([
  'page_view',
  'signup',
  'activation',
  'paid_conversion',
  'mrr',
  'churn',
  'ranking',
  'article_click',
  'cta_click',
  'cta_view',
  'form_start',
  'form_submit',
  'form_submit',
  'intent_router_impression',
  'intent_set',
  'intent_switch',
  'intent_banner_dismiss',
  'scroll_depth',
  'toc_jump',
  'hub_nav_click',
  'related_module_impression',
  'related_module_click',
  'hub_primary_cta_click',
  'hub_secondary_cta_click',
  'faq_expand',
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.sessionId) {
      return NextResponse.json({ error: 'Missing required fields: type, sessionId' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(body.type)) {
      return NextResponse.json({ error: `Invalid event type: ${body.type}` }, { status: 400 });
    }

    const event = {
      type: body.type,
      timestamp: body.timestamp || new Date().toISOString(),
      sessionId: body.sessionId,
      anonymousId: body.anonymousId || null,
      userId: body.userId || null,
      articleSlug: body.articleSlug || null,
      metadata: body.metadata || {},
      receivedAt: new Date().toISOString(),
    };

    const key = `kpi:${event.type}:${event.sessionId}:${Date.now()}`;
    await kv.set(key, JSON.stringify(event), { ex: TTL_90_DAYS });

    // Daily counters for fast rollup queries
    const date = new Date().toISOString().split('T')[0];
    const counterKey = `kpi:counter:${event.type}:${date}`;
    await kv.incr(counterKey);
    await kv.expire(counterKey, TTL_90_DAYS);

    // Type-specific counter aggregation
    if (event.type === 'page_view' && event.articleSlug) {
      const slugKey = `kpi:impressions:${event.articleSlug}:${date}`;
      await kv.incr(slugKey);
      await kv.expire(slugKey, TTL_90_DAYS);

      // Per-category aggregation for topic cluster segmentation
      const category = event.metadata?.category as string | undefined;
      if (category && ['ai', 'crypto', 'automation'].includes(category)) {
        const catKey = `kpi:category:${category}:${date}`;
        await kv.incr(catKey);
        await kv.expire(catKey, TTL_90_DAYS);
      }
    }

    // Per-article conversion counters for click events
    if (
      (
        event.type === 'cta_click' ||
        event.type === 'article_click' ||
        event.type === 'related_module_click' ||
        event.type === 'hub_primary_cta_click' ||
        event.type === 'hub_secondary_cta_click'
      ) &&
      event.articleSlug
    ) {
      const ctaKey = `kpi:cta:${event.articleSlug}:${date}`;
      const clickKey = `kpi:click:${event.articleSlug}:${date}`;
      if (event.type === 'cta_click' || event.type === 'hub_primary_cta_click' || event.type === 'hub_secondary_cta_click') {
        await kv.incr(ctaKey);
        await kv.expire(ctaKey, TTL_90_DAYS);
      }
      if (event.type === 'article_click' || event.type === 'related_module_click') {
        await kv.incr(clickKey);
        await kv.expire(clickKey, TTL_90_DAYS);
      }
    }

    // CTA view and form start counters per article
    if (
      (event.type === 'cta_view' || event.type === 'form_start') &&
      event.articleSlug
    ) {
      const viewKey = `kpi:${event.type}:${event.articleSlug}:${date}`;
      await kv.incr(viewKey);
      await kv.expire(viewKey, TTL_90_DAYS);
    }

    return NextResponse.json({ success: true, eventId: key }, { status: 200 });
  } catch (err) {
    console.error('[Analytics API] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/analytics/debug — Returns recent events for debugging (admin only)
 * Returns up to 20 recent events stored in KV
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check — in production, tie to a real admin session
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ANALYTICS_DEBUG_TOKEN || 'decryptica-debug';
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Scan for recent event keys (KV SCAN pattern)
    // We approximate by checking known counter keys and sampling recent keys
    const date = new Date().toISOString().split('T')[0];
    const counterTypes = [
      'page_view',
      'signup',
      'activation',
      'paid_conversion',
      'mrr',
      'churn',
      'article_click',
      'cta_click',
      'cta_view',
      'form_start',
      'form_submit',
      'intent_router_impression',
      'intent_set',
      'intent_switch',
      'intent_banner_dismiss',
      'scroll_depth',
      'toc_jump',
      'hub_nav_click',
      'related_module_impression',
      'related_module_click',
      'hub_primary_cta_click',
      'hub_secondary_cta_click',
      'faq_expand',
    ];
    const counters: Record<string, number> = {};

    for (const type of counterTypes) {
      const key = `kpi:counter:${type}:${date}`;
      const count = await kv.get<number>(key).catch(() => 0);
      counters[type] = count ?? 0;
    }

    // Get impression counts per article (today)
    const articleImpressions: Record<string, number> = {};
    // We'll just return counters for now — full event log requires separate key structure

    return NextResponse.json({
      date,
      counters,
      note: 'Debug endpoint — full event logs require dedicated storage. Counters shown above.',
      samplePayloads: {
        page_view: {
          type: 'page_view',
          timestamp: new Date().toISOString(),
          sessionId: 'SESSION_ID',
          anonymousId: 'ANONYMOUS_ID',
          articleSlug: 'article-slug',
          metadata: {
            category: 'ai',
            url: 'https://decryptica.com/blog/article-slug',
            referrer: 'https://www.google.com',
            isOrganicSearch: true,
          },
        },
        signup: {
          type: 'signup',
          timestamp: new Date().toISOString(),
          sessionId: 'SESSION_ID',
          anonymousId: 'ANONYMOUS_ID',
          metadata: {
            method: 'email_form',
            utmSource: 'google',
            utmMedium: 'organic',
          },
        },
        activation: {
          type: 'activation',
          timestamp: new Date().toISOString(),
          sessionId: 'SESSION_ID',
          userId: 'USER_ID',
          metadata: {
            activationType: 'first_action',
            featureSlug: 'ai-price-calculator',
          },
        },
      },
    }, { status: 200 });
  } catch (err) {
    console.error('[Analytics API] GET debug error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
