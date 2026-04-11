'use client';

import { useEffect } from 'react';
import { trackEvent } from '../lib/analytics';

interface RouteDepthTrackerProps {
  depth: number;
  pillar: string;
  subpillar?: string;
}

function getEntryRoute(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '/';
  }

  if (!document.referrer) {
    return '/';
  }

  try {
    const ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) {
      return '(external)';
    }
    return ref.pathname;
  } catch {
    return '/';
  }
}

export default function RouteDepthTracker({ depth, pillar, subpillar }: RouteDepthTrackerProps) {
  useEffect(() => {
    trackEvent({
      type: 'route_depth_progress',
      metadata: {
        entryRoute: getEntryRoute(),
        currentRoute: window.location.pathname,
        depth,
        pillar,
        subpillar: subpillar || 'none',
      },
    }).catch((err) => {
      console.error('[RouteDepthTracker] trackEvent failed:', err);
    });
  }, [depth, pillar, subpillar]);

  return null;
}
