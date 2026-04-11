'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '../lib/analytics';
import {
  buildHrefWithIntent,
  type IntentValue,
  isIntentContinuityEnabled,
  resolveIntentContext,
  upsertIntent,
} from '../lib/intent-continuity';

type PageType = 'calculator' | 'consulting';
type SourceSurface = 'home_intent_router' | 'topic_intent_router' | 'article_conversion_strip' | 'direct';
type LayerLocation = 'tool_header' | 'tool_sticky_rail' | 'service_header' | 'service_sticky_rail' | 'exit_rescue';

interface DestinationConfidenceLayerProps {
  pageType: PageType;
}

interface StepAction {
  label: string;
  href: string;
  step: string;
  cta: string;
}

const INTENT_LABEL: Record<IntentValue, string> = {
  learn: 'learn',
  calculate: 'calculate',
  implement: 'implement',
};

function resolveSourceSurface(source: string): SourceSurface {
  if (source === 'home_intent_router' || source === 'topic_intent_router' || source === 'article_conversion_strip') {
    return source;
  }
  return 'direct';
}

function resolveIntentSource(derived: 'url' | 'session' | 'default'): 'url' | 'session' | 'default' {
  if (derived === 'url' || derived === 'session') {
    return derived;
  }
  return 'default';
}

export default function DestinationConfidenceLayer({ pageType }: DestinationConfidenceLayerProps) {
  const router = useRouter();
  const continuityEnabled = isIntentContinuityEnabled();
  const [context, setContext] = useState(() => resolveIntentContext());
  const [showStickyRail, setShowStickyRail] = useState(false);
  const [mobileDockDismissed, setMobileDockDismissed] = useState(false);
  const [showRescue, setShowRescue] = useState(false);

  const stickyTracked = useRef(false);
  const rescueTracked = useRef(false);
  const firstRenderAt = useRef(0);
  const lastScrollAt = useRef(0);
  const lastScrollY = useRef(0);

  const mobileDockDismissKey = `dc_destination_mobile_dismissed_${pageType}`;
  const rescueSeenKey = `dc_destination_rescue_seen_${pageType}`;

  useEffect(() => {
    setContext(resolveIntentContext());

    if (typeof window !== 'undefined') {
      firstRenderAt.current = Date.now();
      lastScrollAt.current = Date.now();
      lastScrollY.current = window.scrollY;
      setMobileDockDismissed(sessionStorage.getItem(mobileDockDismissKey) === '1');
      rescueTracked.current = sessionStorage.getItem(rescueSeenKey) === '1';
    }
  }, [mobileDockDismissKey, rescueSeenKey]);

  const effectiveIntent: IntentValue = useMemo(() => {
    if (context.intent) {
      return context.intent;
    }
    return pageType === 'calculator' ? 'calculate' : 'implement';
  }, [context.intent, pageType]);

  const intentSource = resolveIntentSource(context.intentDerivedFrom);
  const sourceSurface = resolveSourceSurface(context.intentSource);
  const headerLocation: LayerLocation = pageType === 'calculator' ? 'tool_header' : 'service_header';
  const stickyLocation: LayerLocation = pageType === 'calculator' ? 'tool_sticky_rail' : 'service_sticky_rail';

  const ctaConfig = useMemo(() => {
    if (pageType === 'calculator') {
      const steps: StepAction[] = [
        { label: 'Estimate cost', href: '#calculator-inputs', step: 'Estimate cost', cta: 'estimate_cost' },
        { label: 'Compare top 3', href: '#calculator-results', step: 'Compare top 3', cta: 'compare_top_3' },
        {
          label: 'Save recommendation',
          href: '#save-recommendation',
          step: 'Save recommendation',
          cta: 'save_recommendation',
        },
      ];

      return {
        title:
          effectiveIntent === 'calculate'
            ? 'You are in cost-comparison mode'
            : effectiveIntent === 'implement'
            ? 'Price first, then scale implementation'
            : 'Start with a practical cost baseline',
        body:
          effectiveIntent === 'calculate'
            ? 'Run a quick estimate, compare top options, and keep your budget grounded.'
            : effectiveIntent === 'implement'
            ? 'Validate model economics first, then move into rollout planning with less risk.'
            : 'Use a fast estimate to turn research into an action-ready model shortlist.',
        primaryHref: steps[0].href,
        primaryLabel: 'Estimate Cost Now',
        secondaryHref: effectiveIntent === 'learn' ? '/topic/ai/tooling' : '/services/ai-automation-consulting#roi-calculator',
        secondaryLabel: effectiveIntent === 'learn' ? 'Browse AI Guides' : 'Move to ROI Planning',
        stage: steps[0].step,
        stickySteps: steps,
        rescueHref: '#save-recommendation',
        rescueLabel: 'Send This Estimate to Yourself',
      };
    }

    const steps: StepAction[] = [
      { label: 'Estimate ROI', href: '#roi-calculator', step: 'Estimate ROI', cta: 'estimate_roi' },
      { label: 'Review proof', href: '#proof', step: 'Review proof', cta: 'review_proof' },
      {
        label: 'Request plan',
        href: '#quick-intake',
        step: 'Request automation plan',
        cta: 'request_automation_plan',
      },
    ];

    return {
      title:
        effectiveIntent === 'implement'
          ? 'You are in implementation planning mode'
          : effectiveIntent === 'calculate'
          ? 'Validate ROI before committing to rollout'
          : 'Turn research into an implementation plan',
      body:
        effectiveIntent === 'implement'
          ? 'Estimate payback, validate workflow fit, then request an automation plan.'
          : effectiveIntent === 'calculate'
          ? 'Use the ROI calculator to verify expected upside before engaging delivery.'
          : 'Start with ROI math, then move forward only when the business case is clear.',
      primaryHref: steps[0].href,
      primaryLabel: 'Calculate ROI',
      secondaryHref: effectiveIntent === 'calculate' ? '/tools/ai-price-calculator' : '#proof',
      secondaryLabel: effectiveIntent === 'calculate' ? 'Compare Model Costs' : 'Review Proof',
      stage: steps[2].step,
      stickySteps: steps,
      rescueHref: '#quick-intake',
      rescueLabel: 'Get a 1-Page ROI Checklist',
    };
  }, [effectiveIntent, pageType]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const impressionKey = `dc_confidence_impression_${pageType}_${effectiveIntent}`;
    if (sessionStorage.getItem(impressionKey) === '1') {
      return;
    }

    sessionStorage.setItem(impressionKey, '1');
    trackEvent({
      type: 'conversion_confidence_impression',
      metadata: {
        intent: INTENT_LABEL[effectiveIntent],
        intentSource,
        location: headerLocation,
        pageType,
        sourceSurface,
      },
    }).catch(() => undefined);
  }, [effectiveIntent, headerLocation, intentSource, pageType, sourceSurface]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const onScroll = () => {
      const currentY = window.scrollY;
      const now = Date.now();

      setShowStickyRail(currentY > 260);

      const longEnoughOnPage = now - firstRenderAt.current >= 10_000;
      const upwardDelta = lastScrollY.current - currentY;
      const idleFor = now - lastScrollAt.current;
      const shouldTriggerRescue =
        longEnoughOnPage && upwardDelta >= 140 && idleFor >= 1800 && !showRescue && !rescueTracked.current;

      if (shouldTriggerRescue) {
        setShowRescue(true);
        rescueTracked.current = true;
        sessionStorage.setItem(rescueSeenKey, '1');
        trackEvent({
          type: 'exit_rescue_impression',
          metadata: {
            intent: INTENT_LABEL[effectiveIntent],
            intentSource,
            location: 'exit_rescue',
            pageType,
            sourceSurface,
          },
        }).catch(() => undefined);
      }

      lastScrollY.current = currentY;
      lastScrollAt.current = now;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [effectiveIntent, intentSource, pageType, rescueSeenKey, showRescue, sourceSurface]);

  useEffect(() => {
    if (!showStickyRail || stickyTracked.current) {
      return;
    }

    stickyTracked.current = true;
    trackEvent({
      type: 'conversion_confidence_impression',
      metadata: {
        intent: INTENT_LABEL[effectiveIntent],
        intentSource,
        location: stickyLocation,
        pageType,
        sourceSurface,
      },
    }).catch(() => undefined);
  }, [effectiveIntent, intentSource, pageType, showStickyRail, sourceSurface, stickyLocation]);

  const navigateWithTracking = (
    href: string,
    ctaName: string,
    location: LayerLocation,
    stepName?: string,
    eventType: 'conversion_confidence_cta_click' | 'exit_rescue_click' = 'conversion_confidence_cta_click'
  ) => {
    if (continuityEnabled) {
      upsertIntent(effectiveIntent, location, pageType);
    }

    const resolvedHref = continuityEnabled ? buildHrefWithIntent(href, effectiveIntent) : href;

    trackEvent({
      type: eventType,
      metadata: {
        intent: INTENT_LABEL[effectiveIntent],
        intentSource,
        location,
        pageType,
        sourceSurface,
        cta: ctaName,
        targetHref: resolvedHref,
      },
    }).catch(() => undefined);

    if (stepName) {
      trackEvent({
        type: 'destination_step_progress',
        metadata: {
          intent: INTENT_LABEL[effectiveIntent],
          intentSource,
          location,
          pageType,
          sourceSurface,
          step: stepName,
        },
      }).catch(() => undefined);
    }

    if (resolvedHref.startsWith('#')) {
      const id = resolvedHref.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = id;
      }
      return;
    }

    router.push(resolvedHref);
  };

  return (
    <>
      <section className="mx-auto mb-8 max-w-7xl px-4 md:px-8" aria-label="Conversion confidence layer">
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/12 via-zinc-900/70 to-emerald-500/12 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Conversion Confidence Layer</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">{ctaConfig.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-300 md:text-base">{ctaConfig.body}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigateWithTracking(ctaConfig.primaryHref, 'primary_confidence_action', headerLocation, ctaConfig.stage)}
              className="btn-primary"
            >
              {ctaConfig.primaryLabel}
            </button>
            <button
              type="button"
              onClick={() => navigateWithTracking(ctaConfig.secondaryHref, 'secondary_confidence_action', headerLocation)}
              className="btn-secondary"
            >
              {ctaConfig.secondaryLabel}
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-zinc-700/70 bg-zinc-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Updated</p>
              <p className="mt-1 text-sm text-zinc-200">Pricing and ROI assumptions refreshed April 2026.</p>
            </article>
            <article className="rounded-xl border border-zinc-700/70 bg-zinc-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Outcome Proof</p>
              <p className="mt-1 text-sm text-zinc-200">Recent teams reported 24% to 42% measurable workflow lift.</p>
            </article>
            <article className="rounded-xl border border-zinc-700/70 bg-zinc-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Risk Control</p>
              <p className="mt-1 text-sm text-zinc-200">No lock-in required. Start with estimates before any commitment.</p>
            </article>
          </div>

          {showRescue && (
            <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Before you leave</p>
              <p className="mt-1 text-sm text-zinc-200">Keep your progress with one low-friction next step.</p>
              <button
                type="button"
                className="btn-secondary mt-3"
                onClick={() => navigateWithTracking(ctaConfig.rescueHref, 'exit_rescue', 'exit_rescue', undefined, 'exit_rescue_click')}
              >
                {ctaConfig.rescueLabel}
              </button>
            </div>
          )}
        </div>
      </section>

      {showStickyRail && (
        <aside className="fixed bottom-6 right-6 z-30 hidden w-80 rounded-2xl border border-indigo-400/30 bg-zinc-950/95 p-4 shadow-xl shadow-indigo-900/30 backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Next best action</p>
          <div className="mt-3 space-y-2">
            {ctaConfig.stickySteps.map((step) => (
              <button
                key={step.label}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-left text-sm text-zinc-200 transition hover:border-indigo-400/60"
                onClick={() => navigateWithTracking(step.href, step.cta, stickyLocation, step.step)}
              >
                <span>{step.label}</span>
                <span className="text-zinc-500">Go</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {showStickyRail && !mobileDockDismissed && (
        <div className="fixed inset-x-4 bottom-4 z-30 lg:hidden">
          <div className="rounded-2xl border border-indigo-400/40 bg-zinc-950/95 p-3 shadow-xl shadow-indigo-900/30 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  navigateWithTracking(
                    ctaConfig.stickySteps[0].href,
                    ctaConfig.stickySteps[0].cta,
                    stickyLocation,
                    ctaConfig.stickySteps[0].step
                  )
                }
                className="btn-primary h-11 flex-1 justify-center"
              >
                {ctaConfig.stickySteps[0].label}
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem(mobileDockDismissKey, '1');
                  setMobileDockDismissed(true);
                }}
                className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-700 px-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                aria-label="Dismiss destination action dock"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescue && (
        <aside className="fixed bottom-6 left-6 z-30 hidden w-80 rounded-2xl border border-emerald-400/30 bg-zinc-950/95 p-4 shadow-xl shadow-emerald-900/25 backdrop-blur lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Before you exit</p>
          <p className="mt-2 text-sm text-zinc-200">Keep this session useful with one low-commitment follow-up.</p>
          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={() => navigateWithTracking(ctaConfig.rescueHref, 'exit_rescue', 'exit_rescue', undefined, 'exit_rescue_click')}
          >
            {ctaConfig.rescueLabel}
          </button>
        </aside>
      )}
    </>
  );
}
