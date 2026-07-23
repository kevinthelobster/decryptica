import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

const SUBSCRIBER_SET_KEY = 'newsletter:subscribers';
const SUBSCRIBER_KEY_PREFIX = 'newsletter:subscriber';

export type NewsletterSubscribeResult = {
  ok: boolean;
  provider: 'buttondown' | 'google-script' | 'kv';
  message: string;
  warning?: string;
};

export function normalizeSubscriberEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;

  const normalized = email.toLowerCase().trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

  return valid ? normalized : null;
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  await persistSubscriber(email);

  if (BUTTONDOWN_API_KEY) {
    const buttondownResult = await subscribeWithButtondown(email);
    if (buttondownResult.ok) return buttondownResult;

    return {
      ok: true,
      provider: 'kv',
      message: 'You are on the list.',
      warning: buttondownResult.warning,
    };
  }

  if (GOOGLE_SCRIPT_URL) {
    const googleResult = await subscribeWithGoogleScript(email);
    if (googleResult.ok) return googleResult;

    return {
      ok: true,
      provider: 'kv',
      message: 'You are on the list.',
      warning: googleResult.warning,
    };
  }

  return {
    ok: true,
    provider: 'kv',
    message: 'You are on the list.',
  };
}

async function persistSubscriber(email: string): Promise<void> {
  const now = new Date().toISOString();
  const key = `${SUBSCRIBER_KEY_PREFIX}:${hashEmail(email)}`;

  await kv.sadd(SUBSCRIBER_SET_KEY, email);
  await kv.hset(key, {
    email,
    source: 'decryptica-site',
    subscribedAt: now,
    updatedAt: now,
  });
}

async function subscribeWithButtondown(email: string): Promise<NewsletterSubscribeResult> {
  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Buttondown-Collision-Behavior': 'add',
      },
      body: JSON.stringify({
        email_address: email,
        tags: ['decryptica-site'],
        metadata: {
          source: 'decryptica-site',
        },
      }),
    });

    if (response.ok || response.status === 400) {
      return {
        ok: true,
        provider: 'buttondown',
        message: 'You are on the list. Check your inbox to confirm.',
      };
    }

    const body = await response.text();
    return {
      ok: false,
      provider: 'buttondown',
      message: 'You are on the list.',
      warning: `Buttondown rejected the subscriber sync: ${response.status} ${body.slice(0, 180)}`,
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'buttondown',
      message: 'You are on the list.',
      warning: `Buttondown subscriber sync failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function subscribeWithGoogleScript(email: string): Promise<NewsletterSubscribeResult> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      return {
        ok: true,
        provider: 'google-script',
        message: 'You are on the list.',
      };
    }

    return {
      ok: false,
      provider: 'google-script',
      message: 'You are on the list.',
      warning: `Google Script rejected the subscriber sync: ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'google-script',
      message: 'You are on the list.',
      warning: `Google Script subscriber sync failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function hashEmail(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 16);
}
