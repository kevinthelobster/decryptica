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
        className="fixed bottom-24 left-4 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/95 px-4 text-xs font-semibold uppercase tracking-wider text-zinc-300 shadow-lg shadow-black/30 backdrop-blur lg:hidden"
      >
        Sections
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-cyan-300">{progress}%</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[68vh] overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Jump to section</p>
            <div className="mt-4 space-y-3">
              {headings.map((heading) => (
                <TrackedLink
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="block rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-200 hover:border-cyan-400/40 hover:text-cyan-200"
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
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
