'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';

const POPUP_DISMISSED_KEY = 'dc_newsletter_popup_dismissed';
const POPUP_SUBSCRIBED_KEY = 'dc_newsletter_popup_subscribed';
const POPUP_SEEN_KEY = 'dc_newsletter_popup_seen';
const SHOW_DELAY_MS = 9000;

type PopupState = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<PopupState>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = window.localStorage.getItem(POPUP_DISMISSED_KEY);
    const subscribed = window.localStorage.getItem(POPUP_SUBSCRIBED_KEY);

    if (dismissed || subscribed) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);

      if (!window.sessionStorage.getItem(POPUP_SEEN_KEY)) {
        window.sessionStorage.setItem(POPUP_SEEN_KEY, 'true');
        trackEvent({
          type: 'cta_view',
          metadata: { location: 'newsletter_popup', cta: 'subscribe', category: 'all' },
        }).catch(() => undefined);
      }
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissPopup('escape');
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isVisible]);

  const dismissPopup = (reason: 'close_button' | 'backdrop' | 'escape' | 'subscribed') => {
    if (typeof window !== 'undefined') {
      if (reason === 'subscribed') {
        window.localStorage.setItem(POPUP_SUBSCRIBED_KEY, 'true');
      } else {
        window.localStorage.setItem(POPUP_DISMISSED_KEY, 'true');
      }
    }

    trackEvent({
      type: 'cta_click',
      metadata: { location: 'newsletter_popup', cta: reason, category: 'all' },
    }).catch(() => undefined);

    setIsVisible(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('loading');
    setMessage('');

    trackEvent({
      type: 'form_submit',
      metadata: { location: 'newsletter_popup', cta: 'subscribe', category: 'all' },
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
      setMessage('You are in. Watch your inbox for the next Decryptica brief.');
      setEmail('');

      trackEvent({
        type: 'signup',
        metadata: { location: 'newsletter_popup', cta: 'subscribe', category: 'all' },
      }).catch(() => undefined);

      window.setTimeout(() => dismissPopup('subscribed'), 1200);
    } catch {
      setState('error');
      setMessage('Subscription failed. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="newsletter-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-title">
      <button
        type="button"
        className="newsletter-popup-backdrop"
        aria-label="Close newsletter popup"
        onClick={() => dismissPopup('backdrop')}
      />
      <div className="newsletter-popup-panel">
        <button
          type="button"
          className="newsletter-popup-close"
          aria-label="Dismiss popup"
          onClick={() => dismissPopup('close_button')}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="newsletter-popup-eyebrow">Decryptica Brief</div>
        <h2 id="newsletter-popup-title" className="newsletter-popup-title">Get the sharpest crypto, AI, and automation signal in your inbox</h2>
        <p className="newsletter-popup-copy">
          Weekly technical insights, practical breakdowns, and tool picks without the hype cycle.
        </p>

        <form onSubmit={handleSubmit} className="newsletter-popup-form">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => {
              trackEvent({
                type: 'form_start',
                metadata: { location: 'newsletter_popup', cta: 'subscribe', category: 'all' },
              }).catch(() => undefined);
            }}
            disabled={state === 'loading' || state === 'success'}
            placeholder="you@company.com"
            className="newsletter-popup-input"
          />
          <button
            type="submit"
            disabled={state === 'loading' || state === 'success'}
            className="newsletter-popup-submit"
          >
            {state === 'loading' ? 'Joining...' : state === 'success' ? 'Joined' : 'Subscribe free'}
          </button>
        </form>

        <p className="newsletter-popup-footnote">No spam. Unsubscribe anytime.</p>

        {message ? (
          <p className={`newsletter-popup-message ${state === 'error' ? 'is-error' : 'is-success'}`}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
