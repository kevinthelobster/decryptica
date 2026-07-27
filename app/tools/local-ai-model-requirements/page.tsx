import type { Metadata } from 'next';
import Link from 'next/link';
import RequirementsCalculator from './RequirementsCalculator';
import LeadMagnetCapture from '../../components/LeadMagnetCapture';
import { getLeadMagnetBySlug } from '../../data/lead-magnets';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Local AI Model Requirements Calculator',
  description:
    'Choose a local AI model size and see the RAM, VRAM, storage, and machine tier you should have before running it.',
  alternates: { canonical: '/tools/local-ai-model-requirements' },
};

export default function LocalAiModelRequirementsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'Local AI Model Requirements Calculator', path: '/tools/local-ai-model-requirements' },
  ]);
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Local AI Model Requirements Calculator',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/tools/local-ai-model-requirements'),
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
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-red-800">Local model requirements</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
                  What hardware do I need to run this local AI model?
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Pick a model size, quantization level, and machine type to estimate the RAM, VRAM, and storage needed before buying hardware or downloading a giant model file.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Buyer rule</p>
                <p className="mt-2 font-serif text-2xl font-black text-stone-950">
                  Buy for the model class, not the brand name.
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  A 70B Q4 model and an 8B Q4 model live in completely different hardware worlds.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <RequirementsCalculator />
        </section>

        <section className="border-t border-stone-200 bg-neutral-50">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl font-black text-stone-950">Use this before buying a machine for local AI</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
                The estimate is deliberately plain-English. Model architecture, context length, quantization quality, and runner support can change the exact number, but these thresholds are useful for avoiding underpowered purchases.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/tools/local-ai-hardware-calculator" className="inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-red-950">
                  Check your current machine
                </Link>
                <Link href="/tools/ai-price-calculator" className="inline-flex min-h-11 items-center justify-center border border-stone-950 px-4 text-sm font-bold uppercase tracking-[0.1em] text-stone-950 hover:bg-stone-950 hover:text-white">
                  Compare API costs
                </Link>
              </div>
            </div>
            <LeadMagnetCapture
              offer={getLeadMagnetBySlug('ai-model-pricing-sheet')}
              location="local_ai_model_requirements"
              category="ai"
              compact
            />
          </div>
        </section>
      </main>
    </>
  );
}
