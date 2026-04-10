'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';

type MetadataValue = string | number | boolean;

interface TrackedLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  eventType: 'article_click' | 'cta_click' | 'toc_jump';
  articleSlug?: string;
  metadata?: Record<string, MetadataValue>;
}

export default function TrackedLink({
  href,
  className,
  children,
  eventType,
  articleSlug,
  metadata,
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackEvent({
          type: eventType,
          articleSlug,
          metadata: {
            href,
            ...metadata,
          },
        }).catch((err) => {
          console.error('[TrackedLink] event failed:', err);
        });
      }}
    >
      {children}
    </Link>
  );
}
