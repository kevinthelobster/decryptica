'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Prompt = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  tools: string[];
  trigger: string;
  is_staff_pick: number;
  vote_count: number;
  has_voted: boolean;
  created_at: number;
};

export default function PromptsPageClient() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<'recent' | 'popular' | 'staff'>('recent');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prompts?sort=${sort}${category ? `&category=${encodeURIComponent(category)}` : ''}`)
      .then(r => r.json())
      .then(d => {
        setPrompts(d.prompts || []);
        setCategories(d.categories || []);
        setLoading(false);
      });
  }, [sort, category]);

  const handleVote = async (promptId: number) => {
    const res = await fetch('/api/prompts/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id: promptId }),
    });
    const data = await res.json();
    setPrompts(prompts.map(p =>
      p.id === promptId
        ? { ...p, has_voted: data.voted, vote_count: data.vote_count }
        : p
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-start gap-5 sm:flex-row sm:justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl text-stone-950 mb-3">
            OpenClaw Prompt Library
          </h1>
          <p className="text-stone-600 text-lg max-w-2xl">
            Copy-pasteable OpenClaw automations. Set them up once, run them forever.
            Browse community submissions or{' '}
            <Link href="/prompts/submit" className="text-red-800 hover:text-red-700">
              submit your own
            </Link>.
          </p>
        </div>
        <Link
          href="/prompts/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-900 hover:bg-red-800 text-white font-semibold transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Prompt
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <span>Sort:</span>
          <button
            onClick={() => setSort('recent')}
            className={`px-3 py-1.5  transition-colors ${sort === 'recent' ? 'bg-red-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`px-3 py-1.5  transition-colors ${sort === 'popular' ? 'bg-red-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setSort('staff')}
            className={`px-3 py-1.5  transition-colors ${sort === 'staff' ? 'bg-red-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
          >
            Staff Picks
          </button>
        </div>

        {/* Category Filter */}
        <div className="hidden md:flex flex-wrap gap-2 text-sm text-stone-600">
          <span className="shrink-0 py-1.5">Category:</span>
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5  transition-colors shrink-0 ${!category ? 'bg-red-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5  transition-colors shrink-0 ${category === cat ? 'bg-red-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Mobile: dropdown */}
        <div className="md:hidden">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-white border border-stone-300  px-4 py-2.5 text-sm text-stone-950 focus:outline-none focus:border-red-900 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompt Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white  p-6 animate-pulse">
              <div className="h-4 bg-stone-100 rounded w-1/3 mb-4" />
              <div className="h-6 bg-stone-100 rounded w-2/3 mb-3" />
              <div className="h-16 bg-stone-100 rounded mb-4" />
              <div className="h-8 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-xl mb-2">No prompts found</p>
          <p className="text-sm">Be the first to{' '}
            <Link href="/prompts/submit" className="text-red-800 hover:text-red-700">
              submit one
            </Link>!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  );
}

function PromptCard({ prompt, onVote }: { prompt: Prompt; onVote: (id: number) => void }) {
  return (
    <div className="bg-white border border-stone-200  p-6 hover:border-stone-300 transition-colors group">
      {/* Category + Staff Pick */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-red-800 bg-red-800/10 px-2.5 py-1 ">
          {prompt.category}
        </span>
        {prompt.is_staff_pick ? (
          <span className="text-xs font-medium text-amber-700 bg-amber-500/10 px-2.5 py-1 ">
            ⭐ Staff Pick
          </span>
        ) : null}
      </div>

      {/* Title */}
      <Link href={`/prompts/${prompt.slug}`} className="block mb-2">
        <h3 className="font-display font-semibold text-lg text-stone-950 group-hover:text-red-800 transition-colors">
          {prompt.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="text-stone-600 text-sm mb-4 line-clamp-2">
        {prompt.description}
      </p>

      {/* Tools */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {prompt.tools.slice(0, 4).map(tool => (
          <span key={tool} className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {tool}
          </span>
        ))}
        {prompt.tools.length > 4 && (
          <span className="text-xs text-stone-500">+{prompt.tools.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <span className="text-xs text-stone-500">{prompt.trigger}</span>
        <button
          onClick={() => onVote(prompt.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5  text-sm font-medium transition-all ${
            prompt.has_voted
              ? 'bg-red-900/20 text-red-800'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-950'
          }`}
        >
          <svg className="w-4 h-4" fill={prompt.has_voted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {prompt.vote_count}
        </button>
      </div>
    </div>
  );
}
