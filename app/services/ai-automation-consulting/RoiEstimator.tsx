'use client';

import { FormEvent, useMemo, useState } from 'react';
import { trackEvent } from '@/app/lib/analytics';

type EstimatorForm = {
  teamSize: string;
  hoursPerWeek: string;
  hourlyCost: string;
  errorRate: string;
  name: string;
  email: string;
  workflow: string;
  stack: string;
};

const INITIAL_FORM: EstimatorForm = {
  teamSize: '8',
  hoursPerWeek: '18',
  hourlyCost: '65',
  errorRate: '12',
  name: '',
  email: '',
  workflow: '',
  stack: '',
};

const MONTHS_PER_YEAR = 12;
const WEEKS_PER_MONTH = 4.33;
const TIME_RECOVERY_RATE = 0.35;
const REWORK_RECOVERY_RATE = 0.6;

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferImplementationCost(teamSize: number): number {
  if (teamSize <= 6) return 12000;
  if (teamSize <= 20) return 22000;
  return 40000;
}

export default function RoiEstimator() {
  const [form, setForm] = useState<EstimatorForm>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');

  const teamSize = parseNumber(form.teamSize);
  const hoursPerWeek = parseNumber(form.hoursPerWeek);
  const hourlyCost = parseNumber(form.hourlyCost);
  const errorRate = parseNumber(form.errorRate);

  const metrics = useMemo(() => {
    const weeklyManualCost = teamSize * hoursPerWeek * hourlyCost;
    const monthlyManualCost = weeklyManualCost * WEEKS_PER_MONTH;
    const timeRecoveryValue = monthlyManualCost * TIME_RECOVERY_RATE;
    const reworkValue = monthlyManualCost * (errorRate / 100) * REWORK_RECOVERY_RATE;
    const monthlySavings = Math.max(0, timeRecoveryValue + reworkValue);
    const implementationCost = inferImplementationCost(teamSize);
    const paybackMonths = monthlySavings > 0 ? implementationCost / monthlySavings : 0;
    const annualRoi =
      implementationCost > 0
        ? ((monthlySavings * MONTHS_PER_YEAR - implementationCost) / implementationCost) * 100
        : 0;

    return {
      monthlySavings,
      paybackMonths,
      annualRoi,
      implementationCost,
    };
  }, [errorRate, hourlyCost, hoursPerWeek, teamSize]);

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadStatus('loading');
    setLeadMessage('');

    try {
      await trackEvent({
        type: 'cta_click',
        metadata: {
          location: 'automation_roi_form',
          cta: 'get_my_automation_plan_submit',
          teamSize: teamSize || 0,
        },
      });

      const response = await fetch('/api/automation-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          teamSize: form.teamSize,
          workflow: form.workflow,
          stack: form.stack,
          monthlySavings: Math.round(metrics.monthlySavings),
          annualRoi: Math.round(metrics.annualRoi),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Submission failed');
      }

      setLeadStatus('success');
      setLeadMessage('Thanks. Your automation plan request is in queue. Expect a response within 1 business day.');
    } catch (error) {
      setLeadStatus('error');
      setLeadMessage(error instanceof Error ? error.message : 'Failed to submit request. Please try again.');
    }
  }

  return (
    <section id="roi-calculator" className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Automation ROI calculator</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Calculate your automation upside</h2>
        <p className="mt-2 max-w-3xl text-zinc-300">
          Estimate monthly savings, payback period, and annual ROI from your current workflows.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Team size
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                value={form.teamSize}
                onChange={(event) => setForm((prev) => ({ ...prev, teamSize: event.target.value }))}
                inputMode="numeric"
              />
              <span className="mt-1 block text-xs text-zinc-500">Number of people touching this workflow weekly.</span>
            </label>
            <label className="text-sm text-zinc-300">
              Hours/week
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                value={form.hoursPerWeek}
                onChange={(event) => setForm((prev) => ({ ...prev, hoursPerWeek: event.target.value }))}
                inputMode="decimal"
              />
              <span className="mt-1 block text-xs text-zinc-500">Average manual hours spent each week.</span>
            </label>
            <label className="text-sm text-zinc-300">
              Loaded hourly cost ($)
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                value={form.hourlyCost}
                onChange={(event) => setForm((prev) => ({ ...prev, hourlyCost: event.target.value }))}
                inputMode="decimal"
              />
              <span className="mt-1 block text-xs text-zinc-500">Fully loaded cost per hour.</span>
            </label>
            <label className="text-sm text-zinc-300">
              Rework/error rate (%)
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                value={form.errorRate}
                onChange={(event) => setForm((prev) => ({ ...prev, errorRate: event.target.value }))}
                inputMode="decimal"
              />
              <span className="mt-1 block text-xs text-zinc-500">% of effort lost to corrections.</span>
            </label>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSubmitted(true);
              trackEvent({
                type: 'cta_click',
                metadata: {
                  location: 'automation_roi_calculator',
                  cta: 'calculate_roi',
                },
              }).catch(() => null);
            }}
          >
            Calculate ROI
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Result summary</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-zinc-400">Estimated monthly savings</p>
              <p className="text-2xl font-bold text-emerald-400">${Math.round(metrics.monthlySavings).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Estimated payback period</p>
              <p className="text-2xl font-bold text-white">
                {metrics.paybackMonths > 0 ? `${metrics.paybackMonths.toFixed(1)} months` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Projected annual ROI</p>
              <p className="text-2xl font-bold text-indigo-300">{Math.round(metrics.annualRoi)}%</p>
            </div>
            <p className="text-xs text-zinc-500">
              Assumes phased rollout with discovery and iterative workflow hardening. Estimated implementation cost: $
              {metrics.implementationCost.toLocaleString()}.
            </p>
          </div>
        </div>
      </div>

      {submitted && (
        <form className="mt-8 rounded-2xl border border-zinc-700 bg-zinc-950/80 p-5" onSubmit={handleLeadSubmit}>
          <h3 className="font-display text-xl font-semibold text-white">Get My Automation Plan</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Share a few details and we will send a practical ROI-backed automation plan.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              required
              type="email"
              placeholder="Work email"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              required
              placeholder="Primary workflow"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              value={form.workflow}
              onChange={(event) => setForm((prev) => ({ ...prev, workflow: event.target.value }))}
            />
            <input
              required
              placeholder="Current tool stack"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              value={form.stack}
              onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button disabled={leadStatus === 'loading'} className="btn-primary" type="submit">
              {leadStatus === 'loading' ? 'Submitting...' : 'Request Automation Plan'}
            </button>
            <p className="text-xs text-zinc-500">
              Response within 1 business day. No generic pitch deck, only workflow-specific recommendations.
            </p>
          </div>

          {leadMessage && (
            <p className={`mt-3 text-sm ${leadStatus === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
              {leadMessage}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
