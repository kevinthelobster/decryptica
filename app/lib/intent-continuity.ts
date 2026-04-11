export type IntentValue = 'learn' | 'calculate' | 'implement';
export type IntentDerivedFrom = 'url' | 'session' | 'default';

export interface IntentContext {
  intent: IntentValue | null;
  intentSource: string;
  intentDerivedFrom: IntentDerivedFrom;
}

interface StoredIntentPayload {
  intent: IntentValue;
  source: string;
  category: string;
  timestamp: string;
}

const INTENT_STORAGE_KEY = 'dc_entry_intent';

export function isIntentContinuityEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INTENT_CONTINUITY_V1 !== '0';
}

export function isIntentValue(value: unknown): value is IntentValue {
  return value === 'learn' || value === 'calculate' || value === 'implement';
}

export function getStoredIntent(): StoredIntentPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(INTENT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredIntentPayload>;
    if (!parsed || !isIntentValue(parsed.intent)) {
      return null;
    }

    return {
      intent: parsed.intent,
      source: parsed.source || 'unknown',
      category: parsed.category || 'all',
      timestamp: parsed.timestamp || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function upsertIntent(
  intent: IntentValue,
  source: string,
  category: string = 'all'
): { changed: boolean; previousIntent: IntentValue | null } {
  if (typeof window === 'undefined') {
    return { changed: false, previousIntent: null };
  }

  const previous = getStoredIntent();
  const changed = previous?.intent !== intent;

  const payload: StoredIntentPayload = {
    intent,
    source,
    category,
    timestamp: new Date().toISOString(),
  };

  window.sessionStorage.setItem(INTENT_STORAGE_KEY, JSON.stringify(payload));

  return {
    changed,
    previousIntent: previous?.intent ?? null,
  };
}

export function resolveIntentContext(searchParamsLike?: URLSearchParams | ReadonlyURLSearchParams | string): IntentContext {
  const params = normalizeSearchParams(searchParamsLike);
  const fromUrl = params.get('intent');

  if (isIntentValue(fromUrl)) {
    return {
      intent: fromUrl,
      intentSource: 'url',
      intentDerivedFrom: 'url',
    };
  }

  const fromSession = getStoredIntent();
  if (fromSession) {
    return {
      intent: fromSession.intent,
      intentSource: fromSession.source,
      intentDerivedFrom: 'session',
    };
  }

  return {
    intent: null,
    intentSource: 'none',
    intentDerivedFrom: 'default',
  };
}

export function buildHrefWithIntent(href: string, intent: IntentValue | null): string {
  if (!intent || !href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }

  const isAbsolute = /^https?:\/\//i.test(href);
  if (isAbsolute) {
    try {
      const url = new URL(href);
      if (typeof window !== 'undefined' && url.origin !== window.location.origin) {
        return href;
      }
      if (!url.searchParams.has('intent')) {
        url.searchParams.set('intent', intent);
      }
      return url.pathname + url.search + url.hash;
    } catch {
      return href;
    }
  }

  try {
    const url = new URL(href, 'http://localhost');
    if (!url.searchParams.has('intent')) {
      url.searchParams.set('intent', intent);
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return href;
  }
}

function normalizeSearchParams(searchParamsLike?: URLSearchParams | ReadonlyURLSearchParams | string): URLSearchParams {
  if (!searchParamsLike) {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }

  if (typeof searchParamsLike === 'string') {
    return new URLSearchParams(searchParamsLike.startsWith('?') ? searchParamsLike.slice(1) : searchParamsLike);
  }

  return new URLSearchParams(searchParamsLike.toString());
}

type ReadonlyURLSearchParams = {
  toString(): string;
};
