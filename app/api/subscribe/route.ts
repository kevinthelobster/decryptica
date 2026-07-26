import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';
import { normalizeSubscriberEmail, subscribeToNewsletter, type NewsletterSubscribeMetadata } from '../../lib/newsletter';

const TTL_90_DAYS = 60 * 60 * 24 * 90;

/**
 * POST /api/subscribe
 * Handles newsletter subscription with KPI tracking
 */
export async function POST(request: Request) {
  try {
    const { email, source, offerSlug, offerTitle, category, articleSlug } = await request.json();

    const normalizedEmail = normalizeSubscriberEmail(email);

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const metadata: NewsletterSubscribeMetadata = {
      source: typeof source === 'string' ? source.slice(0, 80) : undefined,
      offerSlug: typeof offerSlug === 'string' ? offerSlug.slice(0, 80) : undefined,
      offerTitle: typeof offerTitle === 'string' ? offerTitle.slice(0, 120) : undefined,
      category: typeof category === 'string' ? category.slice(0, 40) : undefined,
      articleSlug: typeof articleSlug === 'string' ? articleSlug.slice(0, 120) : undefined,
    };

    const result = await subscribeToNewsletter(normalizedEmail, metadata);

    await trackSignup(normalizedEmail, metadata);

    return NextResponse.json(
      {
        message: result.message,
        provider: result.provider,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Track a signup KPI event in Vercel KV
 */
async function trackSignup(email: string, metadata: NewsletterSubscribeMetadata = {}): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const emailHash = hashEmail(email);

    const event = {
      type: 'signup',
      timestamp,
      date,
      emailHash,
      method: 'email_form',
      source: metadata.source || 'decryptica-site',
      offerSlug: metadata.offerSlug || null,
      offerTitle: metadata.offerTitle || null,
      category: metadata.category || null,
      articleSlug: metadata.articleSlug || null,
    };

    // Store the event with session context (anonymous session if available)
    const key = `kpi:signup:${emailHash}:${Date.now()}`;
    await kv.set(key, JSON.stringify(event), { ex: TTL_90_DAYS });

    // Increment daily signup counter
    const counterKey = `kpi:counter:signup:${date}`;
    await kv.incr(counterKey);
    await kv.expire(counterKey, TTL_90_DAYS);
  } catch (err) {
    // Non-blocking - log but don't fail the subscription
    console.error('[Analytics] trackSignup failed:', err);
  }
}

/**
 * Hash email for privacy-safe storage (SHA-256, truncated)
 */
function hashEmail(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 16);
}
