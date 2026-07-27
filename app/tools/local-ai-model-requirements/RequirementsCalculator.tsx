'use client';

import { useMemo, useState } from 'react';
import {
  getModelRequirement,
  hardwareLabel,
  HardwareType,
  memoryForQuant,
  ModelSize,
  modelRequirements,
  quantLabel,
  QuantLevel,
  runnerRecommendation,
} from '../local-ai-hardware-calculator/modelData';

const hardwareOptions: { value: HardwareType; label: string }[] = [
  { value: 'apple-silicon', label: 'Apple Silicon Mac' },
  { value: 'windows-gpu', label: 'Windows PC with NVIDIA/AMD GPU' },
  { value: 'windows-cpu', label: 'Windows CPU-only PC' },
  { value: 'linux-gpu', label: 'Linux GPU workstation' },
  { value: 'linux-cpu', label: 'Linux CPU-only machine' },
];

const quantOptions: { value: QuantLevel; label: string; note: string }[] = [
  { value: 'q4', label: 'Q4 practical', note: 'Smallest useful install for most people.' },
  { value: 'q5', label: 'Q5 balanced', note: 'A little better quality, more memory.' },
  { value: 'q8', label: 'Q8 quality', note: 'Large memory footprint, closest to full precision.' },
];

function recommendedHardware(requiredMemory: number, hardwareType: HardwareType) {
  const comfortableMemory = Math.ceil((requiredMemory + 6) / 8) * 8;

  if (hardwareType === 'apple-silicon') {
    return {
      minimum: `${Math.ceil(requiredMemory / 0.75 / 8) * 8}GB unified memory`,
      comfortable: `${Math.ceil(comfortableMemory / 0.75 / 8) * 8}GB unified memory`,
      note: 'Apple unified memory can run models that would normally need separate VRAM, but the OS and apps need headroom.',
    };
  }

  if (hardwareType === 'windows-gpu' || hardwareType === 'linux-gpu') {
    return {
      minimum: `${Math.ceil(requiredMemory / 2) * 2}GB VRAM or CPU fallback with lots of RAM`,
      comfortable: `${Math.ceil((requiredMemory + 6) / 2) * 2}GB VRAM plus 32GB+ system RAM`,
      note: 'GPU memory is the real speed gate. CPU fallback may run, but it will usually feel much slower.',
    };
  }

  return {
    minimum: `${Math.ceil(requiredMemory / 0.65 / 8) * 8}GB system RAM`,
    comfortable: `${Math.ceil(comfortableMemory / 0.65 / 8) * 8}GB system RAM`,
    note: 'CPU-only local AI is useful for smaller models, but larger models trade privacy for a lot of waiting.',
  };
}

export default function RequirementsCalculator() {
  const [modelSize, setModelSize] = useState<ModelSize>('8b');
  const [quant, setQuant] = useState<QuantLevel>('q4');
  const [hardwareType, setHardwareType] = useState<HardwareType>('apple-silicon');
  const [contextLevel, setContextLevel] = useState<'normal' | 'long'>('normal');

  const result = useMemo(() => {
    const model = getModelRequirement(modelSize);
    const baseMemory = memoryForQuant(model, quant);
    const contextOverhead = contextLevel === 'long' ? Math.max(3, Math.round(baseMemory * 0.2)) : 2;
    const requiredMemory = baseMemory + contextOverhead;
    const comfortableMemory = requiredMemory + 6;
    const hardware = recommendedHardware(requiredMemory, hardwareType);
    const verdict =
      requiredMemory <= 8
        ? 'Beginner-friendly'
        : requiredMemory <= 18
          ? 'Laptop-friendly with enough RAM'
          : requiredMemory <= 34
            ? 'High-memory machine'
            : 'Workstation-class';

    return { model, baseMemory, contextOverhead, requiredMemory, comfortableMemory, hardware, verdict };
  }, [contextLevel, hardwareType, modelSize, quant]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">Target model size</span>
            <select
              value={modelSize}
              onChange={(event) => setModelSize(event.target.value as ModelSize)}
              className="mt-3 h-11 w-full border border-stone-300 bg-white px-3 text-sm font-bold text-stone-950"
            >
              {modelRequirements.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-stone-500">{result.model.examples}</p>
          </label>

          <label className="border border-stone-200 bg-white p-4">
            <span className="text-sm font-bold text-stone-950">Hardware style</span>
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
        </div>

        <fieldset className="border border-stone-200 bg-neutral-50 p-4">
          <legend className="px-1 text-sm font-bold text-stone-950">Quantization</legend>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {quantOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setQuant(option.value)}
                className={`min-h-[6rem] border p-3 text-left ${
                  quant === option.value
                    ? 'border-red-900 bg-red-900 text-white'
                    : 'border-stone-300 bg-white text-stone-800 hover:border-stone-950'
                }`}
              >
                <span className="block text-sm font-black">{option.label}</span>
                <span className={`mt-2 block text-xs leading-5 ${quant === option.value ? 'text-red-100' : 'text-stone-500'}`}>
                  {option.note}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="border border-stone-200 bg-white p-4">
          <legend className="px-1 text-sm font-bold text-stone-950">Context length</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { value: 'normal', title: 'Normal chats', note: 'Short prompts, everyday use, lower memory overhead.' },
              { value: 'long', title: 'Long documents', note: 'More room for files and context, more memory needed.' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setContextLevel(option.value as 'normal' | 'long')}
                className={`min-h-[5.5rem] border p-3 text-left ${
                  contextLevel === option.value
                    ? 'border-stone-950 bg-stone-950 text-white'
                    : 'border-stone-300 bg-neutral-50 text-stone-800 hover:border-stone-950'
                }`}
              >
                <span className="block text-sm font-black">{option.title}</span>
                <span className={`mt-2 block text-xs leading-5 ${contextLevel === option.value ? 'text-stone-200' : 'text-stone-500'}`}>
                  {option.note}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Model file</p>
            <p className="mt-2 font-serif text-3xl font-black text-stone-950">~{result.model.diskGb}GB</p>
            <p className="mt-2 text-xs leading-5 text-stone-600">Keep extra disk room for multiple downloads and updates.</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Minimum memory</p>
            <p className="mt-2 font-serif text-3xl font-black text-stone-950">~{result.requiredMemory}GB</p>
            <p className="mt-2 text-xs leading-5 text-stone-600">Includes estimated runtime and context overhead.</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Comfortable memory</p>
            <p className="mt-2 font-serif text-3xl font-black text-stone-950">~{result.comfortableMemory}GB</p>
            <p className="mt-2 text-xs leading-5 text-stone-600">Leaves room for the OS, browser, and local AI app.</p>
          </div>
        </div>
      </div>

      <aside className="h-fit border border-stone-900 bg-stone-950 p-5 text-white lg:sticky lg:top-24">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-200">Hardware target</p>
        <h2 className="mt-3 font-serif text-3xl font-black">{result.verdict}</h2>
        <div className="mt-5 space-y-4 border-t border-white/20 pt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">For {hardwareLabel(hardwareType)}</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">
              Minimum: {result.hardware.minimum}. Comfortable: {result.hardware.comfortable}.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Selected target</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">
              {result.model.label} using {quantLabel(quant)} with {contextLevel === 'long' ? 'long-document' : 'normal'} context.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Runner</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">{runnerRecommendation(hardwareType)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-300">Practical note</p>
            <p className="mt-1 text-sm leading-6 text-stone-100">{result.hardware.note}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
