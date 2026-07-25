'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

export type SearchResult = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  type: 'Article' | 'Prompt' | 'Tool';
  category: string;
  date?: string;
  readTime?: string;
  keywords: string;
};

const filters = ['All', 'Article', 'Prompt', 'Tool'] as const;
type SearchFilter = (typeof filters)[number];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function scoreResult(result: SearchResult, terms: string[]) {
  const title = normalize(result.title);
  const category = normalize(result.category);
  const body = normalize(`${result.excerpt} ${result.keywords}`);

  return terms.reduce((score, term) => {
    if (title === term) return score + 20;
    if (title.startsWith(term)) return score + 14;
    if (title.includes(term)) return score + 10;
    if (category.includes(term)) return score + 6;
    if (body.includes(term)) return score + 3;
    return score;
  }, 0);
}

export default function SearchClient({
  results,
  initialQuery,
}: {
  results: SearchResult[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>('All');

  const matches = useMemo(() => {
    const terms = normalize(submittedQuery).split(' ').filter(Boolean);
    const filteredByType =
      filter === 'All' ? results : results.filter((result) => result.type === filter);

    if (terms.length === 0) {
      return filteredByType.slice(0, 24);
    }

    return filteredByType
      .map((result) => ({ result, score: scoreResult(result, terms) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
      .map((item) => item.result)
      .slice(0, 48);
  }, [filter, results, submittedQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    setSubmittedQuery(nextQuery);

    const nextUrl = nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search';
    window.history.replaceState(null, '', nextUrl);
  }

  return (
    <div className="bg-white text-stone-950">
      <section className="border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Search</p>
          <div className="mt-3 border-y border-stone-900 py-6">
            <h1 className="font-serif text-4xl font-black leading-tight md:text-7xl">
              Find the right report, prompt, or tool
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Search Decryptica&apos;s archive, prompt library, and decision tools from one place.
            </p>

            <form onSubmit={submitSearch} className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem]">
              <label className="sr-only" htmlFor="site-search">
                Search Decryptica
              </label>
              <input
                id="site-search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try Solana RPC, AI pricing, newsletter prompts..."
                className="min-h-12 w-full border border-stone-300 bg-white px-4 text-base text-stone-950 placeholder:text-stone-400 focus:border-red-900 focus:outline-none"
                autoComplete="off"
              />
              <button
                type="submit"
                className="min-h-12 border border-stone-950 bg-stone-950 px-5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-red-900"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside>
            <div className="sticky top-24 border border-stone-200 bg-neutral-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Filter</p>
              <div className="mt-4 grid gap-2">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`flex items-center justify-between border px-3 py-2 text-left text-sm font-bold ${
                      filter === item
                        ? 'border-red-900 bg-red-900 text-white'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-red-800'
                    }`}
                  >
                    <span>{item}</span>
                    <span>
                      {item === 'All'
                        ? results.length
                        : results.filter((result) => result.type === item).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-2 border-b-2 border-stone-900 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl font-black text-stone-950">
                {submittedQuery ? `Results for "${submittedQuery}"` : 'Start with these'}
              </h2>
              <p className="text-sm font-medium text-stone-500">{matches.length} shown</p>
            </div>

            {matches.length === 0 ? (
              <div className="border border-stone-200 bg-neutral-50 p-8">
                <h3 className="font-serif text-2xl font-black text-stone-950">No matches yet</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
                  Try a broader topic like AI, Solana, agents, pricing, automation, or prompts.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {matches.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="group grid gap-3 py-5 md:grid-cols-[8rem_minmax(0,1fr)_8rem]"
                  >
                    <div>
                      <span className="inline-flex border border-stone-200 bg-white px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-red-800">
                        {result.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                        {result.category}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                        {result.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                        {result.excerpt}
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm text-stone-500 md:block md:text-right">
                      {result.date ? <span>{result.date}</span> : null}
                      {result.readTime ? <span className="md:mt-2 md:block">{result.readTime}</span> : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
