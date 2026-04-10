/**
 * Analytics SDK for Decryptica KPI tracking
 * Uses @vercel/kv for event storage with 90-day TTL
 */

import { kv } from '@vercel/kv';

export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  sessionId: string;
  anonymousId?: string;
  userId?: string;
  articleSlug?: string;
  metadata?: Record<string, string | number | boolean>;
}

const TTL_90_DAYS = 60 * 60 * 24 * 90;

/**
 * Generate or retrieve the session ID from a cookie-style storage
 * Called client-side; falls back to cookie-based UUID storage
 */
export async function getSessionId(): Promise<string> {
  if (typeof window === 'undefined') return '';
  return getCookie('dc_sid') || '';
}

/**
 * Get or create a persistent anonymous user ID (localStorage)
 */
export async function getAnonymousId(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('dc_aid');
  if (stored) return stored;
  const newId = generateUUID();
  localStorage.setItem('dc_aid', newId);
  return newId;
}

/**
 * Generate a v4 UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get cookie value by name (client-side)
 */
export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Set a cookie (client-side)
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Track a page view event
 */
export async function trackPageView(
  articleSlug: string,
  category: string,
  metadata: Record<string, string | number | boolean> = {}
): Promise<void> {
  const sessionId = getCookie('dc_sid') || generateUUID();
  setCookie('dc_sid', sessionId, 365);
  const anonymousId = await getAnonymousId();

  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const isOrganic = /google|bing|duckduckgo/i.test(referrer);

  const event: AnalyticsEvent = {
    type: 'page_view',
    timestamp: new Date().toISOString(),
    sessionId,
    anonymousId,
    articleSlug,
    metadata: {
      category,
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer,
      isOrganicSearch: isOrganic,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...metadata,
    },
  };

  await trackEvent(event);
}

/**
 * Track a generic KPI event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const key = `kpi:${event.type}:${event.sessionId}:${Date.now()}`;
    await kv.set(key, JSON.stringify(event), { ex: TTL_90_DAYS });

    // Also increment daily counter for fast aggregations
    const date = new Date().toISOString().split('T')[0];
    const counterKey = `kpi:counter:${event.type}:${date}`;
    await kv.incr(counterKey);
    await kv.expire(counterKey, TTL_90_DAYS);

    // Track impressions by article slug
    if (event.type === 'page_view' && event.articleSlug) {
      const impressionKey = `kpi:impressions:${event.articleSlug}:${date}`;
      await kv.incr(impressionKey);
      await kv.expire(impressionKey, TTL_90_DAYS);
    }

    // Track signups
    if (event.type === 'signup') {
      const signupKey = `kpi:signups:${date}`;
      await kv.incr(signupKey);
      await kv.expire(signupKey, TTL_90_DAYS);
    }

    // Track activations
    if (event.type === 'activation') {
      const actKey = `kpi:activations:${date}`;
      await kv.incr(actKey);
      await kv.expire(actKey, TTL_90_DAYS);
    }
  } catch (err) {
    console.error('[Analytics] trackEvent failed:', err);
    // Non-blocking — never throw to caller
  }
}

/**
 * Check if visitor is coming from organic search
 */
export function isOrganicReferrer(): boolean {
  if (typeof document === 'undefined') return false;
  return /google|bing|duckduckgo|yahoo/i.test(document.referrer);
}