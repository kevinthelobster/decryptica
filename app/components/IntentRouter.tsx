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
  kicker: string;
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
      title: 'Read the reporting',
      description: 'Start with the newest analysis and background pieces before making a tooling or market decision.',
      href: learnHref,
      kicker: 'Research',
    },
    {
      id: 'calculate',
      title: 'Pressure-test the numbers',
      description: 'Use the AI price calculator to compare model costs before committing engineering time.',
      href: '/tools/ai-price-calculator',
      kicker: 'Tool',
    },
    {
      id: 'implement',
      title: 'Plan the rollout',
      description: 'Bring in implementation help when the question shifts from research to a working system.',
      href: '/services/ai-automation-consulting',
      kicker: 'Advisory',
    },
  ];

  return (
    <section
      className={`border border-stone-300 bg-white ${variant === 'compact' ? 'p-4 md:p-5' : 'p-5 md:p-6'}`}
      aria-label="Intent router"
    >
      <div className="mb-4 border-b-2 border-stone-900 pb-2 md:mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Next step</p>
        <h2 className={`${variant === 'compact' ? 'text-xl' : 'text-2xl md:text-3xl'} mt-1 font-serif font-black text-stone-950`}>
          Continue by intent
        </h2>
      </div>

      <div className={`grid grid-cols-1 ${variant === 'compact' ? 'gap-3 md:grid-cols-3 md:gap-4' : 'gap-4 md:grid-cols-3 md:gap-5'}`}>
        {cards.map((card) => (
          <article
            key={card.id}
            className="flex min-h-[12rem] flex-col border border-stone-200 bg-neutral-50 p-4 md:p-5"
          >
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">{card.kicker}</p>
            <h3 className="mt-2 font-serif text-xl font-black leading-tight text-stone-950">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{card.description}</p>
            <TrackedLink
              href={card.href}
              className="mt-auto inline-flex pt-4 text-sm font-bold uppercase tracking-[0.1em] text-red-800 underline decoration-red-800/40 underline-offset-4 hover:text-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              eventType="cta_click"
              metadata={{ location, cta: card.id, category }}
            >
              {card.id === 'learn' ? 'Open archive' : card.id === 'calculate' ? 'Run calculator' : 'View service'}
            </TrackedLink>
          </article>
        ))}
      </div>
    </section>
  );
}
