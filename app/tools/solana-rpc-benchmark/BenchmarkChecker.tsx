'use client';

import { useMemo, useState } from 'react';

type Field = {
  id: string;
  label: string;
  helper: string;
  weight: number;
};

const fields: Field[] = [
  { id: 'latency', label: 'Median latency under load', helper: 'Score real read/write latency during your peak use case.', weight: 18 },
  { id: 'websocket', label: 'Websocket stability', helper: 'Subscriptions stay connected without silent drops.', weight: 16 },
  { id: 'rateLimits', label: 'Rate-limit clarity', helper: 'Limits, burst behavior, and overage handling are explicit.', weight: 14 },
  { id: 'failover', label: 'Failover behavior', helper: 'You know what happens when the primary endpoint degrades.', weight: 14 },
  { id: 'indexing', label: 'Indexing and archive fit', helper: 'Enhanced APIs match your token, NFT, wallet, or historical data needs.', weight: 12 },
  { id: 'observability', label: 'Logs and dashboards', helper: 'You can see errors, saturation, and endpoint health quickly.', weight: 10 },
  { id: 'support', label: 'Support and incident response', helper: 'Support path is clear before production incidents happen.', weight: 8 },
  { id: 'cost', label: 'Cost predictability', helper: 'Pricing maps cleanly to your call volume and traffic spikes.', weight: 8 },
];

function verdict(score: number) {
  if (score >= 82) return { label: 'Production shortlist', copy: 'Strong enough to keep in the final vendor round.' };
  if (score >= 65) return { label: 'Needs proof', copy: 'Promising, but run a targeted benchmark before committing.' };
  if (score >= 45) return { label: 'Pilot only', copy: 'Use for testing or fallback, not critical production paths yet.' };
  return { label: 'High risk', copy: 'Too many gaps for trading bots or customer-facing Solana infrastructure.' };
}

export default function BenchmarkChecker() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(fields.map((field) => [field.id, 3]))
  );

  const result = useMemo(() => {
    const score = fields.reduce((total, field) => total + ((scores[field.id] || 0) / 5) * field.weight, 0);
    return Math.round(score);
  }, [scores]);

  const currentVerdict = verdict(result);
  const weakSpots = fields
    .filter((field) => (scores[field.id] || 0) <= 2)
    .map((field) => field.label)
    .slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        {fields.map((field) => (
          <label key={field.id} className="block border border-stone-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="font-serif text-xl font-black text-stone-950">{field.label}</span>
                <p className="mt-1 text-sm leading-6 text-stone-600">{field.helper}</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">{field.weight} pts</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="5"
                value={scores[field.id]}
                onChange={(event) => setScores((current) => ({ ...current, [field.id]: Number(event.target.value) }))}
                className="w-full accent-red-900"
              />
              <span className="w-10 border border-stone-200 bg-neutral-50 py-1 text-center text-sm font-bold text-stone-950">
                {scores[field.id]}/5
              </span>
            </div>
          </label>
        ))}
      </div>

      <aside className="h-fit border border-stone-900 bg-stone-950 p-5 text-white lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-200">Provider score</p>
        <p className="mt-3 font-serif text-6xl font-black">{result}</p>
        <h2 className="mt-2 font-serif text-2xl font-black">{currentVerdict.label}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-200">{currentVerdict.copy}</p>
        <div className="mt-5 border-t border-white/20 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-300">Next check</p>
          {weakSpots.length ? (
            <ul className="mt-3 space-y-2 text-sm text-stone-200">
              {weakSpots.map((spot) => (
                <li key={spot}>Tighten: {spot}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-stone-200">Ask for a production trial and benchmark against your real traffic pattern.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
