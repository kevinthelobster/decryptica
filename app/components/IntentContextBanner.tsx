'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TrackedLink from './TrackedLink';
import { trackEvent } from '../lib/analytics';
import {
  IntentValue,
  isIntentContinuityEnabled,
  resolveIntentContext,
  upsertIntent,
} from '../lib/intent-continuity';

interface IntentContextBannerProps {
  pageType: 'topic' | 'article';
  category: string;
  articleSlug?: string;
}

const INTENT_LABELS: Record<IntentValue, string> = {
  learn: 'Learn',
  calculate: 'Calculate',
  implement: 'Implement',
};

export default function IntentContextBanner({ pageType, category, articleSlug }: IntentContextBannerProps) {
  const continuityEnabled = isIntentContinuityEnabled();
  const pathname = usePathname();
  const router = useRouter();

  const [context, setContext] = useState(() => resolveIntentContext());
  const [dismissedIntent, setDismissedIntent] = useState<string | null>(null);

  useEffect(() => {
    setContext(resolveIntentContext());
  }, []);

  if (!continuityEnabled || !context.intent || dismissedIntent === context.intent) {
    return null;
  }
  const currentIntent = context.intent;

  const onDismiss = () => {
    setDismissedIntent(currentIntent);
    trackEvent({
      type: 'intent_banner_dismiss',
      articleSlug,
      metadata: {
        intent: currentIntent,
        intentSource: context.intentSource,
        intentDerivedFrom: context.intentDerivedFrom,
        previousIntent: currentIntent,
        location: `${pageType}_intent_banner`,
        category,
      },
    }).catch(() => undefined);
  };

  const onSwitchIntent = (nextIntent: IntentValue) => {
    if (nextIntent === currentIntent) {
      return;
    }

    const previousIntent = currentIntent;
    upsertIntent(nextIntent, `${pageType}_intent_banner`, category);

    const nextParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    nextParams.set('intent', nextIntent);
    const nextUrl = `${pathname}?${nextParams.toString()}`;
    router.replace(nextUrl, { scroll: false });
    setContext({
      intent: nextIntent,
      intentSource: `${pageType}_intent_banner`,
      intentDerivedFrom: 'url',
    });
    setDismissedIntent(null);

    trackEvent({
      type: 'intent_switch',
      articleSlug,
      metadata: {
        previousIntent,
        intent: nextIntent,
        intentSource: `${pageType}_intent_banner`,
        intentDerivedFrom: 'url',
        location: `${pageType}_intent_banner`,
        category,
      },
    }).catch(() => undefined);
  };

  const primaryHref =
    currentIntent === 'calculate'
      ? '/tools/ai-price-calculator'
      : currentIntent === 'implement'
      ? '/services/ai-automation-consulting'
      : pageType === 'topic'
      ? '#latest-articles'
      : '#subscribe';

  return (
    <section className="mb-8 border border-stone-200 bg-neutral-50 p-4" aria-label="Intent context">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-900">Intent Continuity</p>
          <p className="mt-1 text-sm text-stone-700">
            You&apos;re in <span className="font-semibold text-stone-950">{INTENT_LABELS[context.intent]}</span> mode. Keep momentum or switch your goal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TrackedLink
            href={primaryHref}
            className="inline-flex h-9 items-center border border-stone-950 bg-stone-950 px-3 text-sm font-bold text-white hover:bg-red-900"
            eventType="cta_click"
            articleSlug={articleSlug}
            metadata={{ location: `${pageType}_intent_banner`, cta: currentIntent, category }}
          >
            Continue with {INTENT_LABELS[currentIntent]}
          </TrackedLink>

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-9 items-center border border-stone-300 px-3 text-sm text-stone-600 hover:border-stone-950 hover:text-stone-950"
          >
            Dismiss
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(['learn', 'calculate', 'implement'] as IntentValue[]).map((intentOption) => (
          <button
            key={intentOption}
            type="button"
            onClick={() => onSwitchIntent(intentOption)}
            className={`inline-flex h-8 items-center border px-3 text-xs font-medium transition ${
              intentOption === context.intent
                ? 'border-red-900 bg-red-50 text-red-900'
                : 'border-stone-300 text-stone-600 hover:border-stone-950 hover:text-stone-950'
            }`}
          >
            {INTENT_LABELS[intentOption]}
          </button>
        ))}
      </div>
    </section>
  );
}
