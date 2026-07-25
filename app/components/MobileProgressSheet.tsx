'use client';

import { useEffect, useState } from 'react';
import TrackedLink from './TrackedLink';

interface HeadingItem {
  id: string;
  label: string;
}

interface MobileProgressSheetProps {
  articleSlug: string;
  category: string;
  headings: HeadingItem[];
}

export default function MobileProgressSheet({ articleSlug, category, headings }: MobileProgressSheetProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const content = document.getElementById('article-content');
      if (!content) return;

      const rect = content.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = Math.max(content.scrollHeight - viewport, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(Math.min(100, Math.round((traveled / total) * 100)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!headings.length) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-4 z-40 inline-flex h-11 items-center gap-2 border border-stone-300 bg-white px-3 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-lg shadow-stone-200/70 backdrop-blur lg:hidden"
      >
        Sections
        <span className="bg-red-900 px-2 py-1 text-[10px] text-white">{progress}%</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[68vh] overflow-y-auto border-t border-stone-300 bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 bg-stone-300" />
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Jump to section</p>
            <div className="mt-4 space-y-3">
              {headings.map((heading) => (
                <TrackedLink
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="block border border-stone-200 bg-neutral-50 px-4 py-3 text-sm text-stone-700 hover:border-red-900/30 hover:text-red-900"
                  eventType="toc_jump"
                  articleSlug={articleSlug}
                  metadata={{
                    location: 'article_progress_nav',
                    category,
                    section: heading.id,
                  }}
                >
                  {heading.label}
                </TrackedLink>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex w-full items-center justify-center border border-stone-300 px-4 py-2.5 text-sm text-stone-700 hover:border-red-900/40 hover:text-red-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
