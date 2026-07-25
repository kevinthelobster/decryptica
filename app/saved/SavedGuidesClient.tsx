'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getRecentGuides,
  getSavedGuides,
  removeSavedGuide,
  type ReadingListEntry,
} from '../lib/reading-list';

function formatSavedDate(value?: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
  } catch {
    return '';
  }
}

function GuideList({
  entries,
  emptyTitle,
  emptyText,
  showRemove,
  onRemove,
}: {
  entries: ReadingListEntry[];
  emptyTitle: string;
  emptyText: string;
  showRemove?: boolean;
  onRemove?: (slug: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="border border-stone-200 bg-neutral-50 p-6">
        <h3 className="font-serif text-2xl font-black text-stone-950">{emptyTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-200 border-y border-stone-200">
      {entries.map((entry) => (
        <article key={entry.slug} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_10rem]">
          <Link href={entry.href} className="group min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-800">
              {entry.category}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900">
              {entry.title}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{entry.excerpt}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.1em] text-stone-500">
              <span>{entry.readTime}</span>
              <span>{entry.date}</span>
              {entry.savedAt ? <span>Saved {formatSavedDate(entry.savedAt)}</span> : null}
              {entry.lastReadAt ? <span>Read {formatSavedDate(entry.lastReadAt)}</span> : null}
            </div>
          </Link>
          <div className="flex items-start gap-2 md:justify-end">
            <Link
              href={entry.href}
              className="border border-stone-950 bg-stone-950 px-3 py-2 text-sm font-bold text-white hover:bg-red-900"
            >
              Open
            </Link>
            {showRemove ? (
              <button
                type="button"
                onClick={() => onRemove?.(entry.slug)}
                className="border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-700 hover:border-red-900 hover:text-red-900"
              >
                Remove
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function SavedGuidesClient() {
  const [saved, setSaved] = useState<ReadingListEntry[]>([]);
  const [recent, setRecent] = useState<ReadingListEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(getSavedGuides());
    setRecent(getRecentGuides());
    setReady(true);
  }, []);

  const recentWithoutSaved = useMemo(() => {
    const savedSlugs = new Set(saved.map((entry) => entry.slug));
    return recent.filter((entry) => !savedSlugs.has(entry.slug)).slice(0, 8);
  }, [recent, saved]);

  function handleRemove(slug: string) {
    setSaved(removeSavedGuide(slug));
  }

  return (
    <div className="bg-white text-stone-950">
      <section className="border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Reader Library</p>
          <div className="mt-3 border-y border-stone-900 py-6">
            <h1 className="font-serif text-4xl font-black leading-tight md:text-7xl">
              Saved guides and recent reading
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Your browser keeps this list private on this device, no account required.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <main>
            <div className="mb-5 flex flex-col gap-2 border-b-2 border-stone-900 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl font-black text-stone-950">Saved Guides</h2>
              <p className="text-sm font-medium text-stone-500">{ready ? `${saved.length} saved` : 'Loading'}</p>
            </div>
            <GuideList
              entries={saved}
              emptyTitle="Nothing saved yet"
              emptyText="Open any article and use Save Guide to build a short research queue."
              showRemove
              onRemove={handleRemove}
            />

            <div className="mb-5 mt-12 flex flex-col gap-2 border-b-2 border-stone-900 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl font-black text-stone-950">Recent Reading</h2>
              <p className="text-sm font-medium text-stone-500">{ready ? `${recentWithoutSaved.length} shown` : 'Loading'}</p>
            </div>
            <GuideList
              entries={recentWithoutSaved}
              emptyTitle="No recent guides yet"
              emptyText="Read a few Decryptica articles and this section will become your continue-reading list."
            />
          </main>

          <aside>
            <div className="sticky top-24 border border-stone-200 bg-neutral-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Next</p>
              <div className="mt-4 grid gap-2">
                <Link href="/search" className="border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 hover:border-red-900">
                  Search the archive
                </Link>
                <Link href="/articles" className="border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 hover:border-red-900">
                  Browse latest reports
                </Link>
                <Link href="/tools" className="border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 hover:border-red-900">
                  Open tools
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
