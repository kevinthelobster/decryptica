/**
 * SEO Telemetry Data Model
 * Defines types for SEO instrumentation: indexation, rankings, CWV, impressions.
 * Used by both client-side collector and server-side aggregation.
 *
 * Part of DEC-111: SEO instrumentation and ranking telemetry
 */

// ─── Core Telemetry Types ─────────────────────────────────────────────────────

export interface CoreWebVitals {
  /** Largest Contentful Paint (ms) */
  lcp: number;
  /** First Input Delay (ms) */
  fid: number;
  /** Cumulative Layout Shift (unitless) */
  cls: number;
  /** Time to First Byte (ms) */
  ttfb: number;
  /** First Contentful Paint (ms) */
  fcp: number;
  /** Interaction to Next Paint (ms) - INP replaced FID in 2024 */
  inp?: number;
}

export interface CwvThresholds {
  good: number;
  needsImprovement: number;
  poor: number;
}

export const CWV_THRESHOLDS: Record<keyof Omit<CoreWebVitals, 'inp'>, CwvThresholds> = {
  lcp: { good: 2500, needsImprovement: 4000, poor: Infinity },
  fid: { good: 100, needsImprovement: 300, poor: Infinity },
  cls: { good: 0.1, needsImprovement: 0.25, poor: Infinity },
  ttfb: { good: 800, needsImprovement: 1800, poor: Infinity },
  fcp: { good: 1800, needsImprovement: 3000, poor: Infinity },
};

export type CwvRating = 'good' | 'needs-improvement' | 'poor';

export function rateCwv(metric: keyof Omit<CoreWebVitals, 'inp'>, value: number): CwvRating {
  if (value <= CWV_THRESHOLDS[metric].good) return 'good';
  if (value <= CWV_THRESHOLDS[metric].needsImprovement) return 'needs-improvement';
  return 'poor';
}

// ─── Page Template Types ─────────────────────────────────────────────────────

export type PageTemplate =
  | 'home'
  | 'topic'
  | 'article'
  | 'blog-list'
  | 'tools'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'prompts'
  | 'builds'
  | 'toolbox';

export const PAGE_TEMPLATE_SLUGS: Record<PageTemplate, string> = {
  home: '/',
  topic: '/topic/[slug]',
  article: '/blog/[slug]',
  'blog-list': '/blog',
  tools: '/tools',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  prompts: '/prompts',
  builds: '/builds',
  toolbox: '/toolbox',
};

// ─── SEO Event Types ─────────────────────────────────────────────────────────

export type SeoEventType =
  | 'page_view'
  | 'cwv_snapshot'
  | 'ranking_update'
  | 'indexation_check';

export interface SeoPageViewEvent {
  type: 'page_view';
  timestamp: string;
  sessionId: string;
  url: string;
  referrer: string;
  articleSlug?: string;
  category?: 'crypto' | 'ai' | 'automation';
  template: PageTemplate;
  isOrganicSearch: boolean;
  searchQuery?: string;        // If from organic search, the detected query
  country?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  coreWebVitals?: Partial<CoreWebVitals>; // Collected on page load
}

export interface CwvSnapshotEvent {
  type: 'cwv_snapshot';
  timestamp: string;
  sessionId: string;
  url: string;
  template: PageTemplate;
  articleSlug?: string;
  category?: 'crypto' | 'ai' | 'automation';
  metrics: CoreWebVitals;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
  connectionInfo?: {
    effectiveType: string;  // '4g', '3g', etc.
    saveData: boolean;
  };
}

export interface RankingUpdateEvent {
  type: 'ranking_update';
  timestamp: string;
  keyword: string;
  articleSlug: string;
  position: number;
  previousPosition?: number;
  searchVolume?: number;
  difficulty?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  engine: 'google' | 'bing';
  country: string;
  device: 'mobile' | 'desktop' | 'all';
}

export interface IndexationCheckEvent {
  type: 'indexation_check';
  timestamp: string;
  url: string;
  status: 'indexed' | 'not_indexed' | 'error';
  statusCode?: number;
  indexedAt?: string;
  DiscoverableVia?: 'sitemap' | 'direct' | 'backlink' | 'canonical';
}

export type SeoEvent = SeoPageViewEvent | CwvSnapshotEvent | RankingUpdateEvent | IndexationCheckEvent;

// ─── Daily Rollup Types ───────────────────────────────────────────────────────

export interface DailyPageMetrics {
  date: string;                    // YYYY-MM-DD
  url: string;
  articleSlug?: string;
  category?: 'crypto' | 'ai' | 'automation';
  template: PageTemplate;
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration?: number;      // seconds
  bounceRate?: number;              // 0-1
  impressions?: number;             // From Search Console
  clicks?: number;
  ctr?: number;
  avgPosition?: number;
  // CWV aggregates (p75)
  lcpP75?: number;
  fidP75?: number;
  clsP75?: number;
  ttfbP75?: number;
  fcpP75?: number;
  inpP75?: number;
  // CWV ratings (% in good/neds improve/poor)
  lcpGoodPct?: number;
  fidGoodPct?: number;
  clsGoodPct?: number;
}

export interface DailyCheckpointReport {
  generatedAt: string;
  date: string;
  summary: {
    totalPageViews: number;
    totalUniqueVisitors: number;
    totalArticles: number;
    avgCwvScore: number;           // Composite 0-100 score
    pagesAboveCwvThreshold: number;
    totalIndexedPages: number;
    totalTrackedKeywords: number;
    keywordsInTop10: number;
    keywordsInTop3: number;
    avgSearchRanking: number;
  };
  byCategory: {
    category: 'crypto' | 'ai' | 'automation';
    pageViews: number;
    articles: number;
    avgCwvScore: number;
    topArticle?: { slug: string; title: string; pageViews: number };
  }[];
  topPages: {
    url: string;
    slug?: string;
    pageViews: number;
    avgPosition?: number;
    cwvScore?: number;
  }[];
  cwvBreakdown: {
    metric: keyof Omit<CoreWebVitals, 'inp'>;
    p50: number;
    p75: number;
    p95: number;
    goodPct: number;
    needsImprovementPct: number;
    poorPct: number;
  }[];
  rankingChanges: {
    keyword: string;
    articleSlug: string;
    previousPosition?: number;
    currentPosition: number;
    change: number;               // Negative = improved
    changeType: 'improved' | 'declined' | 'new' | 'dropped';
  }[];
  indexationStatus: {
    totalUrls: number;
    indexed: number;
    notIndexed: number;
    indexRate: number;            // 0-1
  };
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface SeoDashboard {
  current: {
    pageViews30d: number;
    uniqueVisitors30d: number;
    indexedPages: number;
    trackedKeywords: number;
    top10Keywords: number;
    top3Keywords: number;
    avgCwvScore: number;
    avgSearchRanking: number;
  };
  trends: {
    pageViewsTrend: number;       // % change vs previous 30d
    rankingTrend: number;
    cwvTrend: number;
    indexationTrend: number;
  };
  byTemplate: {
    template: PageTemplate;
    pageViews: number;
    avgLcp: number;
    avgCls: number;
    avgFid: number;
    indexRate: number;
  }[];
  topKeywords: {
    keyword: string;
    articleSlug: string;
    position: number;
    impressions: number;
    clicks: number;
    ctr: number;
    trend: number;
  }[];
  crawlHealth: {
    lastCrawlAt?: string;
    pagesCrawled: number;
    errors: number;
    avgResponseTime: number;
  };
}

// ─── Vercel KV Key Patterns ──────────────────────────────────────────────────

export const SEO_KV = {
  // Events
  eventKey: (type: SeoEventType, sessionId: string, ts: string) =>
    `seo:event:${type}:${sessionId}:${ts}`,

  // Daily counters
  dailyPvKey: (date: string, url: string) =>
    `seo:pv:${date}:${url}`,

  dailyUniqueKey: (date: string, url: string) =>
    `seo:uv:${date}:${url}`,

  // CWV metrics (histogram bins for percentile calculation)
  cwvMetricKey: (date: string, url: string, metric: string) =>
    `seo:cwv:${date}:${url}:${metric}`,

  // Rankings
  rankingKey: (keyword: string, engine: string, country: string, device: string) =>
    `seo:rank:${engine}:${country}:${device}:${keyword}`,

  rankingHistoryKey: (keyword: string) =>
    `seo:rank:history:${keyword}`,

  // Indexation
  indexationKey: (url: string) =>
    `seo:index:${url}`,

  // Daily rollups
  dailyRollupKey: (date: string) =>
    `seo:rollup:${date}`,

  // Checkpoint report
  checkpointKey: (date: string) =>
    `seo:checkpoint:${date}`,
};

// ─── Helius/RPC SEO Enrichment ────────────────────────────────────────────────
// Placeholder for future integration with Helius for on-chain SEO signals

export interface OnChainSeoSignals {
  articleSlug: string;
  discussionVolume?: number;    // Social buzz
  holderMentions?: number;      // Community mentions
  searchInterestScore?: number; // External search correlation
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function computeCwvScore(cwv: CoreWebVitals): number {
  // Convert CWV metrics to a 0-100 score (100 = perfect)
  const lcpScore = Math.max(0, 1 - cwv.lcp / 5000) * 25;
  const fidScore = Math.max(0, 1 - cwv.fid / 500) * 25;
  const clsScore = Math.max(0, 1 - cwv.cls / 0.5) * 25;
  const ttfbScore = Math.max(0, 1 - cwv.ttfb / 3000) * 12.5;
  const fcpScore = Math.max(0, 1 - cwv.fcp / 4000) * 12.5;
  return Math.round(lcpScore + fidScore + clsScore + ttfbScore + fcpScore);
}

export function detectTemplateFromUrl(url: string): PageTemplate {
  if (url === '/' || url === '') return 'home';
  if (url.startsWith('/topic/')) return 'topic';
  if (url.startsWith('/blog/')) return 'article';
  if (url === '/blog') return 'blog-list';
  if (url.startsWith('/tools')) return 'tools';
  if (url === '/about') return 'about';
  if (url === '/contact') return 'contact';
  if (url === '/privacy') return 'privacy';
  if (url.startsWith('/prompts')) return 'prompts';
  if (url.startsWith('/builds')) return 'builds';
  if (url.startsWith('/toolbox')) return 'toolbox';
  return 'article';
}

export function todayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Client-side Utilities (shared with CWV collector) ───────────────────────

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
