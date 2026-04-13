/**
 * Affiliate Click Tracking API — POST /api/analytics/affiliate-click
 * Records outbound affiliate link clicks for revenue attribution.
 *
 * Event shape:
 * {
 *   sessionId: string,
 *   anonymousId?: string,
 *   affiliateId: string,        // e.g. "amazon", "aesirx", "decentralized-id"
 *   program: string,            // e.g. "amazon-associates", "aesirx-affiliate"
 *   partnerId?: string,          // sub-id within the program
 *   targetUrl: string,          // actual affiliate link clicked
 *   articleSlug?: string,      // source content
 *   category?: string,          // "ai" | "crypto" | "automation"
 *   intent?: string,            // "learn" | "calculate" | "implement"
 *   position?: number,          // position in a list/grid
 *   utmSource?: string,
 *   utmMedium?: string,
 *   utmCampaign?: string,
 *   metadata?: Record<string, string | number | boolean>
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const TTL_90_DAYS = 60 * 60 * 24 * 90;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionId || !body.affiliateId || !body.targetUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, affiliateId, targetUrl' },
        { status: 400 }
      );
    }

    const event: Record<string, unknown> = {
      type: 'affiliate_click',
      timestamp: body.timestamp || new Date().toISOString(),
      sessionId: body.sessionId,
      anonymousId: body.anonymousId || null,
      affiliateId: body.affiliateId,
      program: body.program,
      partnerId: body.partnerId || null,
      targetUrl: body.targetUrl,
      articleSlug: body.articleSlug || null,
      category: body.category || null,
      intent: body.intent || null,
      position: body.position || null,
      metadata: body.metadata || {},
      // UTM attribution fields
      utmSource: body.utmSource || null,
      utmMedium: body.utmMedium || null,
      utmCampaign: body.utmCampaign || null,
      receivedAt: new Date().toISOString(),
    };

    // Store the raw event for lead-level attribution
    const key = `affiliate:click:${event.sessionId}:${Date.now()}`;
    await kv.set(key, JSON.stringify(event), { ex: TTL_90_DAYS });

    // Daily counter for rollup
    const date = new Date().toISOString().split('T')[0];
    const counterKey = `kpi:counter:affiliate_click:${date}`;
    await kv.incr(counterKey);
    await kv.expire(counterKey, TTL_90_DAYS);

    // Per-affiliate-program counter
    const programKey = `kpi:affiliate:${event.program}:${date}`;
    await kv.incr(programKey);
    await kv.expire(programKey, TTL_90_DAYS);

    // Per-article counter if articleSlug present
    if (event.articleSlug) {
      const articleKey = `kpi:affiliate:article:${event.articleSlug}:${date}`;
      await kv.incr(articleKey);
      await kv.expire(articleKey, TTL_90_DAYS);
    }

    return NextResponse.json({ success: true, eventId: key }, { status: 200 });
  } catch (err) {
    console.error('[Analytics API] affiliate-click error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
