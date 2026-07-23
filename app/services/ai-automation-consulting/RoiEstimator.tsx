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

type QuickIntakeForm = {
  teamSize: string;
  primaryWorkflow: string;
  targetOutcome: string;
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

const INITIAL_QUICK_INTAKE: QuickIntakeForm = {
  teamSize: '8',
  primaryWorkflow: '',
  targetOutcome: '',
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
  const [quickIntake, setQuickIntake] = useState<QuickIntakeForm>(INITIAL_QUICK_INTAKE);
  const [submitted, setSubmitted] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [leadMessage, setLeadMessage] = useState('');
  const [quickIntakeStatus, setQuickIntakeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [quickIntakeMessage, setQuickIntakeMessage] = useState('');

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

  function handleQuickIntakeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quickIntake.primaryWorkflow.trim() || !quickIntake.targetOutcome.trim()) {
      setQuickIntakeStatus('error');
      setQuickIntakeMessage('Please complete all quick-intake fields.');
      return;
    }

    setQuickIntakeStatus('success');
    setQuickIntakeMessage('Quick intake saved. Continue below to request your full plan.');

    setForm((prev) => ({
      ...prev,
      teamSize: quickIntake.teamSize,
      workflow: quickIntake.primaryWorkflow,
      stack: quickIntake.targetOutcome,
    }));
    setSubmitted(true);

    trackEvent({
      type: 'quick_capture_submit',
      metadata: {
        location: 'quick_capture',
        pageType: 'consulting',
        capturedIntent: 'implement',
      },
    }).catch(() => undefined);
  }

  return (
    <section id="roi-calculator" className=" border border-stone-200 bg-white p-6 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-800">Automation ROI calculator</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-stone-950 md:text-3xl">Calculate your automation upside</h2>
        <p className="mt-2 max-w-3xl text-stone-700">
          Estimate monthly savings, payback period, and annual ROI from your current workflows.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-stone-700">
              Team size
              <input
                className="mt-1 w-full  border border-stone-300 bg-white px-3 py-2 text-stone-950"
                value={form.teamSize}
                onChange={(event) => setForm((prev) => ({ ...prev, teamSize: event.target.value }))}
                inputMode="numeric"
              />
              <span className="mt-1 block text-xs text-stone-500">Number of people touching this workflow weekly.</span>
            </label>
            <label className="text-sm text-stone-700">
              Hours/week
              <input
                className="mt-1 w-full  border border-stone-300 bg-white px-3 py-2 text-stone-950"
                value={form.hoursPerWeek}
                onChange={(event) => setForm((prev) => ({ ...prev, hoursPerWeek: event.target.value }))}
                inputMode="decimal"
              />
              <span className="mt-1 block text-xs text-stone-500">Average manual hours spent each week.</span>
            </label>
            <label className="text-sm text-stone-700">
              Loaded hourly cost ($)
              <input
                className="mt-1 w-full  border border-stone-300 bg-white px-3 py-2 text-stone-950"
                value={form.hourlyCost}
                onChange={(event) => setForm((prev) => ({ ...prev, hourlyCost: event.target.value }))}
                inputMode="decimal"
              />
              <span className="mt-1 block text-xs text-stone-500">Fully loaded cost per hour.</span>
            </label>
            <label className="text-sm text-stone-700">
              Rework/error rate (%)
              <input
                className="mt-1 w-full  border border-stone-300 bg-white px-3 py-2 text-stone-950"
                value={form.errorRate}
                onChange={(event) => setForm((prev) => ({ ...prev, errorRate: event.target.value }))}
                inputMode="decimal"
              />
              <span className="mt-1 block text-xs text-stone-500">% of effort lost to corrections.</span>
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

        <div className=" border border-stone-300 bg-white/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Result summary</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-stone-600">Estimated monthly savings</p>
              <p className="text-2xl font-bold text-emerald-400">${Math.round(metrics.monthlySavings).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-stone-600">Estimated payback period</p>
              <p className="text-2xl font-bold text-stone-950">
                {metrics.paybackMonths > 0 ? `${metrics.paybackMonths.toFixed(1)} months` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-stone-600">Projected annual ROI</p>
              <p className="text-2xl font-bold text-red-700">{Math.round(metrics.annualRoi)}%</p>
            </div>
            <p className="text-xs text-stone-500">
              Assumes phased rollout with discovery and iterative workflow hardening. Estimated implementation cost: $
              {metrics.implementationCost.toLocaleString()}.
            </p>
          </div>
        </div>
      </div>

      <section id="quick-intake" className="mt-8  border border-red-900/25 bg-red-900/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Quick intake</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-stone-950">Save context before full request</h3>
        <p className="mt-1 text-sm text-stone-700">
          Share three details now. You can complete the full contact flow after this step.
        </p>

        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleQuickIntakeSubmit}>
          <input
            required
            placeholder="Team size"
            className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
            value={quickIntake.teamSize}
            onChange={(event) => setQuickIntake((prev) => ({ ...prev, teamSize: event.target.value }))}
          />
          <input
            required
            placeholder="Primary workflow"
            className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
            value={quickIntake.primaryWorkflow}
            onChange={(event) => setQuickIntake((prev) => ({ ...prev, primaryWorkflow: event.target.value }))}
          />
          <input
            required
            placeholder="Target outcome"
            className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
            value={quickIntake.targetOutcome}
            onChange={(event) => setQuickIntake((prev) => ({ ...prev, targetOutcome: event.target.value }))}
          />
          <button type="submit" className="btn-secondary w-fit">
            Continue to Full Plan Request
          </button>
        </form>

        {quickIntakeMessage && (
          <p className={`mt-3 text-sm ${quickIntakeStatus === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
            {quickIntakeMessage}
          </p>
        )}
      </section>

      {submitted && (
        <form className="mt-8  border border-stone-300 bg-white/80 p-5" onSubmit={handleLeadSubmit}>
          <h3 className="font-display text-xl font-semibold text-stone-950">Get My Automation Plan</h3>
          <p className="mt-1 text-sm text-stone-600">
            Share a few details and we will send a practical ROI-backed automation plan.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              required
              type="email"
              placeholder="Work email"
              className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              required
              placeholder="Primary workflow"
              className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
              value={form.workflow}
              onChange={(event) => setForm((prev) => ({ ...prev, workflow: event.target.value }))}
            />
            <input
              required
              placeholder="Current tool stack"
              className=" border border-stone-300 bg-white px-3 py-2 text-stone-950"
              value={form.stack}
              onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button disabled={leadStatus === 'loading'} className="btn-primary" type="submit">
              {leadStatus === 'loading' ? 'Submitting...' : 'Request Automation Plan'}
            </button>
            <p className="text-xs text-stone-500">
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
