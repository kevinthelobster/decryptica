'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Prompt = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  prompt_text: string;
  tools: string[];
  setup_steps: string[];
  is_staff_pick: boolean;
  vote_count: number;
  created_at: number;
  updated_at: number;
};

type Submission = {
  id: number;
  title?: string;
  category?: string;
  description?: string;
  prompt_text?: string;
  tools?: string[];
  setup_steps?: string[];
  trigger?: string;
  alert?: string;
  submitted_at: number;
  is_change_idea?: boolean;
  original_prompt_id?: number;
  proposed_change?: string;
  original_prompt?: Prompt;
};

export default function AdminPageClient() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Data
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // UI state
  const [tab, setTab] = useState<'submissions' | 'edit'>('submissions');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editForm, setEditForm] = useState<Partial<Prompt>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch('/api/prompts/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuthenticated(true);
      loadData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const res = await fetch('/api/prompts/admin');
    const data = await res.json();
    if (data.error) { setAuthenticated(false); return; }
    setSubmissions(data.submissions || []);
    setPrompts(data.prompts || []);
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/prompts/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmissions(s => s.filter(sub => sub.id !== id));
      if (data.slug) loadData(); // refresh prompts list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this submission?')) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/prompts/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmissions(s => s.filter(sub => sub.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditForm({ ...prompt });
    setSaveMsg('');
  };

  const closeEdit = () => {
    setEditingPrompt(null);
    setEditForm({});
    setSaveMsg('');
  };

  const saveEdit = async () => {
    if (!editingPrompt) return;
    setSaveLoading(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/prompts/admin/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPrompt.id, updates: editForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrompts(ps => ps.map(p => p.id === editingPrompt!.id ? data.prompt : p));
      setEditingPrompt(data.prompt);
      setSaveMsg('Saved!');
    } catch (err: any) {
      setSaveMsg('Error: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleStaffPick = async (id: number) => {
    try {
      const res = await fetch('/api/prompts/admin/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle_staff_pick' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrompts(ps => ps.map(p => p.id === id ? data.prompt : p));
      if (editingPrompt?.id === id) setEditingPrompt(data.prompt);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Group submissions
  const newSubmissions = submissions.filter(s => !s.is_change_idea);
  const changeIdeas = submissions.filter(s => s.is_change_idea);

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <div className="mb-8 border-b-2 border-stone-900 pb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-red-800">Prompt Library</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-stone-950">Admin Access</h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Enter the admin password to review submissions and manage published prompts.
          </p>
        </div>
        <form onSubmit={handleLogin} className="border border-stone-200 bg-white p-5">
          {loginError && (
            <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              {loginError}
            </div>
          )}
          <label className="mb-2 block text-sm font-semibold text-stone-700" htmlFor="admin-password">Password</label>
          <div className="space-y-4">
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              className="w-full border border-stone-300 bg-white px-4 py-3 text-stone-950 placeholder-stone-400 outline-none transition-colors focus:border-red-900 focus:ring-1 focus:ring-red-900"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-900 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-800 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          <Link href="/prompts" className="font-medium hover:text-red-900">Back to prompts</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-12">
      <div className="mb-8 border-b-2 border-stone-900 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-red-800">Prompt Library</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-stone-950">Prompt Admin</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {submissions.length === 0 ? 'All caught up. No pending submissions.' : `${submissions.length} pending review: ${newSubmissions.length} new prompts and ${changeIdeas.length} change ideas.`}
            </p>
          </div>
          <Link href="/prompts" className="inline-flex w-fit items-center border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-red-900 hover:text-red-900">
            Live Prompt Library
          </Link>
        </div>
      </div>

      <div className="mb-8 flex w-full flex-col gap-2 border border-stone-200 bg-white p-1 sm:w-fit sm:flex-row">
        <button
          onClick={() => setTab('submissions')}
          className={`px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors ${tab === 'submissions' ? 'bg-red-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
        >
          Submissions
          {submissions.length > 0 && <span className="ml-2 text-xs opacity-80">{submissions.length}</span>}
        </button>
        <button
          onClick={() => setTab('edit')}
          className={`px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors ${tab === 'edit' ? 'bg-red-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`}
        >
          Edit Prompts
          <span className="ml-2 text-xs opacity-80">{prompts.length}</span>
        </button>
      </div>

      {tab === 'submissions' && (
        <>
          {submissions.length === 0 ? (
            <div className="border border-stone-200 bg-stone-50 py-16 text-center">
              <p className="font-display text-2xl font-bold text-stone-950">All caught up</p>
              <p className="mt-2 text-sm text-stone-600">No pending submissions or change ideas.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {newSubmissions.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <h2 className="font-display text-2xl font-bold text-stone-950">New Prompts</h2>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{newSubmissions.length} pending</span>
                  </div>
                  <div className="space-y-4">
                    {newSubmissions.map(sub => (
                      <SubmissionCard
                        key={sub.id}
                        submission={sub}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                </section>
              )}

              {changeIdeas.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
                    <h2 className="font-display text-2xl font-bold text-stone-950">Change Ideas</h2>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{changeIdeas.length} pending</span>
                  </div>
                  <div className="space-y-4">
                    {changeIdeas.map(sub => (
                      <ChangeIdeaCard
                        key={sub.id}
                        submission={sub}
                        prompts={prompts}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'edit' && (
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
            <h2 className="font-display text-2xl font-bold text-stone-950">Published Prompts</h2>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{prompts.length} total</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {prompts.map(prompt => (
              <div key={prompt.id} className="border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="bg-red-800/10 px-2.5 py-1 text-xs font-semibold text-red-800">
                        {prompt.category}
                      </span>
                      {prompt.is_staff_pick && (
                        <span className="bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Staff Pick
                        </span>
                      )}
                    </div>
                    <h3 className="truncate font-display text-lg font-bold text-stone-950">{prompt.title}</h3>
                  </div>
                  <button
                    onClick={() => toggleStaffPick(prompt.id)}
                    className={`shrink-0 border px-3 py-1.5 text-xs font-semibold transition-colors ${prompt.is_staff_pick ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-stone-300 text-stone-600 hover:border-amber-600 hover:text-amber-700'}`}
                    title="Toggle Staff Pick"
                  >
                    {prompt.is_staff_pick ? 'Picked' : 'Pick'}
                  </button>
                </div>
                <p className="mb-4 line-clamp-2 text-sm leading-6 text-stone-600">{prompt.description}</p>
                <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                  <span className="text-xs font-medium text-stone-500">{prompt.vote_count} votes</span>
                  <button
                    onClick={() => openEdit(prompt)}
                    className="text-sm font-bold text-red-800 hover:text-red-950"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingPrompt && (
        <EditModal
          prompt={editingPrompt}
          form={editForm}
          setForm={setEditForm}
          saveLoading={saveLoading}
          saveMsg={saveMsg}
          onSave={saveEdit}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SubmissionCard({ submission, onApprove, onReject, actionLoading }: {
  submission: Submission;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actionLoading: number | null;
}) {
  return (
    <div className="overflow-hidden border border-stone-200 bg-white">
      <div className="p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="mb-2 inline-block bg-red-800/10 px-2.5 py-1 text-xs font-semibold text-red-800">
              {submission.category}
            </span>
            <h3 className="font-display text-2xl font-bold leading-tight text-stone-950">{submission.title}</h3>
            <p className="mt-1 text-xs font-medium text-stone-500">
              {new Date(submission.submitted_at * 1000).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => onApprove(submission.id)}
              disabled={actionLoading === submission.id}
              className="bg-green-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {actionLoading === submission.id ? 'Working...' : 'Approve'}
            </button>
            <button
              onClick={() => onReject(submission.id)}
              disabled={actionLoading === submission.id}
              className="border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-800 transition-colors hover:border-red-300 hover:bg-red-100 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
            >
              Reject
            </button>
          </div>
        </div>
        <p className="mb-4 text-sm leading-6 text-stone-700">{submission.description}</p>
        {submission.tools && submission.tools.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {submission.tools.map(t => (
              <span key={t} className="bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{t}</span>
            ))}
          </div>
        )}
        <div className="border border-stone-200 bg-stone-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Prompt Text</p>
          <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-stone-800">
            {submission.prompt_text}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ChangeIdeaCard({ submission, prompts, onApprove, onReject, actionLoading }: {
  submission: Submission;
  prompts: Prompt[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actionLoading: number | null;
}) {
  const original = prompts.find(p => p.id === submission.original_prompt_id);

  return (
    <div className="overflow-hidden border border-stone-200 bg-white">
      <div className="p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="mb-2 inline-block bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Change Idea
            </span>
            <h3 className="font-display text-2xl font-bold leading-tight text-stone-950">{original?.title || 'Unknown Prompt'}</h3>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Submitted {new Date(submission.submitted_at * 1000).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => onApprove(submission.id)}
              disabled={actionLoading === submission.id}
              className="bg-green-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {actionLoading === submission.id ? 'Working...' : 'Approve Change'}
            </button>
            <button
              onClick={() => onReject(submission.id)}
              disabled={actionLoading === submission.id}
              className="border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-800 transition-colors hover:border-red-300 hover:bg-red-100 disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
            >
              Reject
            </button>
          </div>
        </div>

        {submission.description && (
          <p className="mb-4 border-l-4 border-amber-500 bg-amber-50 py-3 pl-4 text-sm leading-6 text-stone-700">
            {submission.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border border-stone-200 bg-stone-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-red-800">Current</p>
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-stone-700">
              {original?.prompt_text || '(prompt not found)'}
            </pre>
          </div>
          <div className="border border-green-200 bg-green-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-green-800">Proposed</p>
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-stone-800">
              {submission.proposed_change}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ prompt, form, setForm, saveLoading, saveMsg, onSave, onClose }: {
  prompt: Prompt;
  form: Partial<Prompt>;
  setForm: (f: Partial<Prompt>) => void;
  saveLoading: boolean;
  saveMsg: string;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-stone-300 bg-white shadow-2xl">
        <div className="sticky top-0 border-b border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-stone-950">Edit Prompt</h2>
            <button onClick={onClose} className="text-2xl leading-none text-stone-500 hover:text-red-900" aria-label="Close edit modal">x</button>
          </div>
          <p className="mt-1 break-words text-sm font-medium text-stone-500">{prompt.slug}</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Title</label>
            <input
              value={form.title || ''}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-stone-300 bg-white px-4 py-2.5 text-stone-950 placeholder-stone-400 outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Category</label>
            <input
              value={form.category || ''}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-stone-300 bg-white px-4 py-2.5 text-stone-950 placeholder-stone-400 outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full resize-none border border-stone-300 bg-white px-4 py-2.5 text-stone-950 placeholder-stone-400 outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Prompt Text</label>
            <textarea
              value={form.prompt_text || ''}
              onChange={e => setForm({ ...form, prompt_text: e.target.value })}
              rows={8}
              className="w-full resize-y border border-stone-300 bg-white px-4 py-2.5 font-mono text-sm leading-6 text-stone-950 placeholder-stone-400 outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">Setup Steps (one per line)</label>
            <textarea
              value={(form.setup_steps || []).join('\n')}
              onChange={e => setForm({ ...form, setup_steps: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="w-full resize-y border border-stone-300 bg-white px-4 py-2.5 font-mono text-sm leading-6 text-stone-950 placeholder-stone-400 outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900"
            />
          </div>

          {saveMsg && (
            <div className={`border p-3 text-sm font-medium ${saveMsg.startsWith('Error') ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
              {saveMsg}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row">
            <button
              onClick={onSave}
              disabled={saveLoading}
              className="bg-red-900 px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-800 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-950"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
