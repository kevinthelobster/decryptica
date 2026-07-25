'use client';

export type ReadingListArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  href: string;
  date: string;
  readTime: string;
};

export type ReadingListEntry = ReadingListArticle & {
  savedAt?: string;
  lastReadAt?: string;
};

export const SAVED_GUIDES_KEY = 'decryptica_saved_guides_v1';
export const RECENT_GUIDES_KEY = 'decryptica_recent_guides_v1';

const MAX_RECENT_ITEMS = 12;

function readEntries(key: string): ReadingListEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ReadingListEntry => {
      return Boolean(item && typeof item.slug === 'string' && typeof item.title === 'string');
    });
  } catch {
    return [];
  }
}

function writeEntries(key: string, entries: ReadingListEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(entries));
}

export function getSavedGuides() {
  return readEntries(SAVED_GUIDES_KEY);
}

export function getRecentGuides() {
  return readEntries(RECENT_GUIDES_KEY);
}

export function isGuideSaved(slug: string) {
  return getSavedGuides().some((entry) => entry.slug === slug);
}

export function saveGuide(article: ReadingListArticle) {
  const now = new Date().toISOString();
  const entries = getSavedGuides().filter((entry) => entry.slug !== article.slug);
  const next = [{ ...article, savedAt: now }, ...entries];
  writeEntries(SAVED_GUIDES_KEY, next);
  return next;
}

export function removeSavedGuide(slug: string) {
  const next = getSavedGuides().filter((entry) => entry.slug !== slug);
  writeEntries(SAVED_GUIDES_KEY, next);
  return next;
}

export function recordRecentGuide(article: ReadingListArticle) {
  const now = new Date().toISOString();
  const entries = getRecentGuides().filter((entry) => entry.slug !== article.slug);
  const next = [{ ...article, lastReadAt: now }, ...entries].slice(0, MAX_RECENT_ITEMS);
  writeEntries(RECENT_GUIDES_KEY, next);
  return next;
}
