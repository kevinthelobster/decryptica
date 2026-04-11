'use client';

import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import { resolveIntentContext } from '../lib/intent-continuity';

interface HubNavSection {
  id: string;
  label: string;
}

interface HubSectionNavProps {
  sections: HubNavSection[];
  surface: 'topic' | 'article';
  category: string;
  slug: string;
  location: string;
  moduleVariant?: string;
}

export default function HubSectionNav({
  sections,
  surface,
  category,
  slug,
  location,
  moduleVariant = 'primary',
}: HubSectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isPinned, setIsPinned] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: '-35% 0px -50% 0px',
        threshold: [0.1, 0.3, 0.6],
      }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    const onScroll = () => {
      setIsPinned(window.scrollY > window.innerHeight * 0.22);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [sections]);

  const context = useMemo(() => resolveIntentContext(), []);

  const onNavClick = (sectionId: string) => {
    trackEvent({
      type: 'hub_nav_click',
      articleSlug: slug,
      metadata: {
        intent: context.intent || 'learn',
        intentSource: context.intentSource,
        surface,
        location,
        moduleVariant,
        slug,
        category,
        targetSection: sectionId,
      },
    }).catch(() => undefined);
  };

  if (!sections.length) {
    return null;
  }

  const mobileOffsetClass = surface === 'article' ? 'bottom-24' : 'bottom-5';

  return (
    <>
      <nav
        className={`hidden md:block rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 py-3 transition-all duration-200 ${isPinned ? 'sticky top-20 z-30 shadow-lg shadow-zinc-950/40' : ''}`}
        aria-label="Section navigation"
      >
        <ul className="flex flex-wrap items-center gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={() => onNavClick(section.id)}
                className={`inline-flex rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                  activeId === section.id
                    ? 'bg-indigo-500/20 text-indigo-200'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`md:hidden fixed ${mobileOffsetClass} left-1/2 z-40 -translate-x-1/2`}>
        <button
          type="button"
          onClick={() => setSheetOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-zinc-950/95 px-4 py-2 text-sm font-medium text-indigo-200 shadow-lg shadow-zinc-950/70"
          aria-expanded={sheetOpen}
          aria-controls="hub-section-sheet"
        >
          Jump to section
        </button>
      </div>

      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setSheetOpen(false)}>
          <div
            id="hub-section-sheet"
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-zinc-700 bg-zinc-950 p-5"
            role="dialog"
            aria-label="Jump to section"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Jump to section</p>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => {
                      onNavClick(section.id);
                      setSheetOpen(false);
                    }}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      activeId === section.id
                        ? 'bg-indigo-500/20 text-indigo-200'
                        : 'bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
