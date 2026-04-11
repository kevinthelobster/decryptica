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
      accentClassName: 'border-cyan-400/30 text-cyan-300',
    },
    {
      id: 'calculate',
      eyebrow: 'Compare',
      heading: 'Estimate ROI before you build',
      body: 'Model impact and tradeoffs with clear assumptions in minutes.',
      ctaLabel: 'Calculate ROI',
      href: '/tools/ai-price-calculator',
      accentClassName: 'border-blue-400/30 text-blue-300',
    },
    {
      id: 'implement',
      eyebrow: 'Start',
      heading: 'Turn strategy into a 7-day rollout plan',
      body: 'Get scoped implementation guidance for fast, low-risk execution.',
      ctaLabel: 'Start Implementation',
      href: '/services/ai-automation-consulting',
      accentClassName: 'border-emerald-400/30 text-emerald-300',
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

  return (
    <section ref={sectionRef} className="mt-10 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-emerald-500/5 p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-white">Best next action for this article</h3>
        {context.intent && (
          <p className="text-xs text-zinc-400">
            Prioritized for <span className="font-semibold text-zinc-200">{context.intent}</span> intent
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${card.accentClassName}`}>
              {card.eyebrow}
            </p>
            <h4 className="mt-3 font-display text-base font-semibold text-white">{card.heading}</h4>
            <p className="mt-2 text-sm text-zinc-400">{card.body}</p>
            <TrackedLink
              href={card.href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 underline decoration-indigo-400/60 underline-offset-4 hover:text-indigo-200"
              eventType="cta_click"
              articleSlug={articleSlug}
              metadata={{ location: 'article_conversion_strip', cta: card.id, category }}
            >
              {card.ctaLabel}
            </TrackedLink>
          </article>
        ))}
      </div>
    </section>
  );
}
