'use client';

import { useMemo, useState } from 'react';
import {
  hardwareLabel,
  HardwareType,
  modelRequirements,
  runnerRecommendation,
  speedVerdict,
  usableMemoryGb,
  useCaseAdvice,
  UseCase,
} from './modelData';

const hardwareOptions: { value: HardwareType; label: string }[] = [
  { value: 'apple-silicon', label: 'Apple Silicon Mac' },
  { value: 'windows-gpu', label: 'Windows PC with GPU' },
  { value: 'windows-cpu', label: 'Windows CPU-only PC' },
  { value: 'linux-gpu', label: 'Linux workstation with GPU' },
  { value: 'linux-cpu', label: 'Linux CPU-only machine' },
];

const useCases: { value: UseCase; label: string }[] = [
  { value: 'chat', label: 'Chat and writing' },
  { value: 'coding', label: 'Coding help' },
  { value: 'research', label: 'Research and summaries' },
  { value: 'agents', label: 'Agents and automation' },
];

export default function HardwareCalculator() {
  const [hardwareType, setHardwareType] = useState<HardwareType>('apple-silicon');
  const [ramGb, setRamGb] = useState(16);
  const [vramGb, setVramGb] = useState(0);
  const [storageGb, setStorageGb] = useState(50);
  const [useCase, setUseCase] = useState<UseCase>('chat');

  const results = useMemo(() => {
    const usable = usableMemoryGb({ hardwareType, ramGb, vramGb });
    const rows = modelRequirements.map((model) => {
      const headroom = usable - model.q4MemoryGb;
      const storageHeadroom = storageGb - model.diskGb;
      const verdict = storageHeadroom < 0 ? 'Needs more storage' : speedVerdict(headroom, model, hardwareType);
      return {
        model,
        verdict,
        headroom,
        fits: headroom >= 2 && storageHeadroom >= 0,
      };
    });
    const comfortable = rows.filter((row) => row.fits).at(-1)?.model;
    return { usable, rows, comfortable };
  }, [hardwareType, ramGb, storageGb, vramGb]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">Computer type</span>
            <select
              value={hardwareType}
              onChange={(event) => setHardwareType(event.target.value as HardwareType)}
              className="mt-3 h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold text-stone-950"
            >
              {hardwareOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">Main memory</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="192"
                step="8"
                value={ramGb}
                onChange={(event) => setRamGb(Number(event.target.value))}
                className="w-full accent-red-900"
              />
              <span className="w-20 border border-stone-200 bg-neutral-50 py-1 text-center text-sm font-bold">
                {ramGb}GB
              </span>
            </div>
          </label>

          <label className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">GPU memory</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="96"
                step="2"
                value={vramGb}
                onChange={(event) => setVramGb(Number(event.target.value))}
                className="w-full accent-red-900"
              />
              <span className="w-20 border border-stone-200 bg-neutral-50 py-1 text-center text-sm font-bold">
                {vramGb}GB
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Use 0 for Macs without separate VRAM or any CPU-only machine.
            </p>
          </label>

          <label className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">Free storage for models</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={storageGb}
                onChange={(event) => setStorageGb(Number(event.target.value))}
                className="w-full accent-red-900"
              />
              <span className="w-20 border border-stone-200 bg-neutral-50 py-1 text-center text-sm font-bold">
                {storageGb}GB
              </span>
            </div>
          </label>
        </div>

        <fieldset className="border border-stone-200 bg-neutral-50 p-4">
          <legend className="px-1 text-sm font-bold text-stone-950">Main use</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setUseCase(option.value)}
                className={`min-h-11 border px-3 text-sm font-bold ${
                  useCase === option.value
                    ? 'border-red-900 bg-red-900 text-white'
                    : 'border-stone-300 bg-white text-stone-800 hover:border-stone-950'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="overflow-hidden border border-stone-200">
          <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_8rem] border-b border-stone-200 bg-stone-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white sm:grid-cols-[7rem_minmax(0,1fr)_10rem]">
            <span>Model</span>
            <span>Common fit</span>
            <span>Verdict</span>
          </div>
          {results.rows.map((row) => (
            <div
              key={row.model.id}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)_8rem] gap-3 border-b border-stone-200 px-4 py-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)_10rem]"
            >
              <div>
                <p className="font-serif text-xl font-black text-stone-950">{row.model.label}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-stone-500">Q4</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{row.model.examples}</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">{row.model.useCase}</p>
              </div>
              <div>
                <p className="text-sm font-black text-stone-950">{row.verdict}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {row.headroom >= 0 ? `${row.headroom}GB headroom` : `${Math.abs(row.headroom)}GB short`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="h-fit border border-stone-900 bg-stone-950 p-5 text-white lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-200">Your local AI fit</p>
        <h2 className="mt-3 font-serif text-3xl font-black">
          {results.comfortable ? `${results.comfortable.label} is the practical ceiling` : 'Start smaller'}
        </h2>
        <div className="mt-5 space-y-4 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Machine profile</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">
              {hardwareLabel(hardwareType)} with about {results.usable}GB usable for local model inference.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Install first</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">
              {results.comfortable ? `${results.comfortable.label} Q4, then test one size higher if speed feels acceptable.` : 'A 3B Q4 model, then upgrade memory before chasing larger models.'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Runner</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">{runnerRecommendation(hardwareType)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Use case note</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">{useCaseAdvice(useCase, results.comfortable)}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
