'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import { resolveIntentContext, type IntentValue } from '../lib/intent-continuity';
import TrackedLink from './TrackedLink';

interface ArticleMobileActionDockProps {
  articleSlug: string;
  category: string;
}

type DockConfig = {
  cta: IntentValue;
  label: string;
  href: string;
};

const DISMISS_PREFIX = 'dc_article_mobile_dock_dismissed_';

function getDockConfig(intent: IntentValue | null): DockConfig {
  if (intent === 'calculate') {
    return {
      cta: 'calculate',
      label: 'Estimate Cost',
      href: '/tools/ai-price-calculator',
    };
  }

  if (intent === 'implement') {
    return {
      cta: 'implement',
      label: 'Start Plan',
      href: '/services/ai-automation-consulting',
    };
  }

  return {
    cta: 'learn',
    label: 'Get Brief',
    href: '#subscribe',
  };
}

export default function ArticleMobileActionDock({ articleSlug, category }: ArticleMobileActionDockProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [intent, setIntent] = useState<IntentValue | null>(null);
  const impressionTracked = useRef(false);
  const dismissKey = `${DISMISS_PREFIX}${articleSlug}`;

  useEffect(() => {
    setIntent(resolveIntentContext().intent);
    setDismissed(window.sessionStorage.getItem(dismissKey) === '1');

    const onIntentUpdated = () => setIntent(resolveIntentContext().intent);
    window.addEventListener('dc:intent-updated', onIntentUpdated);

    return () => window.removeEventListener('dc:intent-updated', onIntentUpdated);
  }, [dismissKey]);

  useEffect(() => {
    const onScroll = () => {
      const content = document.getElementById('article-content');
      const endMarker = document.getElementById('article-end-marker');
      if (!content || dismissed) {
        setVisible(false);
        return;
      }

      const rect = content.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = Math.max(content.scrollHeight - viewport, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), total);
      const progress = traveled / total;
      const nearEnd = endMarker ? endMarker.getBoundingClientRect().top < viewport + 96 : false;
      const nextVisible = progress >= 0.35 && !nearEnd;

      setVisible(nextVisible);

      if (nextVisible && !impressionTracked.current) {
        impressionTracked.current = true;
        trackEvent({
          type: 'cta_view',
          articleSlug,
          metadata: {
            location: 'article_mobile_sticky',
            category,
          },
        }).catch(() => undefined);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [articleSlug, category, dismissed]);

  const config = useMemo(() => getDockConfig(intent), [intent]);

  if (!visible || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-4 z-40 flex h-11 items-center border border-stone-950 bg-white shadow-lg shadow-stone-200/70 lg:hidden">
      <TrackedLink
        href={config.href}
        className="inline-flex h-full items-center justify-center bg-stone-950 px-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-900"
        eventType="cta_click"
        articleSlug={articleSlug}
        metadata={{
          location: 'article_mobile_sticky',
          cta: config.cta,
          category,
        }}
      >
        {config.label}
      </TrackedLink>
      <button
        type="button"
        className="inline-flex h-full w-10 items-center justify-center border-l border-stone-200 text-sm font-bold text-stone-500 hover:text-red-900"
        aria-label="Dismiss article action"
        onClick={() => {
          window.sessionStorage.setItem(dismissKey, '1');
          setDismissed(true);
          setVisible(false);
          trackEvent({
            type: 'cta_click',
            articleSlug,
            metadata: {
              location: 'article_mobile_sticky',
              cta: 'dismiss',
              category,
            },
          }).catch(() => undefined);
        }}
      >
        x
      </button>
    </div>
  );
}
