'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Submission = {
  id: number;
  title: string;
  category: string;
  description: string;
  prompt_text: string;
  tools: string[];
  setup_steps: string[];
  trigger: string;
  alert: string;
  submitted_at: number;
};

export default function AdminPageClient() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (authenticated) {
      fetch('/api/prompts/admin')
        .then(r => r.json())
        .then(d => {
          if (d.error) { setAuthenticated(false); return; }
          setSubmissions(d.submissions || []);
        });
    }
  }, [authenticated]);

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
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Admin Access</h1>
          <p className="text-zinc-400">Enter your password to view pending submissions.</p>
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Admin Queue</h1>
          <p className="text-zinc-400">
            {submissions.length === 0
              ? 'No pending submissions'
              : `${submissions.length} pending submission${submissions.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <Link href="/prompts" className="text-zinc-400 hover:text-white text-sm">
          ← View Live Site
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-xl mb-2">All caught up!</p>
          <p className="text-sm">No pending submissions to review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full mb-2 inline-block">
                      {sub.category}
                    </span>
                    <h3 className="font-display font-semibold text-xl text-white">{sub.title}</h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      Submitted {new Date(sub.submitted_at * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(sub.id)}
                      disabled={actionLoading === sub.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {actionLoading === sub.id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(sub.id)}
                      disabled={actionLoading === sub.id}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-lg transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm mb-4">{sub.description}</p>

                {sub.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sub.tools.map(t => (
                      <span key={t} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-zinc-950/50 rounded-xl p-4 mt-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Prompt Text</p>
                  <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                    {sub.prompt_text}
                  </pre>
                </div>

                {sub.setup_steps.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Setup Steps</p>
                    <ol className="space-y-1">
                      {sub.setup_steps.map((step, i) => (
                        <li key={i} className="text-zinc-400 text-sm flex gap-2">
                          <span className="text-zinc-600">{i + 1}.</span>
                          <span className="font-mono">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
