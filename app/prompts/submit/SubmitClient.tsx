'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  'Memory Management',
  'Monitoring & Health Checks',
  'Communication & Automation',
  'Coding & Automation',
  'Research & Feeds',
  'Other',
];

const TOOLS = [
  'exec', 'cron', 'filesystem', 'message', 'sessions_list', 'sessions_history',
  'sessions_send', 'subagents', 'memory_search', 'memory_get', 'web_search',
  'web_fetch', 'browser', 'gh', 'mcporter', 'openclaw CLI', 'apple-reminders',
  'apple-notes', 'discord', 'slack', 'other'
];

type PromptSummary = { id: number; slug: string; title: string; category: string };

export default function SubmitPageClient() {
  const [mode, setMode] = useState<'new' | 'change'>('new');
  const [prompts, setPrompts] = useState<PromptSummary[]>([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    prompt_text: '',
    tools: [] as string[],
    setup_steps: '',
    trigger: '',
    alert: '',
  });
  const [changeIdea, setChangeIdea] = useState({
    original_prompt_id: '',
    proposed_change: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedChange, setSubmittedChange] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/prompts/list')
      .then(r => r.json())
      .then(d => setPrompts(d.prompts || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/prompts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tools: form.tools,
          setup_steps: form.setup_steps.split('\n').map(s => s.trim()).filter(Boolean),
          is_change_idea: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!changeIdea.original_prompt_id) {
      setError('Please select a prompt to improve.');
      setSubmitting(false);
      return;
    }
    if (!changeIdea.proposed_change.trim()) {
      setError('Please describe your proposed change.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/prompts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_change_idea: true,
          original_prompt_id: parseInt(changeIdea.original_prompt_id),
          proposed_change: changeIdea.proposed_change,
          description: changeIdea.description,
          title: prompts.find(p => p.id === parseInt(changeIdea.original_prompt_id))?.title || 'Unknown',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmittedChange(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTool = (tool: string) => {
    setForm(f => ({
      ...f,
      tools: f.tools.includes(tool)
        ? f.tools.filter(t => t !== tool)
        : [...f.tools, tool]
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-4">Submitted!</h1>
        <p className="text-zinc-400 text-lg mb-8">
          Your prompt is in the queue. Kevin will review it shortly.
        </p>
        <Link href="/prompts" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
          Browse All Prompts
        </Link>
      </div>
    );
  }

  if (submittedChange) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-4">Change Idea Submitted!</h1>
        <p className="text-zinc-400 text-lg mb-8">
          Kevin will review your proposed change and decide whether to implement it.
        </p>
        <Link href="/prompts" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
          Browse All Prompts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/prompts" className="hover:text-indigo-400 transition-colors">Prompts</Link>
        <span>/</span>
        <span className="text-white">Submit</span>
      </nav>

      <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-white mb-3">Submit</h1>
        <p className="text-zinc-400">
          Share your OpenClaw automation or suggest an improvement to an existing prompt.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode('new')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'new' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          + New Prompt
        </button>
        <button
          onClick={() => setMode('change')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'change' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          💡 Suggest Change
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {/* ── New Prompt Form ── */}
      {mode === 'new' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Prompt Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Nightly Memory Consolidation"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Short Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What does this automation do? (2-3 sentences)"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          {/* Prompt Text */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              The Prompt Text <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.prompt_text}
              onChange={e => setForm(f => ({ ...f, prompt_text: e.target.value }))}
              placeholder="Paste the exact prompt text someone can copy and use..."
              rows={10}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
              required
            />
          </div>

          {/* Tools */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">Tools Used</label>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map(tool => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.tools.includes(tool) ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Setup Steps */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Setup Steps</label>
            <p className="text-xs text-zinc-500 mb-3">One step per line.</p>
            <textarea
              value={form.setup_steps}
              onChange={e => setForm(f => ({ ...f, setup_steps: e.target.value }))}
              placeholder={"Create ~/scripts/ directory\nMake script executable: chmod +x ~/scripts/backup.sh\nAdd to crontab: '0 2 * * * ~/scripts/backup.sh'"}
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Trigger</label>
            <input
              type="text"
              value={form.trigger}
              onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
              placeholder="e.g., Every night at 2:00 AM (0 2 * * *)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
            />
          </div>

          {/* Alert */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Alert Method</label>
            <input
              type="text"
              value={form.alert}
              onChange={e => setForm(f => ({ ...f, alert: e.target.value }))}
              placeholder="e.g., Telegram message on completion or failure"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Prompt'}
          </button>
        </form>
      )}

      {/* ── Change Idea Form ── */}
      {mode === 'change' && (
        <form onSubmit={handleChangeIdeaSubmit} className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm">
            💡 Suggesting a change is different from submitting a new prompt. Your proposed change goes to Kevin for review — if approved, it updates the existing prompt directly.
          </div>

          {/* Which prompt */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Which prompt? <span className="text-red-400">*</span>
            </label>
            <select
              value={changeIdea.original_prompt_id}
              onChange={e => setChangeIdea(c => ({ ...c, original_prompt_id: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Select a prompt to improve...</option>
              {prompts.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.category})</option>
              ))}
            </select>
          </div>

          {/* What to change */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              What should change? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={changeIdea.proposed_change}
              onChange={e => setChangeIdea(c => ({ ...c, proposed_change: e.target.value }))}
              placeholder="Paste the full new version of the prompt_text field as it should be. Kevin will review the diff and decide whether to apply it."
              rows={12}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
              required
            />
          </div>

          {/* Why */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Why this change? <span className="text-red-400">*</span>
            </label>
            <textarea
              value={changeIdea.description}
              onChange={e => setChangeIdea(c => ({ ...c, description: e.target.value }))}
              placeholder="Briefly explain why this change improves the prompt (fixes an issue, adds useful behavior, clarifies wording, etc.)"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Change Idea'}
          </button>
        </form>
      )}
    </div>
  );
}
