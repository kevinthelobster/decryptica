'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Prompt = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  prompt_text: string;
  tools: string[];
  setup_steps: string[];
  trigger: string;
  alert: string;
  example_output: string;
  is_staff_pick: number;
  vote_count: number;
  has_voted: boolean;
  created_at: number;
};

type Props = { params: Promise<{ slug: string }> };

export default function PromptDetailPage({ params }: Props) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeText, setChangeText] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/prompts/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setPrompt(d); setLoading(false); });
  }, [slug]);

  const handleVote = async () => {
    if (!prompt) return;
    const res = await fetch('/api/prompts/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id: prompt.id }),
    });
    const data = await res.json();
    setPrompt({ ...prompt, has_voted: data.voted, vote_count: data.vote_count });
  };

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const res = await fetch('/api/prompts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_change_idea: true,
          original_prompt_id: prompt.id,
          title: prompt.title,
          proposed_change: changeText,
          description: changeReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitMsg('Change idea submitted! Kevin will review it.');
      setChangeText('');
      setChangeReason('');
      setTimeout(() => { setShowChangeModal(false); setSubmitMsg(''); }, 2500);
    } catch (err: any) {
      setSubmitMsg('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-2/3" />
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-zinc-800/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!prompt) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/prompts" className="hover:text-indigo-400 transition-colors">Prompts</Link>
        <span>/</span>
        <span className="text-indigo-400">{prompt.category}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
              {prompt.category}
            </span>
            {prompt.is_staff_pick ? (
              <span className="text-sm font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                ⭐ Staff Pick
              </span>
            ) : null}
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-4">{prompt.title}</h1>
          <p className="text-zinc-400 text-lg max-w-3xl">{prompt.description}</p>
        </div>

        <button
          onClick={handleVote}
          className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl transition-all ${
            prompt.has_voted
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
          }`}
        >
          <svg className="w-6 h-6" fill={prompt.has_voted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span className="font-semibold">{prompt.vote_count}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* The Prompt */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="font-display font-semibold text-white">The Prompt</h2>
              <button
                onClick={copyPrompt}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
            <div className="p-6">
              <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.prompt_text}
              </pre>
            </div>
          </section>

          {/* Setup Steps */}
          {prompt.setup_steps.length > 0 && (
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="font-display font-semibold text-white">Setup Steps</h2>
              </div>
              <div className="p-6">
                <ol className="space-y-4">
                  {prompt.setup_steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold text-sm flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 font-mono text-sm leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* Example Output */}
          {prompt.example_output && (
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h2 className="font-display font-semibold text-white">Example Output</h2>
              </div>
              <div className="p-6 bg-zinc-950/50">
                <pre className="text-zinc-400 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {prompt.example_output}
                </pre>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Tools Used</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tools.map(tool => (
                  <span key={tool} className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Votes</h3>
              <p className="text-white font-semibold">{prompt.vote_count} upvotes</p>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 space-y-3">
            <p className="text-zinc-300 text-sm">
              Have a better version of this prompt?
            </p>
            <button
              onClick={() => setShowChangeModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Suggest a Change
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-700"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs">or</span>
              <div className="flex-grow border-t border-zinc-700"></div>
            </div>
            <Link
              href="/prompts/submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              Submit New Prompt
            </Link>
          </div>
        </div>
      </div>

      {/* ── Suggest Change Modal ── */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-white">Suggest a Change</h2>
                  <p className="text-zinc-500 text-sm mt-1">{prompt.title}</p>
                </div>
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="text-zinc-500 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitChange} className="p-6 space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm">
                💡 Paste your improved version of the <strong>prompt_text</strong> field below. Kevin will review it as a change idea.
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Your Improved Version <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={changeText}
                  onChange={e => setChangeText(e.target.value)}
                  placeholder="Paste the full prompt_text exactly as it should be after your change..."
                  rows={10}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Why this change? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="Briefly explain why this improves the prompt..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              {submitMsg && (
                <div className={`text-sm ${submitMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {submitMsg}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Change Idea'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
