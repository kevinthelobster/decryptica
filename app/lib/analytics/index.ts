/**
 * Client analytics helpers for UX and funnel instrumentation.
 * Sends non-blocking events to /api/analytics.
 */

export interface AnalyticsEvent {
  type: string;
  timestamp?: string;
  sessionId?: string;
  anonymousId?: string;
  userId?: string;
  articleSlug?: string;
  metadata?: Record<string, string | number | boolean>;
}

const SESSION_COOKIE = 'dc_sid';
const ANON_STORAGE_KEY = 'dc_aid';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

async function getAnonymousId(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem(ANON_STORAGE_KEY);
  if (existing) return existing;
  const next = generateUUID();
  localStorage.setItem(ANON_STORAGE_KEY, next);
  return next;
}

async function buildBase(): Promise<Pick<AnalyticsEvent, 'timestamp' | 'sessionId' | 'anonymousId'>> {
  const sessionId = getCookie(SESSION_COOKIE) || generateUUID();
  setCookie(SESSION_COOKIE, sessionId, 365);

  return {
    timestamp: new Date().toISOString(),
    sessionId,
    anonymousId: await getAnonymousId(),
  };
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const base = await buildBase();
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: JSON.stringify({
        ...base,
        ...event,
        metadata: event.metadata || {},
      }),
    });
  } catch (err) {
    console.error('[Analytics] trackEvent failed:', err);
  }
}

export async function trackPageView(
  articleSlug: string,
  category: string,
  metadata: Record<string, string | number | boolean> = {}
): Promise<void> {
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const isOrganic = /google|bing|duckduckgo|yahoo/i.test(referrer);

  await trackEvent({
    type: 'page_view',
    articleSlug,
    metadata: {
      category,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer,
      isOrganicSearch: isOrganic,
      ...metadata,
    },
  });
}

export function isOrganicReferrer(): boolean {
  if (typeof document === 'undefined') return false;
  return /google|bing|duckduckgo|yahoo/i.test(document.referrer);
}
