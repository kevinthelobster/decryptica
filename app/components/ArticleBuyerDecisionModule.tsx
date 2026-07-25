'use client';

import { useEffect, useRef } from 'react';
import TrackedLink from './TrackedLink';
import { trackEvent } from '../lib/analytics';
import { resolveIntentContext } from '../lib/intent-continuity';

type DecisionOption = {
  label: string;
  bestFor: string;
  watch: string;
};

type ArticleBuyerDecisionModuleProps = {
  articleSlug: string;
  category: 'crypto' | 'ai' | 'automation';
  title: string;
  primaryActionHref?: string;
  subpillarPath: string;
};

function getDecisionOptions(category: ArticleBuyerDecisionModuleProps['category'], title: string): DecisionOption[] {
  const lowerTitle = title.toLowerCase();

  if (category === 'crypto' && lowerTitle.includes('rpc')) {
    return [
      {
        label: 'Public endpoint',
        bestFor: 'Learning, prototypes, and low-volume lookups where reliability is not the product.',
        watch: 'Rate limits, shared congestion, and weak guarantees during volatile windows.',
      },
      {
        label: 'Managed RPC',
        bestFor: 'Apps, dashboards, and trading tools that need consistent latency without running infra.',
        watch: 'Plan limits, add-on costs, archive access, and regional performance gaps.',
      },
      {
        label: 'Dedicated provider',
        bestFor: 'High-frequency bots, production workloads, and teams that need direct support.',
        watch: 'Custom pricing, setup time, and the need to benchmark your actual request mix.',
      },
    ];
  }

  if (category === 'crypto') {
    return [
      {
        label: 'Fast research',
        bestFor: 'Readers comparing market tools before committing real capital or workflow time.',
        watch: 'Marketing claims that skip liquidity, fees, custody, or operational risk.',
      },
      {
        label: 'Active execution',
        bestFor: 'Traders and builders who need cleaner data, faster routing, or automation support.',
        watch: 'Slippage, rate limits, wallet risk, and costs that only appear at higher volume.',
      },
      {
        label: 'Production stack',
        bestFor: 'Teams building repeatable systems around analytics, routing, or treasury operations.',
        watch: 'Support quality, API reliability, auditability, and fallback paths.',
      },
    ];
  }

  if (category === 'automation') {
    return [
      {
        label: 'No-code path',
        bestFor: 'Simple handoffs, notifications, and low-risk workflows that need to launch quickly.',
        watch: 'Task overages, brittle triggers, and confusing ownership when workflows fail.',
      },
      {
        label: 'Ops platform',
        bestFor: 'Repeatable business processes with approvals, retries, and clearer monitoring needs.',
        watch: 'SSO, audit logs, role controls, and whether pricing maps to real usage.',
      },
      {
        label: 'Custom build',
        bestFor: 'Core workflows where reliability, data boundaries, and integration depth matter.',
        watch: 'Maintenance burden, incident response, and whether the ROI justifies custom code.',
      },
    ];
  }

  return [
    {
      label: 'Seat-based tool',
      bestFor: 'Teams that need quick rollout, familiar UX, and broad everyday productivity coverage.',
      watch: 'Connector depth, admin visibility, premium limits, and hidden usage caps.',
    },
    {
      label: 'Workflow platform',
      bestFor: 'Operators automating repeatable processes across existing business apps.',
      watch: 'Task multipliers, failed-step behavior, approval paths, and tool-call logs.',
    },
    {
      label: 'API stack',
      bestFor: 'Product teams that need custom data handling, embedded UX, or strict control.',
      watch: 'Token spend, evals, caching, retries, observability, and security review.',
    },
  ];
}

function getDefaultCta(category: ArticleBuyerDecisionModuleProps['category'], primaryActionHref?: string, subpillarPath?: string) {
  if (primaryActionHref) return primaryActionHref;
  if (category === 'ai') return '/tools/ai-price-calculator';
  if (category === 'automation') return '/services/ai-automation-consulting';
  return subpillarPath || '/topic/crypto';
}

function getCtaLabel(href: string) {
  if (href.startsWith('/tools/')) return 'Run the calculator';
  if (href.startsWith('/services/')) return 'Ask for implementation help';
  if (href.startsWith('/blog/')) return 'Read the comparison';
  return 'Open the topic path';
}

export default function ArticleBuyerDecisionModule({
  articleSlug,
  category,
  title,
  primaryActionHref,
  subpillarPath,
}: ArticleBuyerDecisionModuleProps) {
  const ref = useRef<HTMLElement>(null);
  const impressionTracked = useRef(false);
  const options = getDecisionOptions(category, title);
  const ctaHref = getDefaultCta(category, primaryActionHref, subpillarPath);

  useEffect(() => {
    if (!ref.current || impressionTracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || impressionTracked.current) return;

        impressionTracked.current = true;
        const context = resolveIntentContext();
        trackEvent({
          type: 'buyer_decision_module_impression',
          articleSlug,
          metadata: {
            location: 'article_buyer_decision_module',
            category,
            optionCount: options.length,
            intent: context.intent || 'calculate',
            intentSource: context.intentSource,
          },
        }).catch(() => undefined);
      },
      { threshold: 0.35 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [articleSlug, category, options.length]);

  return (
    <section
      ref={ref}
      id="decision-matrix"
      className="my-8 scroll-mt-28 border border-stone-200 bg-white"
      aria-label="Buyer decision matrix"
    >
      <div className="border-b border-stone-200 bg-neutral-50 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-900">Decision matrix</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-stone-950">
          Pick the lane before you compare vendors
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Most bad tool choices happen when buyers compare features before matching the product type to the job.
        </p>
      </div>

      <div className="grid gap-px bg-stone-200 md:grid-cols-3">
        {options.map((option, index) => (
          <div key={option.label} className="bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Option {index + 1}
              </span>
              <span className="border border-stone-300 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-red-900">
                {option.label}
              </span>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-stone-950">Best for</dt>
                <dd className="mt-1 leading-relaxed text-stone-600">{option.bestFor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-stone-950">Watch for</dt>
                <dd className="mt-1 leading-relaxed text-stone-600">{option.watch}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-200 bg-neutral-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-stone-600">
          Once the lane is clear, the article below is easier to use as a shortlist instead of another research rabbit hole.
        </p>
        <TrackedLink
          href={ctaHref}
          className="inline-flex shrink-0 items-center justify-center border border-red-900 bg-red-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-950"
          eventType="related_module_click"
          articleSlug={articleSlug}
          metadata={{
            location: 'article_buyer_decision_module',
            category,
            cta: 'calculate',
            targetHref: ctaHref,
            targetKind: ctaHref.startsWith('/tools/') ? 'tool' : ctaHref.startsWith('/services/') ? 'service' : 'topic',
          }}
        >
          {getCtaLabel(ctaHref)}
        </TrackedLink>
      </div>
    </section>
  );
}
