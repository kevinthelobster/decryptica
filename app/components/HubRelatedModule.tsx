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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 md:p-6" aria-label={heading}>
      <h3 className="font-display text-lg font-semibold text-white">{heading}</h3>
      {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <TrackedLink
            key={item.articleSlug}
            href={item.href}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 transition-colors hover:border-indigo-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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
              <span className="rounded-full border border-indigo-400/30 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-indigo-300">
                {item.intentBadge}
              </span>
              <span className="text-xs text-zinc-500">{item.readTime}</span>
            </div>
            <h4 className="mt-3 font-display text-sm font-semibold text-white group-hover:text-indigo-300">{item.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{item.valueProp}</p>
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}
