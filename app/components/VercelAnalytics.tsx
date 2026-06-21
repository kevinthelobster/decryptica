'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';

function filterAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const pathname = new URL(event.url).pathname;

    if (
      pathname.startsWith('/prompts/admin') ||
      pathname.startsWith('/dashboard')
    ) {
      return null;
    }
  } catch {
    return event;
  }

  return event;
}

export default function VercelAnalytics() {
  return <Analytics beforeSend={filterAnalyticsEvent} />;
}
