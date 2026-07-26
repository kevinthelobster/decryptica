'use client';

import { useMemo, useState } from 'react';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function RoiTool() {
  const [people, setPeople] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [hourlyCost, setHourlyCost] = useState(45);
  const [automationRate, setAutomationRate] = useState(55);
  const [buildCost, setBuildCost] = useState(4500);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(250);

  const result = useMemo(() => {
    const monthlyGross = people * hoursPerWeek * 4.33 * hourlyCost * (automationRate / 100);
    const monthlyNet = Math.max(0, monthlyGross - monthlyMaintenance);
    const paybackMonths = monthlyNet > 0 ? buildCost / monthlyNet : Infinity;
    const firstYearNet = monthlyNet * 12 - buildCost;
    return { monthlyGross, monthlyNet, paybackMonths, firstYearNet };
  }, [automationRate, buildCost, hourlyCost, hoursPerWeek, monthlyMaintenance, people]);

  const verdict =
    result.paybackMonths <= 3
      ? 'Build this now'
      : result.paybackMonths <= 8
        ? 'Worth scoping'
        : result.paybackMonths <= 14
          ? 'Needs a narrower workflow'
          : 'Do not automate yet';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: 'People affected', value: people, set: setPeople, min: 1, max: 50, suffix: '' },
          { label: 'Hours wasted per person weekly', value: hoursPerWeek, set: setHoursPerWeek, min: 1, max: 40, suffix: 'hrs' },
          { label: 'Fully loaded hourly cost', value: hourlyCost, set: setHourlyCost, min: 15, max: 200, suffix: '/hr' },
          { label: 'Work realistically automated', value: automationRate, set: setAutomationRate, min: 10, max: 90, suffix: '%' },
          { label: 'One-time build cost', value: buildCost, set: setBuildCost, min: 500, max: 50000, suffix: '' },
          { label: 'Monthly maintenance', value: monthlyMaintenance, set: setMonthlyMaintenance, min: 0, max: 5000, suffix: '/mo' },
        ].map((field) => (
          <label key={field.label} className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">{field.label}</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={field.value}
                onChange={(event) => field.set(Number(event.target.value))}
                className="w-full accent-red-900"
              />
              <span className="w-24 border border-stone-200 bg-neutral-50 py-1 text-center text-sm font-bold text-stone-950">
                {field.label.toLowerCase().includes('cost') || field.label.toLowerCase().includes('maintenance')
                  ? currency(field.value)
                  : `${field.value}${field.suffix}`}
              </span>
            </div>
          </label>
        ))}
      </div>

      <aside className="h-fit border border-stone-900 bg-stone-950 p-5 text-white lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-200">Automation verdict</p>
        <h2 className="mt-3 font-serif text-3xl font-black">{verdict}</h2>
        <div className="mt-5 space-y-4 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Monthly net savings</p>
            <p className="font-serif text-3xl font-black">{currency(result.monthlyNet)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Payback period</p>
            <p className="font-serif text-3xl font-black">
              {Number.isFinite(result.paybackMonths) ? `${result.paybackMonths.toFixed(1)} mo` : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">First-year net</p>
            <p className="font-serif text-3xl font-black">{currency(result.firstYearNet)}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
