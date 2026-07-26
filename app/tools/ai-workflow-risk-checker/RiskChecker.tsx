'use client';

import { useMemo, useState } from 'react';

type RiskItem = {
  id: string;
  label: string;
  consequence: string;
  severity: number;
};

const risks: RiskItem[] = [
  { id: 'privateData', label: 'Touches private customer, employee, or financial data', consequence: 'Data exposure and retention questions', severity: 18 },
  { id: 'externalActions', label: 'Can send emails, update systems, publish, or trigger payments', consequence: 'Bad actions can leave the draft environment', severity: 18 },
  { id: 'untrustedInput', label: 'Reads web pages, files, tickets, emails, or user uploads', consequence: 'Prompt injection can influence behavior', severity: 16 },
  { id: 'noApproval', label: 'No approval gate before important actions', consequence: 'Humans cannot stop high-impact mistakes', severity: 14 },
  { id: 'broadCredentials', label: 'Uses broad API keys or shared admin credentials', consequence: 'One workflow can overreach across systems', severity: 12 },
  { id: 'weakLogs', label: 'Tool calls and outputs are not logged clearly', consequence: 'Incidents become hard to diagnose', severity: 10 },
  { id: 'noRollback', label: 'No rollback or retry plan exists', consequence: 'Partial failures turn into manual cleanup', severity: 8 },
  { id: 'unclearOwner', label: 'No named business/process owner', consequence: 'Nobody maintains the workflow after launch', severity: 4 },
];

function verdict(score: number) {
  if (score >= 70) return { label: 'Do not launch yet', copy: 'Add guardrails before this workflow touches production systems.' };
  if (score >= 42) return { label: 'Launch only behind approvals', copy: 'Useful, but it needs explicit review gates and tighter scopes.' };
  if (score >= 18) return { label: 'Pilot with monitoring', copy: 'Reasonable for a controlled pilot with logs and a named owner.' };
  return { label: 'Low-risk lane', copy: 'This looks suitable for a small launch if the assumptions are accurate.' };
}

export default function RiskChecker() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const score = useMemo(
    () => risks.reduce((total, risk) => total + (checked[risk.id] ? risk.severity : 0), 0),
    [checked]
  );
  const active = risks.filter((risk) => checked[risk.id]);
  const currentVerdict = verdict(score);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="grid gap-3">
        {risks.map((risk) => (
          <label key={risk.id} className="flex gap-4 border border-stone-200 bg-white p-4">
            <input
              type="checkbox"
              checked={Boolean(checked[risk.id])}
              onChange={(event) => setChecked((current) => ({ ...current, [risk.id]: event.target.checked }))}
              className="mt-1 h-5 w-5 accent-red-900"
            />
            <span>
              <span className="block font-serif text-xl font-black leading-tight text-stone-950">{risk.label}</span>
              <span className="mt-1 block text-sm leading-6 text-stone-600">{risk.consequence}</span>
            </span>
          </label>
        ))}
      </div>

      <aside className="h-fit border border-stone-900 bg-stone-950 p-5 text-white lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-200">Risk score</p>
        <p className="mt-3 font-serif text-6xl font-black">{score}</p>
        <h2 className="mt-2 font-serif text-2xl font-black">{currentVerdict.label}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-200">{currentVerdict.copy}</p>
        <div className="mt-5 border-t border-white/20 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-300">Required controls</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-200">
            {(active.length ? active.slice(0, 4) : [{ consequence: 'Keep the workflow narrow and document the owner.' }]).map((risk) => (
              <li key={risk.consequence}>{risk.consequence}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
