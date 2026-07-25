'use client';

import { useEffect, useMemo } from 'react';
import TrackedLink from './TrackedLink';
import { trackEvent } from '../lib/analytics';
import { resolveIntentContext } from '../lib/intent-continuity';

export type ArticleNextJourneyCard = {
  id: 'start' | 'compare' | 'deepen';
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
  targetLabel: string;
  targetKind: 'article' | 'tool' | 'topic' | 'saved';
};

type ArticleNextJourneyProps = {
  articleSlug: string;
  category: string;
  subpillarName: string;
  subpillarPath: string;
  cards: ArticleNextJourneyCard[];
};

export default function ArticleNextJourney({
  articleSlug,
  category,
  subpillarName,
  subpillarPath,
  cards,
}: ArticleNextJourneyProps) {
  const context = useMemo(() => resolveIntentContext(), []);

  useEffect(() => {
    if (!cards.length) return;

    trackEvent({
      type: 'next_journey_impression',
      articleSlug,
      metadata: {
        location: 'article_next_journey_footer',
        category,
        subpillar: subpillarName,
        cardCount: cards.length,
        intent: context.intent || 'learn',
        intentSource: context.intentSource,
      },
    }).catch(() => undefined);
  }, [articleSlug, cards.length, category, context.intent, context.intentSource, subpillarName]);

  if (!cards.length) return null;

  return (
    <section className="mt-8 border border-stone-200 bg-white" aria-label="Choose your next step">
      <div className="border-b border-stone-200 bg-neutral-50 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-900">Next reading path</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-stone-950">Choose what to do after this guide</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
              Move from this article into the most useful next step: context, comparison, or a deeper topic route.
            </p>
          </div>
          <TrackedLink
            href={subpillarPath}
            className="inline-flex shrink-0 items-center justify-center border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition-colors hover:border-red-900 hover:text-red-900"
            eventType="related_module_click"
            articleSlug={articleSlug}
            metadata={{
              location: 'article_next_journey_footer',
              category,
              cta: 'topic_path',
              targetHref: subpillarPath,
              targetKind: 'topic',
            }}
          >
            View {subpillarName}
          </TrackedLink>
        </div>
      </div>

      <div className="grid gap-px bg-stone-200 md:grid-cols-3">
        {cards.map((card) => (
          <TrackedLink
            key={card.id}
            href={card.href}
            className="group flex min-h-[220px] flex-col bg-white p-5 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2"
            eventType="related_module_click"
            articleSlug={articleSlug}
            metadata={{
              location: 'article_next_journey_footer',
              category,
              cta: card.id,
              targetHref: card.href,
              targetKind: card.targetKind,
              targetLabel: card.targetLabel,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="border border-stone-300 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-red-900">
                {card.eyebrow}
              </span>
              <span className="text-lg text-stone-400 transition-colors group-hover:text-red-900">-&gt;</span>
            </div>
            <h4 className="mt-4 font-display text-base font-semibold leading-snug text-stone-950 group-hover:text-red-900">
              {card.title}
            </h4>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{card.body}</p>
            <span className="mt-5 text-sm font-semibold text-stone-950 underline decoration-stone-300 underline-offset-4 group-hover:text-red-900">
              {card.ctaLabel}
            </span>
          </TrackedLink>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-200 bg-neutral-50 p-4 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Want to come back later? Save the article and keep building a private reading list.</span>
        <TrackedLink
          href="/saved"
          className="font-semibold text-red-900 underline decoration-stone-300 underline-offset-4 hover:text-stone-950"
          eventType="related_module_click"
          articleSlug={articleSlug}
          metadata={{
            location: 'article_next_journey_footer',
            category,
            cta: 'saved_guides',
            targetHref: '/saved',
            targetKind: 'saved',
          }}
        >
          Open saved guides
        </TrackedLink>
      </div>
    </section>
  );
}
