'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import TrackedLink from './TrackedLink';
import { resolveIntentContext } from '../lib/intent-continuity';

interface IntentAwareConversionStripProps {
  articleSlug: string;
  category: string;
}

interface CtaCard {
  id: 'learn' | 'calculate' | 'implement';
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  href: string;
  accentClassName: string;
}

function buildCards(category: string): CtaCard[] {
  return [
    {
      id: 'learn',
      eyebrow: 'Explore',
      heading: `Get practical playbooks for ${category}`,
      body: 'Actionable lessons from real deployments, delivered in plain language.',
      ctaLabel: 'Get Insights',
      href: '#subscribe',
      accentClassName: 'border-stone-300 text-red-900',
    },
    {
      id: 'calculate',
      eyebrow: 'Compare',
      heading: 'Estimate ROI before you build',
      body: 'Model impact and tradeoffs with clear assumptions in minutes.',
      ctaLabel: 'Calculate ROI',
      href: '/tools/ai-price-calculator',
      accentClassName: 'border-stone-300 text-red-900',
    },
    {
      id: 'implement',
      eyebrow: 'Start',
      heading: 'Turn strategy into a 7-day rollout plan',
      body: 'Get scoped implementation guidance for fast, low-risk execution.',
      ctaLabel: 'Start Implementation',
      href: '/services/ai-automation-consulting',
      accentClassName: 'border-stone-300 text-red-900',
    },
  ];
}

export default function IntentAwareConversionStrip({ articleSlug, category }: IntentAwareConversionStripProps) {
  const [context, setContext] = useState(() => resolveIntentContext());
  const sectionRef = useRef<HTMLElement>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    setContext(resolveIntentContext());
  }, []);

  useEffect(() => {
    const onIntentUpdated = () => setContext(resolveIntentContext());
    window.addEventListener('dc:intent-updated', onIntentUpdated);
    return () => window.removeEventListener('dc:intent-updated', onIntentUpdated);
  }, []);

  // Track CTA_view when section enters the viewport
  useEffect(() => {
    if (!sectionRef.current || viewTracked.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !viewTracked.current) {
          viewTracked.current = true;
          trackEvent({
            type: 'cta_view',
            articleSlug,
            metadata: {
              location: 'article_conversion_strip',
              category,
            },
          }).catch(() => undefined);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [articleSlug, category]);

  const cards = useMemo(() => {
    const baseCards = buildCards(category);
    if (!context.intent) {
      return baseCards;
    }

    const prioritized = baseCards.find((card) => card.id === context.intent);
    const remaining = baseCards.filter((card) => card.id !== context.intent);

    return prioritized ? [prioritized, ...remaining] : baseCards;
  }, [category, context.intent]);

  const primaryCard = cards[0];
  const secondaryCards = cards.slice(1);

  return (
    <section ref={sectionRef} className="mt-10 border border-stone-200 bg-neutral-50 p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-stone-950">Best next action for this article</h3>
        {context.intent && (
          <p className="text-xs text-stone-500">
            Prioritized for <span className="font-semibold text-stone-800">{context.intent}</span> intent
          </p>
        )}
      </div>

      <article className="border border-stone-200 bg-white p-5">
        <p className={`inline-flex border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${primaryCard.accentClassName}`}>
          {primaryCard.eyebrow}
        </p>
        <h4 className="mt-3 font-display text-xl font-semibold text-stone-950">{primaryCard.heading}</h4>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">{primaryCard.body}</p>
        <TrackedLink
          href={primaryCard.href}
          className="mt-5 inline-flex items-center gap-2 bg-red-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-950"
          eventType="cta_click"
          articleSlug={articleSlug}
          metadata={{ location: 'article_conversion_strip', cta: primaryCard.id, category }}
        >
          {primaryCard.ctaLabel}
        </TrackedLink>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-sm">
          {secondaryCards.map((card) => (
            <TrackedLink
              key={card.id}
              href={card.href}
              className="text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-red-900"
              eventType="cta_click"
              articleSlug={articleSlug}
              metadata={{ location: 'article_conversion_strip', cta: card.id, category }}
            >
              {card.ctaLabel}
            </TrackedLink>
          ))}
        </div>
      </article>
    </section>
  );
}
