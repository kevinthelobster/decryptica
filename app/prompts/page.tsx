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

export default function PromptsPage() {
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
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display font-bold text-4xl text-white mb-3">
            OpenClaw Prompt Library
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Copy-pasteable OpenClaw automations. Set them up once, run them forever.
            Browse community submissions or{' '}
            <Link href="/prompts/submit" className="text-indigo-400 hover:text-indigo-300">
              submit your own
            </Link>.
          </p>
        </div>
        <Link
          href="/prompts/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Prompt
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Sort:</span>
          <button
            onClick={() => setSort('recent')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${sort === 'recent' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${sort === 'popular' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setSort('staff')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${sort === 'staff' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            Staff Picks
          </button>
        </div>

        <div className="flex gap-2 text-sm text-zinc-400 overflow-x-auto px-6 -mx-6 md:overflow-visible md:px-0 md:mx-0 md:flex-nowrap flex-nowrap">
          <span className="shrink-0">Category:</span>
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${!category ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${category === cat ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
              <div className="h-6 bg-zinc-800 rounded w-2/3 mb-3" />
              <div className="h-16 bg-zinc-800/50 rounded mb-4" />
              <div className="h-8 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-xl mb-2">No prompts found</p>
          <p className="text-sm">Be the first to{' '}
            <Link href="/prompts/submit" className="text-indigo-400 hover:text-indigo-300">
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group">
      {/* Category + Staff Pick */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
          {prompt.category}
        </span>
        {prompt.is_staff_pick ? (
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            ⭐ Staff Pick
          </span>
        ) : null}
      </div>

      {/* Title */}
      <Link href={`/prompts/${prompt.slug}`} className="block mb-2">
        <h3 className="font-display font-semibold text-lg text-white group-hover:text-indigo-400 transition-colors">
          {prompt.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
        {prompt.description}
      </p>

      {/* Tools */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {prompt.tools.slice(0, 4).map(tool => (
          <span key={tool} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
            {tool}
          </span>
        ))}
        {prompt.tools.length > 4 && (
          <span className="text-xs text-zinc-500">+{prompt.tools.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">{prompt.trigger}</span>
        <button
          onClick={() => onVote(prompt.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            prompt.has_voted
              ? 'bg-indigo-600/20 text-indigo-400'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
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
