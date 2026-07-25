'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import {
  isGuideSaved,
  recordRecentGuide,
  removeSavedGuide,
  saveGuide,
  type ReadingListArticle,
} from '../lib/reading-list';

type ArticleSaveControlsProps = {
  article: ReadingListArticle;
  variant?: 'header' | 'sidebar';
};

export default function ArticleSaveControls({ article, variant = 'header' }: ArticleSaveControlsProps) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refreshSavedState = () => {
      setSaved(isGuideSaved(article.slug));
    };

    refreshSavedState();

    if (variant === 'header') {
      recordRecentGuide(article);

      trackEvent({
        type: 'reading_history_recorded',
        articleSlug: article.slug,
        metadata: {
          category: article.category,
          location: `article_${variant}`,
        },
      }).catch(() => undefined);
    }

    setReady(true);
    window.addEventListener('decryptica-reading-list-change', refreshSavedState);

    return () => {
      window.removeEventListener('decryptica-reading-list-change', refreshSavedState);
    };
  }, [article, variant]);

  function toggleSaved() {
    const nextSaved = !saved;

    if (nextSaved) {
      saveGuide(article);
    } else {
      removeSavedGuide(article.slug);
    }

    setSaved(nextSaved);
    window.dispatchEvent(new Event('decryptica-reading-list-change'));

    trackEvent({
      type: nextSaved ? 'guide_saved' : 'guide_unsaved',
      articleSlug: article.slug,
      metadata: {
        category: article.category,
        location: `article_${variant}`,
      },
    }).catch(() => undefined);
  }

  return (
    <div
      className={
        variant === 'sidebar'
          ? 'card-elevated p-5'
          : 'mt-5 flex flex-col gap-3 border border-stone-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between'
      }
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
          Reader Tools
        </p>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          Save this guide or come back to your recent reads.
        </p>
      </div>
      <div className={variant === 'sidebar' ? 'mt-4 grid gap-2' : 'flex flex-wrap gap-2'}>
        <button
          type="button"
          onClick={toggleSaved}
          className={
            saved
              ? 'border border-red-900 bg-red-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-950'
              : 'border border-stone-950 bg-white px-4 py-2 text-sm font-bold text-stone-950 hover:bg-stone-950 hover:text-white'
          }
          aria-pressed={saved}
          disabled={!ready}
        >
          {saved ? 'Saved' : 'Save Guide'}
        </button>
        <Link
          href="/saved"
          className="border border-stone-300 bg-white px-4 py-2 text-center text-sm font-bold text-stone-700 hover:border-red-900 hover:text-red-900"
        >
          My Guides
        </Link>
      </div>
    </div>
  );
}
