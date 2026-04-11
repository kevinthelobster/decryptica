'use client';

import { useEffect } from 'react';
import { trackPageView } from '../lib/analytics/index';

interface AnalyticsTrackerProps {
  articleSlug: string;
  category: string;
}

export default function AnalyticsTracker({ articleSlug, category }: AnalyticsTrackerProps) {
  useEffect(() => {
    trackPageView(articleSlug, category, {
      impressionType: 'article',
      location: 'article_header',
      path: window.location.pathname,
    }).catch((err) => {
      console.error('[AnalyticsTracker] trackPageView failed:', err);
    });
  }, [articleSlug, category]);

  return null;
}
