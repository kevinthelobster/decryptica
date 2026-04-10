import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const TTL_90_DAYS = 60 * 60 * 24 * 90;

/**
 * POST /api/subscribe
 * Handles newsletter subscription with KPI tracking
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If we have a Google Script URL, use it
    if (GOOGLE_SCRIPT_URL) {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (res.ok) {
        // Track signup KPI event after successful subscription
        await trackSignup(normalizedEmail);
        return NextResponse.json(
          { message: 'Welcome aboard! 🎉', success: true },
          { status: 200 }
        );
      }
    }

    // Fallback: simple success for demo (logs to console)
    console.log('📧 New subscriber:', normalizedEmail);
    console.log('Note: Configure GOOGLE_SCRIPT_URL for persistent storage');

    // Track signup KPI event
    await trackSignup(normalizedEmail);

    return NextResponse.json(
      { message: 'Welcome aboard! 🎉', success: true },
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
async function trackSignup(email: string): Promise<void> {
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