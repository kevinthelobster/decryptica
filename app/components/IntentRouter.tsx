'use client';

import { useEffect } from 'react';
import TrackedLink from './TrackedLink';
import { trackEvent } from '../lib/analytics';
import { isIntentContinuityEnabled } from '../lib/intent-continuity';

type RouterLocation = 'home_intent_router' | 'topic_intent_router';
type RouterCategory = 'crypto' | 'ai' | 'automation' | 'all';
type RouterVariant = 'default' | 'compact';

interface IntentRouterProps {
  location: RouterLocation;
  category: RouterCategory;
  variant?: RouterVariant;
  learnHref: string;
}

interface IntentCard {
  id: 'learn' | 'calculate' | 'implement';
  title: string;
  description: string;
  href: string;
  className: string;
}

export default function IntentRouter({
  location,
  category,
  variant = 'default',
  learnHref,
}: IntentRouterProps) {
  const continuityEnabled = isIntentContinuityEnabled();

  useEffect(() => {
    if (!continuityEnabled) {
      return;
    }

    trackEvent({
      type: 'intent_router_impression',
      metadata: {
        location,
        category,
        variant,
      },
    }).catch(() => undefined);
  }, [category, continuityEnabled, location, variant]);

  if (!continuityEnabled) {
    return null;
  }

  const cards: IntentCard[] = [
    {
      id: 'learn',
      title: 'Learn',
      description: 'Read the latest practical breakdowns without the hype.',
      href: learnHref,
      className: 'from-cyan-500/20 to-cyan-400/5 border-cyan-300/20',
    },
    {
      id: 'calculate',
      title: 'Calculate',
      description: 'Estimate model costs before you commit engineering time.',
      href: '/tools/ai-price-calculator',
      className: 'from-indigo-500/20 to-indigo-400/5 border-indigo-300/20',
    },
    {
      id: 'implement',
      title: 'Implement',
      description: 'Get expert help shipping reliable AI automation systems.',
      href: '/services/ai-automation-consulting',
      className: 'from-emerald-500/20 to-emerald-400/5 border-emerald-300/20',
    },
  ];

  return (
    <section
      className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 ${variant === 'compact' ? 'p-4 md:p-5' : 'p-5 md:p-7'}`}
      aria-label="Intent router"
    >
      <div className="mb-4 md:mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Next Step</p>
        <h2 className={`${variant === 'compact' ? 'text-xl' : 'text-2xl md:text-3xl'} mt-1 font-display font-semibold text-white`}>
          Choose your path
        </h2>
      </div>

      <div className={`grid grid-cols-1 ${variant === 'compact' ? 'gap-3 md:grid-cols-3 md:gap-4' : 'gap-4 md:grid-cols-3 md:gap-5'}`}>
        {cards.map((card) => (
          <article
            key={card.id}
            className={`rounded-xl border bg-gradient-to-b ${card.className} p-4 md:p-5`}
          >
            <h3 className="font-display text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{card.description}</p>
            <TrackedLink
              href={card.href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-300 underline decoration-indigo-400/60 underline-offset-4 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              eventType="cta_click"
              metadata={{ location, cta: card.id, category }}
            >
              {card.id === 'learn' ? 'Read now' : card.id === 'calculate' ? 'Open calculator' : 'Book audit'}
            </TrackedLink>
          </article>
        ))}
      </div>
    </section>
  );
}
