import type { Metadata } from 'next';
import Link from 'next/link';
import HardwareCalculator from './HardwareCalculator';
import LeadMagnetCapture from '../../components/LeadMagnetCapture';
import { getLeadMagnetBySlug } from '../../data/lead-magnets';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Local AI Hardware Calculator',
  description:
    'Enter your Mac or PC hardware to estimate which local AI model sizes should run comfortably, slowly, or not at all.',
  alternates: { canonical: '/tools/local-ai-hardware-calculator' },
};

export default function LocalAiHardwareCalculatorPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'Local AI Hardware Calculator', path: '/tools/local-ai-hardware-calculator' },
  ]);
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Local AI Hardware Calculator',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/tools/local-ai-hardware-calculator'),
    description: metadata.description,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(toolSchema)} />
      <main className="bg-white text-stone-950">
        <section className="border-b border-stone-200">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <Link href="/tools" className="text-sm font-bold text-red-800 hover:text-red-950">
              {'<-'} Tools Desk
            </Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-red-800">Local AI hardware</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
                  What local AI models can my computer run?
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Enter your Mac or PC specs and get a plain-English estimate of the model sizes that should feel smooth, usable, slow, or unrealistic.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Good first target</p>
                <p className="mt-2 font-serif text-2xl font-black text-stone-950">
                  Most modern 16GB laptops should start with an 8B Q4 model.
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Bigger can work, but speed and memory headroom matter more than the model name.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <HardwareCalculator />
        </section>

        <section className="border-t border-stone-200 bg-neutral-50">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl font-black text-stone-950">Use this before installing Ollama or LM Studio</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
                This calculator uses conservative rules of thumb for quantized local models. Actual speed depends on model architecture, context length, cooling, drivers, and the app you use to run inference.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/tools/local-ai-model-requirements" className="inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-red-950">
                  Check model requirements
                </Link>
                <Link href="/topic/ai/tooling" className="inline-flex min-h-11 items-center justify-center border border-stone-950 px-4 text-sm font-bold uppercase tracking-[0.1em] text-stone-950 hover:bg-stone-950 hover:text-white">
                  Browse AI tooling guides
                </Link>
              </div>
            </div>
            <LeadMagnetCapture
              offer={getLeadMagnetBySlug('ai-model-pricing-sheet')}
              location="local_ai_hardware_calculator"
              category="ai"
              compact
            />
          </div>
        </section>
      </main>
    </>
  );
}
