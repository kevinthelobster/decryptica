'use client';

/**
 * Core Web Vitals Collector
 * Uses native PerformanceObserver API (available in all modern browsers)
 * to collect LCP, FID, CLS, TTFB, FCP metrics and send to /api/seo/events.
 *
 * Part of DEC-111: SEO instrumentation and ranking telemetry
 */

import {
  CoreWebVitals,
  CwvSnapshotEvent,
  detectTemplateFromUrl,
  getCookie,
  generateUUID,
} from '@/app/data/seo-telemetry';

interface QueuedMetric {
  name: keyof CoreWebVitals;
  value: number;
  id: string;
  navigationType: string;
}

const ENDPOINT = '/api/seo/events';
const MAX_QUEUE_SIZE = 10;
const REPORT_INTERVAL_MS = 5000; // Report every 5s max to batch events

class CwvCollector {
  private queue: QueuedMetric[] = [];
  private sessionId: string = '';
  private url: string = '';
  private template: string = '';
  private articleSlug: string = '';
  private category: string = '';
  private reportTimer: ReturnType<typeof setInterval> | null = null;
  private navType: string = 'navigate';
  private connectionInfo: { effectiveType: string; saveData: boolean } | undefined;

  constructor() {
    if (typeof window === 'undefined') return;
    this.init();
  }

  private init(): void {
    this.sessionId = getCookie('dc_sid') || generateUUID();
    this.url = window.location.href;
    this.template = detectTemplateFromUrl(window.location.pathname);
    this.articleSlug = this.extractArticleSlug();
    this.category = this.extractCategory();

    // Capture navigation type
    this.navType = this.getNavigationType();

    // Capture connection info if available
    if ('connection' in navigator) {
      const conn = (navigator as Navigator & { connection?: { effectiveType: string; saveData: boolean } }).connection;
      if (conn) {
        this.connectionInfo = {
          effectiveType: conn.effectiveType || 'unknown',
          saveData: conn.saveData || false,
        };
      }
    }

    // Observe all CWV metrics
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Batch report every 5s
    this.reportTimer = setInterval(() => this.report(), REPORT_INTERVAL_MS);

    // Report on page hide (beforeunload, visibilitychange)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.report();
    });
  }

  private extractArticleSlug(): string {
    const match = window.location.pathname.match(/^\/blog\/([^/]+)/);
    return match ? match[1] : '';
  }

  private extractCategory(): string {
    const meta = document.querySelector('meta[property="article:section"]');
    if (meta) return meta.getAttribute('content') || '';
    const catEl = document.querySelector('[data-category]');
    if (catEl) return catEl.getAttribute('data-category') || '';
    return '';
  }

  private getNavigationType(): string {
    if (typeof performance === 'undefined') return 'navigate';
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return nav?.type || 'navigate';
  }

  private observeLCP(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformancePaintTiming & { startTime: number };
        if (last && last.startTime > 0) {
          this.enqueue({ name: 'lcp', value: Math.round(last.startTime), id: `lcp-${Date.now()}`, navigationType: this.navType });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {
      // LCP not supported
    }
  }

  private observeFID(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries as PerformanceEventTiming[]) {
          if (entry.processingStart > 0) {
            this.enqueue({ name: 'fid', value: Math.round(entry.processingStart - entry.startTime), id: `fid-${Date.now()}`, navigationType: this.navType });
          }
        }
      }).observe({ type: 'first-input', buffered: true });
    } catch (_) {
      // FID not supported
    }
  }

  private observeCLS(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    let clsValue = 0;
    let clsId = '';
    let clsLastReportTime = 0;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsId = `cls-${Date.now()}`;
            clsLastReportTime = entry.startTime;
          }
        }
        if (clsLastReportTime > 0) {
          this.enqueue({ name: 'cls', value: Math.round(clsValue * 1000) / 1000, id: clsId, navigationType: this.navType });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_) {
      // CLS not supported
    }
  }

  private observeFCP(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // FCP is the first paint after navigation start with non-blank background
        const fcpEntry = entries[0] as PerformancePaintTiming;
        if (fcpEntry && fcpEntry.startTime > 0) {
          this.enqueue({ name: 'fcp', value: Math.round(fcpEntry.startTime), id: `fcp-${Date.now()}`, navigationType: this.navType });
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (_) {
      // FCP not supported
    }
  }

  private observeTTFB(): void {
    if (typeof performance === 'undefined') return;
    // TTFB from navigation timing
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      const ttfb = nav.responseStart - nav.requestStart;
      if (ttfb > 0) {
        this.enqueue({ name: 'ttfb', value: Math.round(ttfb), id: `ttfb-${Date.now()}`, navigationType: this.navType });
      }
    }
  }

  private enqueue(metric: QueuedMetric): void {
    this.queue.push(metric);
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.report();
    }
  }

  private async report(): Promise<void> {
    if (this.queue.length === 0) return;

    // Group by metric name and take the worst (highest) value per metric per page load
    // For LCP/TTFB/FCP: latest is most representative
    // For CLS: cumulative is fine
    // For FID: worst first input is representative
    const latestByMetric: Record<string, QueuedMetric> = {};
    for (const m of this.queue) {
      if (m.name === 'cls') {
        // CLS is cumulative; only keep one
        if (!latestByMetric['cls']) latestByMetric['cls'] = m;
      } else if (m.name === 'fid') {
        // FID: take worst (highest)
        if (!latestByMetric['fid'] || m.value > latestByMetric['fid'].value) {
          latestByMetric['fid'] = m;
        }
      } else {
        // Others: latest wins
        latestByMetric[m.name] = m;
      }
    }

    this.queue = [];

    const metrics: Partial<CoreWebVitals> = {};
    for (const [, m] of Object.entries(latestByMetric)) {
      (metrics as Record<string, number>)[m.name] = m.value;
    }

    const event: CwvSnapshotEvent = {
      type: 'cwv_snapshot',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId || 'anon',
      url: this.url,
      template: this.template as CwvSnapshotEvent['template'],
      articleSlug: this.articleSlug || undefined,
      category: (this.category || undefined) as CwvSnapshotEvent['category'],
      metrics: metrics as CoreWebVitals,
      navigationType: this.navType as CwvSnapshotEvent['navigationType'],
      connectionInfo: this.connectionInfo,
    };

    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        // Use keepalive for beforeunload sends
        keepalive: true,
      });
    } catch (err) {
      console.error('[CWVCollector] report failed:', err);
      // Re-queue on failure (s有限 — put back at front)
      this.queue.unshift(...Object.values(latestByMetric));
    }
  }

  /** Call on component unmount */
  destroy(): void {
    if (this.reportTimer) clearInterval(this.reportTimer);
    this.report();
  }
}

// Export a singleton instance
let collectorInstance: CwvCollector | null = null;

export function getCwvCollector(): CwvCollector {
  if (!collectorInstance) {
    collectorInstance = new CwvCollector();
  }
  return collectorInstance;
}

export default CwvCollector;
