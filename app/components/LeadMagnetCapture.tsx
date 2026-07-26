'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import type { LeadMagnet } from '../data/lead-magnets';
import { trackEvent } from '../lib/analytics';

type CaptureState = 'idle' | 'loading' | 'success' | 'error';

type LeadMagnetCaptureProps = {
  offer: LeadMagnet;
  location: string;
  articleSlug?: string;
  category?: string;
  compact?: boolean;
  dark?: boolean;
};

export default function LeadMagnetCapture({
  offer,
  location,
  articleSlug,
  category,
  compact = false,
  dark = false,
}: LeadMagnetCaptureProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<CaptureState>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('loading');
    setMessage('');

    const metadata = {
      location,
      cta: offer.ctaLabel,
      offerSlug: offer.slug,
      offerTitle: offer.title,
      category: category || offer.category,
    };

    trackEvent({
      type: 'form_submit',
      articleSlug,
      metadata,
    }).catch(() => undefined);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: location,
          offerSlug: offer.slug,
          offerTitle: offer.title,
          category: category || offer.category,
          articleSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save your request.');
      }

      setState('success');
      setEmail('');
      setMessage(offer.successMessage);

      trackEvent({
        type: 'signup',
        articleSlug,
        metadata,
      }).catch(() => undefined);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to save your request.');
    }
  }

  const borderClass = dark ? 'border-stone-700 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-950';
  const mutedClass = dark ? 'text-stone-300' : 'text-stone-600';
  const eyebrowClass = dark ? 'text-red-200' : 'text-red-800';
  const buttonLabel = compact && offer.compactCtaLabel ? offer.compactCtaLabel : offer.ctaLabel;

  return (
    <section className={`border p-5 ${borderClass}`} aria-label={offer.title}>
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${eyebrowClass}`}>{offer.eyebrow}</p>
      <h3 className={`${compact ? 'text-xl' : 'text-2xl'} mt-2 font-serif font-black leading-tight`}>
        {offer.title}
      </h3>
      <p className={`mt-3 text-sm leading-6 ${mutedClass}`}>{offer.description}</p>

      {!compact && (
        <ul className="mt-4 grid gap-2 text-xs font-bold uppercase tracking-[0.1em] text-stone-500 sm:grid-cols-3">
          {offer.bullets.map((bullet) => (
            <li key={bullet} className={dark ? 'border border-stone-700 px-3 py-2 text-stone-300' : 'border border-stone-200 px-3 py-2'}>
              {bullet}
            </li>
          ))}
        </ul>
      )}

      <p className={`mt-4 text-xs leading-5 ${dark ? 'text-stone-400' : 'text-stone-500'}`}>
        {offer.deliverable}. {offer.cadence}.
      </p>

      <form
        className={`mt-4 grid gap-2 ${
          compact ? 'sm:grid-cols-[minmax(10rem,1fr)_auto]' : 'sm:grid-cols-[minmax(12rem,1fr)_auto]'
        }`}
        onSubmit={onSubmit}
      >
        <label className="sr-only" htmlFor={`${offer.slug}-${location}-email`}>
          Email address
        </label>
        <input
          id={`${offer.slug}-${location}-email`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={state === 'loading' || state === 'success'}
          placeholder="you@company.com"
          onFocus={() => {
            trackEvent({
              type: 'form_start',
              articleSlug,
              metadata: {
                location,
                cta: offer.ctaLabel,
                offerSlug: offer.slug,
                offerTitle: offer.title,
                category: category || offer.category,
              },
            }).catch(() => undefined);
          }}
          className={`h-11 min-w-0 border px-4 text-sm focus:outline-none ${
            dark
              ? 'border-stone-700 bg-stone-900 text-white placeholder:text-stone-500 focus:border-red-300'
              : 'border-stone-300 bg-white text-stone-950 placeholder:text-stone-400 focus:border-red-900'
          }`}
        />
        <button
          type="submit"
          disabled={state === 'loading' || state === 'success'}
          className={`h-11 shrink-0 px-4 text-xs font-bold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
            dark ? 'bg-white text-stone-950 hover:bg-red-100' : 'bg-red-900 text-white hover:bg-stone-950'
          }`}
        >
          {state === 'loading' ? 'Sending...' : state === 'success' ? 'Sent' : buttonLabel}
        </button>
      </form>

      {message && (
        <p className={`mt-3 text-sm ${state === 'error' ? 'text-red-700' : dark ? 'text-emerald-200' : 'text-emerald-700'}`}>
          {message}
        </p>
      )}

      <Link
        href={offer.secondaryHref}
        className={`mt-4 inline-flex text-sm font-bold underline decoration-stone-300 underline-offset-4 ${
          dark ? 'text-red-100 hover:text-white' : 'text-red-900 hover:text-stone-950'
        }`}
      >
        {offer.secondaryLabel}
      </Link>
    </section>
  );
}
