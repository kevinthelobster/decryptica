'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import TrackedLink from './TrackedLink';
import { resolveIntentContext } from '../lib/intent-continuity';

interface MobileStickyCtaDockProps {
  articleSlug: string;
  category: string;
  endMarkerId: string;
}

export default function MobileStickyCtaDock({ articleSlug, category, endMarkerId }: MobileStickyCtaDockProps) {
  const [context, setContext] = useState(() => resolveIntentContext());
  const storageKey = useMemo(() => `dc_mobile_cta_dismissed_${articleSlug}`, [articleSlug]);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const viewTracked = useRef(false);

  const ctaConfig = useMemo(() => {
    if (context.intent === 'calculate') {
      return {
        href: '/tools/ai-price-calculator',
        label: 'Calculate ROI',
      };
    }

    if (context.intent === 'implement') {
      return {
        href: '/services/ai-automation-consulting',
        label: 'Start Implementation',
      };
    }

    return {
      href: '#subscribe',
      label: 'Get Insights',
    };
  }, [context.intent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(sessionStorage.getItem(storageKey) === '1');
    setContext(resolveIntentContext());
  }, [storageKey]);

  useEffect(() => {
    if (dismissed) {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      const content = document.getElementById('article-content');
      if (!content) return;

      const rect = content.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = Math.max(content.scrollHeight - viewport, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), total);
      const pct = Math.min(100, (traveled / total) * 100);

      const marker = document.getElementById(endMarkerId);
      const nearFooter = marker ? marker.getBoundingClientRect().top <= viewport - 96 : false;

      // Track CTA_view when sticky dock first becomes visible
      if (pct >= 40 && !nearFooter && !viewTracked.current) {
        viewTracked.current = true;
        trackEvent({
          type: 'cta_view',
          articleSlug,
          metadata: {
            location: 'article_mobile_sticky',
            cta: context.intent || 'learn',
            category,
          },
        }).catch(() => undefined);
      }

      setVisible(pct >= 40 && !nearFooter);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [dismissed, endMarkerId]);

  const onDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, '1');
    }
    setDismissed(true);
    setVisible(false);
  };

  if (!visible || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-30 lg:hidden">
      <div className="rounded-2xl border border-indigo-400/40 bg-zinc-950/95 p-3 shadow-xl shadow-indigo-900/30 backdrop-blur">
        <div className="flex items-center gap-2">
          <TrackedLink
            href={ctaConfig.href}
            className="btn-primary h-11 flex-1 justify-center"
            eventType="cta_click"
            articleSlug={articleSlug}
            metadata={{
              location: 'article_mobile_sticky',
              cta: context.intent || 'learn',
              category,
            }}
          >
            {ctaConfig.label}
          </TrackedLink>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-zinc-700 px-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            aria-label="Dismiss mobile subscribe prompt"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
