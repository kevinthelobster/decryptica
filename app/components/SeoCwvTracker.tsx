'use client';

/**
 * SeoCwvTracker — mounts the Core Web Vitals collector on the client.
 * Automatically captures CWV metrics on every page view and reports
 * to /api/seo/events without blocking rendering.
 *
 * Usage: Add <SeoCwvTracker /> once inside your root layout (client boundary).
 * It will run silently in the background for all page navigations.
 *
 * Part of DEC-111: SEO instrumentation and ranking telemetry
 */

import { useEffect, useRef } from 'react';
import { getCwvCollector } from '@/app/lib/analytics/cwv';

export default function SeoCwvTracker(): null {
  const collectorRef = useRef<ReturnType<typeof getCwvCollector> | null>(null);

  useEffect(() => {
    // Mount collector on first client-side render
    collectorRef.current = getCwvCollector();

    return () => {
      collectorRef.current?.destroy();
      collectorRef.current = null;
    };
  }, []);

  return null;
}
