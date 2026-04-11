'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { trackEvent } from '../lib/analytics';

type CaptureState = 'idle' | 'loading' | 'success' | 'error';

interface MidArticleLeadCaptureProps {
  articleSlug: string;
  category: string;
}

export default function MidArticleLeadCapture({ articleSlug, category }: MidArticleLeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<CaptureState>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setState('loading');
    setMessage('');

    trackEvent({
      type: 'cta_click',
      articleSlug,
      metadata: {
        location: 'article_mid_capture',
        cta: 'subscribe',
        category,
      },
    }).catch(() => undefined);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setMessage(data.error || 'Something went wrong.');
        return;
      }

      setState('success');
      setMessage('You are on the list. Weekly strategy briefs start next issue.');
      setEmail('');

      trackEvent({
        type: 'signup',
        articleSlug,
        metadata: {
          location: 'article_mid_capture',
          cta: 'subscribe',
          category,
        },
      }).catch(() => undefined);
    } catch {
      setState('error');
      setMessage('Subscription failed. Please try again.');
    }
  };

  return (
    <section
      className="my-10 rounded-2xl border border-cyan-400/25 bg-cyan-500/5 p-5 md:p-6"
      aria-label="Mid-article signup"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Mid-Article Brief</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-white">Want the next signal before everyone else?</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        Get one practical breakdown each week on AI, crypto, and automation trends that actually matter.
      </p>

      <div className="mt-4 min-h-24">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'loading' || state === 'success'}
            placeholder="you@company.com"
            className="h-11 w-full rounded-lg border border-cyan-200/20 bg-zinc-950/70 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 sm:flex-1"
          />
          <button
            type="submit"
            disabled={state === 'loading' || state === 'success'}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'loading' ? 'Joining...' : state === 'success' ? 'Joined' : 'Get Weekly Brief'}
          </button>
        </form>

        <p className="mt-2 text-xs text-zinc-400">No spam. Unsubscribe anytime.</p>

        {message && (
          <p className={`mt-3 text-sm ${state === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
            {message}
          </p>
        )}
      </div>

      <Link
        href="/tools/ai-price-calculator"
        className="mt-3 inline-flex text-sm text-cyan-300 underline decoration-cyan-400/60 underline-offset-4 hover:text-cyan-200"
      >
        Prefer to compare tools first? Open the free calculator.
      </Link>
    </section>
  );
}
