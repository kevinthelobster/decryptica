'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';

const DISMISS_KEY = 'decryptica:newsletter-prompt-dismissed-at';
const SUBSCRIBED_KEY = 'decryptica:newsletter-subscribed';
const DISMISS_DAYS = 30;
const SCROLL_TRIGGER = 0.5;

interface NewsletterCornerPromptProps {
  articleSlug: string;
  category?: string;
}

// Small, dismissible weekly-newsletter prompt. Appears only after the reader is
// halfway through an article, at most once per 30 days, and never covers the
// article body (corner card on desktop, slim bar above the mobile dock).
export default function NewsletterCornerPrompt({ articleSlug, category }: NewsletterCornerPromptProps) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) return;
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    } catch {
      return;
    }

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_TRIGGER) {
        setVisible(true);
        trackEvent({
          type: 'cta_view',
          metadata: { location: 'newsletter_corner_prompt', cta: 'subscribe', articleSlug },
        }).catch(() => undefined);
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [articleSlug]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    trackEvent({
      type: 'form_submit',
      metadata: { location: 'newsletter_corner_prompt', cta: 'subscribe', articleSlug },
    }).catch(() => undefined);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter-corner-prompt', articleSlug, category }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You are in. First issue lands Friday.');
        try {
          localStorage.setItem(SUBSCRIBED_KEY, '1');
        } catch {}
        setTimeout(() => setVisible(false), 4000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (!visible) return null;

  return (
    <aside
      role="complementary"
      aria-label="Weekly newsletter signup"
      className="fixed inset-x-3 bottom-20 z-30 border border-stone-950 bg-white p-3 shadow-lg shadow-stone-300/60 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-80 lg:p-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close newsletter signup"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-stone-500 hover:text-stone-950"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {status === 'success' ? (
        <p className="pr-8 text-sm font-semibold text-stone-950">{message}</p>
      ) : (
        <>
          <p className="hidden text-[11px] font-semibold uppercase tracking-wider text-stone-500 lg:block">The Decryptica Dispatch</p>
          <p className="pr-8 font-display text-sm font-semibold leading-snug text-stone-950 lg:mt-1 lg:text-base">
            <span className="lg:hidden">The week&apos;s best AI and crypto tools, every Friday.</span>
            <span className="hidden lg:inline">
              The week&apos;s best AI and crypto tools, plus price changes, in one 3-minute email every Friday.
            </span>
          </p>
          <form onSubmit={handleSubmit} className="mt-2 flex gap-2 lg:mt-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              disabled={status === 'loading'}
              aria-label="Email address"
              className="min-w-0 flex-1 border border-stone-300 px-3 py-2 text-sm text-stone-950 placeholder:text-stone-400 focus:border-stone-950 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="shrink-0 bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {status === 'loading' ? 'Joining…' : 'Join'}
            </button>
          </form>
          {status === 'error' && <p className="mt-2 text-xs text-red-700">{message}</p>}
          <p className="mt-2 hidden text-[11px] text-stone-500 lg:block">Free. Unsubscribe anytime.</p>
        </>
      )}
    </aside>
  );
}
