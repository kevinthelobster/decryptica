'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';
import {
  buildHrefWithIntent,
  isIntentContinuityEnabled,
  isIntentValue,
  resolveIntentContext,
  upsertIntent,
} from '../lib/intent-continuity';

type MetadataValue = string | number | boolean;

interface TrackedLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  eventType:
    | 'article_click'
    | 'cta_click'
    | 'toc_jump'
    | 'hub_nav_click'
    | 'related_module_click'
    | 'hub_primary_cta_click'
    | 'hub_secondary_cta_click';
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
  const continuityEnabled = isIntentContinuityEnabled();
  const intentFromCta = isIntentValue(metadata?.cta) ? metadata.cta : null;
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);

  useEffect(() => {
    if (!continuityEnabled) {
      return;
    }

    setCurrentIntent(resolveIntentContext().intent);
  }, [continuityEnabled]);

  const resolvedIntent = useMemo(() => {
    if (!continuityEnabled) {
      return null;
    }

    if (intentFromCta) {
      return intentFromCta;
    }

    return isIntentValue(currentIntent) ? currentIntent : null;
  }, [continuityEnabled, currentIntent, intentFromCta]);

  const hrefWithIntent = useMemo(() => {
    if (!continuityEnabled) {
      return href;
    }

    return buildHrefWithIntent(href, resolvedIntent);
  }, [continuityEnabled, href, resolvedIntent]);

  return (
    <Link
      href={hrefWithIntent}
      className={className}
      onClick={() => {
        const contextBeforeClick = continuityEnabled
          ? resolveIntentContext()
          : { intent: null, intentSource: 'none', intentDerivedFrom: 'default' as const };

        let activeIntent = contextBeforeClick.intent;
        let intentSource = contextBeforeClick.intentSource;
        let intentDerivedFrom = contextBeforeClick.intentDerivedFrom;

        if (continuityEnabled && intentFromCta) {
          const source = typeof metadata?.location === 'string' ? metadata.location : 'tracked_link';
          const category = typeof metadata?.category === 'string' ? metadata.category : 'all';
          const result = upsertIntent(intentFromCta, source, category);

          activeIntent = intentFromCta;
          intentSource = source;
          intentDerivedFrom = 'session';

          if (result.changed) {
            trackEvent({
              type: 'intent_set',
              articleSlug,
              metadata: {
                intent: intentFromCta,
                intentSource: source,
                intentDerivedFrom: 'session',
                location: source,
                category,
              },
            }).catch(() => undefined);
          }
        }

        trackEvent({
          type: eventType,
          articleSlug,
          metadata: {
            href: hrefWithIntent,
            ...metadata,
            ...(continuityEnabled
              ? {
                  intent: activeIntent || 'learn',
                  intentSource,
                  intentDerivedFrom,
                }
              : {}),
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
