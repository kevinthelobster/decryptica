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
  trigger: string;
  alert: string;
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
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Admin Access</h1>
          <p className="text-zinc-400">Enter your password to manage the prompt library.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {loginError}
            </div>
          )}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          <Link href="/prompts" className="hover:text-indigo-400">← Back to prompts</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Prompt Admin</h1>
          <p className="text-zinc-400 text-sm">
            {submissions.length === 0 ? 'All caught up!' : `${submissions.length} pending (${newSubmissions.length} new, ${changeIdeas.length} change ideas)`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/prompts" className="text-zinc-400 hover:text-white text-sm flex items-center">
            ← Live Site
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('submissions')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'submissions' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Submissions
          {submissions.length > 0 && <span className="ml-2 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full">{submissions.length}</span>}
        </button>
        <button
          onClick={() => setTab('edit')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'edit' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Edit Prompts
          <span className="ml-2 text-zinc-500">{prompts.length}</span>
        </button>
      </div>

      {/* ── Submissions Tab ── */}
      {tab === 'submissions' && (
        <>
          {submissions.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-xl mb-2">All caught up!</p>
              <p className="text-sm">No pending submissions.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* New prompt submissions */}
              {newSubmissions.length > 0 && (
                <div>
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-lg">📬</span> New Prompts ({newSubmissions.length})
                  </h2>
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
                </div>
              )}

              {/* Change ideas */}
              {changeIdeas.length > 0 && (
                <div>
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-lg">💡</span> Change Ideas ({changeIdeas.length})
                  </h2>
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
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Edit Prompts Tab ── */}
      {tab === 'edit' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map(prompt => (
              <div key={prompt.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        {prompt.category}
                      </span>
                      {prompt.is_staff_pick && (
                        <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                          ⭐ Staff Pick
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white truncate">{prompt.title}</h3>
                  </div>
                  <button
                    onClick={() => toggleStaffPick(prompt.id)}
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${prompt.is_staff_pick ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : 'bg-zinc-800 text-zinc-500 hover:text-yellow-400'}`}
                    title="Toggle Staff Pick"
                  >
                    {prompt.is_staff_pick ? '★ Picked' : '☆ Pick'}
                  </button>
                </div>
                <p className="text-zinc-500 text-xs mb-3 line-clamp-2">{prompt.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 text-xs">↑ {prompt.vote_count} votes</span>
                  <button
                    onClick={() => openEdit(prompt)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                  >
                    Edit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full mb-2 inline-block">
              {submission.category}
            </span>
            <h3 className="font-display font-semibold text-xl text-white">{submission.title}</h3>
            <p className="text-zinc-500 text-xs mt-1">
              {new Date(submission.submitted_at * 1000).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(submission.id)}
              disabled={actionLoading === submission.id}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {actionLoading === submission.id ? '...' : '✓ Approve'}
            </button>
            <button
              onClick={() => onReject(submission.id)}
              disabled={actionLoading === submission.id}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        </div>
        <p className="text-zinc-400 text-sm mb-4">{submission.description}</p>
        {submission.tools && submission.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {submission.tools.map(t => (
              <span key={t} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>
        )}
        <div className="bg-zinc-950/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Prompt Text</p>
          <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full mb-2 inline-block">
              💡 Change Idea
            </span>
            <h3 className="font-display font-semibold text-xl text-white">{original?.title || 'Unknown Prompt'}</h3>
            <p className="text-zinc-500 text-xs mt-1">
              Submitted {new Date(submission.submitted_at * 1000).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(submission.id)}
              disabled={actionLoading === submission.id}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {actionLoading === submission.id ? '...' : '✓ Approve Change'}
            </button>
            <button
              onClick={() => onReject(submission.id)}
              disabled={actionLoading === submission.id}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        </div>

        {submission.description && (
          <p className="text-zinc-400 text-sm mb-4 italic">"{submission.description}"</p>
        )}

        {/* Diff view */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Current</p>
            <pre className="text-zinc-400 text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
              {original?.prompt_text || '(prompt not found)'}
            </pre>
          </div>
          <div className="bg-zinc-950/50 rounded-xl p-4 border border-green-500/20">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Proposed</p>
            <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
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
  const fields: Array<{key: keyof Prompt; label: string; multiline?: boolean}> = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', multiline: true },
    { key: 'prompt_text', label: 'Prompt Text', multiline: true },
    { key: 'trigger', label: 'Trigger (e.g. "Every night at 3 AM")' },
    { key: 'alert', label: 'Alert Message' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-white">Edit Prompt</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button>
          </div>
          <p className="text-zinc-500 text-sm mt-1">{prompt.slug}</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
            <input
              value={form.title || ''}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
            <input
              value={form.category || ''}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Prompt Text */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Prompt Text</label>
            <textarea
              value={form.prompt_text || ''}
              onChange={e => setForm({ ...form, prompt_text: e.target.value })}
              rows={8}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono text-sm resize-y"
            />
          </div>

          {/* Setup Steps */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Setup Steps (one per line)</label>
            <textarea
              value={(form.setup_steps || []).join('\n')}
              onChange={e => setForm({ ...form, setup_steps: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono text-sm resize-y"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Trigger</label>
            <input
              value={form.trigger || ''}
              onChange={e => setForm({ ...form, trigger: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Alert */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Alert</label>
            <input
              value={form.alert || ''}
              onChange={e => setForm({ ...form, alert: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {saveMsg && (
            <div className={`text-sm ${saveMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {saveMsg}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onSave}
              disabled={saveLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
