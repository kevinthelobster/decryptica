'use client';

import { useState } from 'react';
import { trackEvent } from '../lib/analytics';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    trackEvent({
      type: 'form_submit',
      metadata: { location: 'article_subscribe_form', cta: 'subscribe' },
    }).catch(() => undefined);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Welcome aboard! 🎉');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
        <p className="text-white font-medium text-lg">{message}</p>
        <p className="text-indigo-200 text-sm mt-1">Check your inbox for a confirmation email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
        className="flex-1 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
        onFocus={() => {
          trackEvent({
            type: 'form_start',
            metadata: { location: 'article_subscribe_form', cta: 'subscribe' },
          }).catch(() => undefined);
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-8 py-3 rounded-full bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Joining...
          </>
        ) : (
          'Subscribe'
        )}
      </button>
      {status === 'error' && (
        <p className="text-red-200 text-sm mt-2">{message}</p>
      )}
    </form>
  );
}