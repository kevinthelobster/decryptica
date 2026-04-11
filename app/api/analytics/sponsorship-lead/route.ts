/**
 * Sponsorship Lead Intent API — POST /api/analytics/sponsorship-lead
 * Captures intent signals from sponsorship-adjacent CTAs (demo requests,
 * audit requests, consulting inquiry forms) and creates a pipeline handoff
 * record for sales follow-up.
 *
 * Lead shape:
 * {
 *   sessionId: string,
 *   anonymousId?: string,
 *   userId?: string,
 *   leadType: 'demo_request' | 'audit_request' | 'consulting_inquiry' | 'partnership_inquiry',
 *   email?: string,              // captured email (hashed for privacy in logs)
 *   company?: string,
 *   name?: string,
 *   message?: string,
 *   sourceContent?: string,     // article or page that generated the lead
 *   category?: string,          // "ai" | "crypto" | "automation"
 *   intent?: string,            // "learn" | "calculate" | "implement"
 *   utmSource?: string,
 *   utmMedium?: string,
 *   utmCampaign?: string,
 *   metadata?: Record<string, string | number | boolean>
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const TTL_90_DAYS = 60 * 60 * 24 * 90;
const ALLOWED_LEAD_TYPES = new Set([
  'demo_request',
  'audit_request',
  'consulting_inquiry',
  'partnership_inquiry',
]);

function hashEmail(email: string): string {
  // Simple hash for privacy-safe logging — not reversible
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return Math.abs(hash).toString(16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionId || !body.leadType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, leadType' },
        { status: 400 }
      );
    }

    if (!ALLOWED_LEAD_TYPES.has(body.leadType)) {
      return NextResponse.json(
        { error: `Invalid leadType. Must be one of: ${[...ALLOWED_LEAD_TYPES].join(', ')}` },
        { status: 400 }
      );
    }

    const rawEmail = body.email;
    const event = {
      type: 'sponsorship_lead',
      timestamp: body.timestamp || new Date().toISOString(),
      sessionId: body.sessionId,
      anonymousId: body.anonymousId || null,
      userId: body.userId || null,
      leadType: body.leadType,
      emailHash: rawEmail ? hashEmail(rawEmail) : null,
      emailDomain: rawEmail ? (rawEmail.split('@')[1] ?? null) : null,
      company: body.company || null,
      name: body.name || null,
      message: body.message || null,
      sourceContent: body.sourceContent || null,
      category: body.category || null,
      intent: body.intent || null,
      utmSource: body.utmSource || null,
      utmMedium: body.utmMedium || null,
      utmCampaign: body.utmCampaign || null,
      metadata: body.metadata || {},
      receivedAt: new Date().toISOString(),
      // Pipeline status — "new" leads should enter a CRM or email sequence
      pipelineStatus: 'new',
    };

    // Store raw lead record for sales/CSM access
    const leadId = `lead:${event.sessionId}:${Date.now()}`;
    await kv.set(leadId, JSON.stringify(event), { ex: TTL_90_DAYS });

    // Daily counter for lead volume rollup
    const date = new Date().toISOString().split('T')[0];
    const counterKey = `kpi:counter:sponsorship_lead:${date}`;
    await kv.incr(counterKey);
    await kv.expire(counterKey, TTL_90_DAYS);

    // Per lead-type counter
    const typeKey = `kpi:lead:${event.leadType}:${date}`;
    await kv.incr(typeKey);
    await kv.expire(typeKey, TTL_90_DAYS);

    // Per category counter
    if (event.category && ['ai', 'crypto', 'automation'].includes(event.category)) {
      const catKey = `kpi:lead:category:${event.category}:${date}`;
      await kv.incr(catKey);
      await kv.expire(catKey, TTL_90_DAYS);
    }

    // Pipeline list entry for CRM ingestion (sorted by timestamp)
    const pipelineKey = `pipeline:leads:${date}`;
    await kv.lpush(pipelineKey, leadId);
    await kv.expire(pipelineKey, TTL_90_DAYS);

    return NextResponse.json({ success: true, leadId }, { status: 200 });
  } catch (err) {
    console.error('[Analytics API] sponsorship-lead error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
