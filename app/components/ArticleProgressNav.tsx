'use client';

import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import TrackedLink from './TrackedLink';

interface HeadingItem {
  id: string;
  label: string;
}

interface ArticleProgressNavProps {
  articleSlug: string;
  category: string;
  headings: HeadingItem[];
}

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

export default function ArticleProgressNav({ articleSlug, category, headings }: ArticleProgressNavProps) {
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState<string | null>(headings[0]?.id ?? null);
  const sentMilestones = useMemo(() => new Set<number>(), []);

  useEffect(() => {
    if (!headings.length) return;

    const onScroll = () => {
      const content = document.getElementById('article-content');
      if (!content) return;

      const rect = content.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = Math.max(content.scrollHeight - viewport, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), total);
      const pct = Math.min(100, Math.round((traveled / total) * 100));
      setProgress(pct);

      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !sentMilestones.has(milestone)) {
          sentMilestones.add(milestone);
          trackEvent({
            type: 'scroll_depth',
            articleSlug,
            metadata: {
              milestone,
            },
          }).catch((err) => {
            console.error('[ArticleProgressNav] scroll event failed:', err);
          });
        }
      }

      let current = headings[0].id;
      for (const item of headings) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= 140) {
          current = item.id;
        }
      }
      setActiveHeading(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [articleSlug, headings, sentMilestones]);

  return (
    <div className="card-elevated p-5">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-stone-500">
        Reading Progress
      </h3>
      <div className="mb-2 h-2 w-full overflow-hidden bg-stone-200">
        <div
          className="h-full bg-red-900 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mb-4 text-xs text-stone-500">{progress}% complete</p>

      <h4 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
        Jump to Section
      </h4>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {headings.map((item) => (
          <TrackedLink
            key={item.id}
            href={`#${item.id}`}
            eventType="toc_jump"
            articleSlug={articleSlug}
            metadata={{
              location: 'article_progress_nav',
              category,
              section: item.id,
            }}
            className={`block text-sm transition-colors ${
              activeHeading === item.id ? 'font-semibold text-red-900' : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            {item.label}
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
