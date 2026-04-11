'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BoardLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/seo/board-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/seo/dashboard');
        router.refresh();
      } else {
        setError('Invalid credentials. Contact your administrator.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <div className="card-elevated p-8">
        <p className="text-xs tracking-[0.2em] uppercase text-indigo-300 mb-2">Board Access</p>
        <h1 className="section-heading mb-6">Daily Traffic Dashboard</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Sign in with your board credentials to view traffic KPIs.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Board password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-rose-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-zinc-500 text-xs mt-4 text-center">
          <a href="/" className="hover:text-zinc-300">Return to Decryptica</a>
        </p>
      </div>
    </div>
  );
}