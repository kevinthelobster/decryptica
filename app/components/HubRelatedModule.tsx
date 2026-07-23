'use client';

import { useEffect, useMemo } from 'react';
import TrackedLink from './TrackedLink';
import { trackEvent } from '../lib/analytics';
import { resolveIntentContext } from '../lib/intent-continuity';

interface RelatedItem {
  href: string;
  title: string;
  valueProp: string;
  readTime: string;
  intentBadge: 'Learn' | 'Calculate' | 'Implement';
  articleSlug: string;
}

interface HubRelatedModuleProps {
  heading: string;
  description?: string;
  items: RelatedItem[];
  surface: 'topic' | 'article';
  location: string;
  moduleVariant: string;
  slug: string;
  category: string;
}

export default function HubRelatedModule({
  heading,
  description,
  items,
  surface,
  location,
  moduleVariant,
  slug,
  category,
}: HubRelatedModuleProps) {
  const context = useMemo(() => resolveIntentContext(), []);

  useEffect(() => {
    if (!items.length) return;

    trackEvent({
      type: 'related_module_impression',
      articleSlug: slug,
      metadata: {
        intent: context.intent || 'learn',
        intentSource: context.intentSource,
        surface,
        location,
        moduleVariant,
        slug,
        category,
        itemCount: items.length,
      },
    }).catch(() => undefined);
  }, [category, context.intent, context.intentSource, items.length, location, moduleVariant, slug, surface]);

  if (!items.length) return null;

  return (
    <section className="border border-stone-200 bg-neutral-50 p-5 md:p-6" aria-label={heading}>
      <h3 className="font-display text-lg font-semibold text-stone-950">{heading}</h3>
      {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <TrackedLink
            key={item.articleSlug}
            href={item.href}
            className="group border border-stone-200 bg-white p-4 transition-colors hover:border-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900"
            eventType="related_module_click"
            articleSlug={item.articleSlug}
            metadata={{
              intent: context.intent || 'learn',
              intentSource: context.intentSource,
              surface,
              location,
              moduleVariant,
              slug,
              category,
              cta: 'related_guide',
              targetSlug: item.articleSlug,
              intentBadge: item.intentBadge.toLowerCase(),
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="border border-stone-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-900">
                {item.intentBadge}
              </span>
              <span className="text-xs text-stone-500">{item.readTime}</span>
            </div>
            <h4 className="mt-3 font-display text-sm font-semibold text-stone-950 group-hover:text-red-900">{item.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">{item.valueProp}</p>
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}
