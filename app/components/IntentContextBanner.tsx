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
    <section className="mb-8 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4" aria-label="Intent context">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Intent Continuity</p>
          <p className="mt-1 text-sm text-zinc-200">
            You&apos;re in <span className="font-semibold text-white">{INTENT_LABELS[context.intent]}</span> mode. Keep momentum or switch your goal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TrackedLink
            href={primaryHref}
            className="inline-flex h-9 items-center rounded-lg border border-indigo-300/40 bg-indigo-400/15 px-3 text-sm font-medium text-indigo-100 hover:bg-indigo-400/25"
            eventType="cta_click"
            articleSlug={articleSlug}
            metadata={{ location: `${pageType}_intent_banner`, cta: currentIntent, category }}
          >
            Continue with {INTENT_LABELS[currentIntent]}
          </TrackedLink>

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-9 items-center rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
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
            className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition ${
              intentOption === context.intent
                ? 'border-indigo-300 bg-indigo-300/20 text-indigo-100'
                : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
            }`}
          >
            {INTENT_LABELS[intentOption]}
          </button>
        ))}
      </div>
    </section>
  );
}
