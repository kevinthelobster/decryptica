import type { Metadata } from 'next';
import Link from 'next/link';
import SubscribeForm from '../components/SubscribeForm';
import { getBreadcrumbSchema, jsonLdScript } from '../lib/schema';

export const metadata: Metadata = {
  title: 'Tools | Decryptica',
  description:
    'Free Decryptica tools for comparing AI costs, pressure-testing crypto infrastructure, and planning automation work.',
  alternates: {
    canonical: '/tools',
  },
};

const liveTools = [
  {
    title: 'AI Model Price Calculator',
    kicker: 'Live tool',
    href: '/tools/ai-price-calculator',
    description:
      'Compare current model pricing across major AI API providers before choosing a stack or estimating monthly spend.',
    bestFor: 'Model selection, budget planning, and vendor comparison',
  },
  {
    title: 'OpenClaw Prompt Library',
    kicker: 'Live library',
    href: '/prompts',
    description:
      'Browse copy-pasteable automations for research, monitoring, communication, coding, and memory workflows.',
    bestFor: 'Operators who want reusable automation patterns',
  },
  {
    title: 'Site Search',
    kicker: 'Live utility',
    href: '/search',
    description:
      'Search reports, prompts, and tools when you need a specific answer instead of browsing the full archive.',
    bestFor: 'Returning readers and fast research sessions',
  },
];

const plannedTools = [
  {
    title: 'Solana RPC Benchmark Checklist',
    description:
      'A guided checklist for testing latency, rate limits, websocket stability, and failover before buying RPC infrastructure.',
  },
  {
    title: 'Automation ROI Estimator',
    description:
      'A calculator for deciding whether an automation project saves enough time or revenue leakage to be worth building.',
  },
  {
    title: 'AI Workflow Risk Review',
    description:
      'A quick review template for spotting prompt injection, approval-gate, privacy, and external-action risks.',
  },
];

export default function ToolsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />

      <div className="bg-white text-stone-950">
        <section className="border-b border-stone-200">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Tools</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-7xl">
                  Practical tools for digital economy decisions
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Calculators, checklists, and searchable libraries built around the same questions
                  Decryptica covers in its reporting.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Current focus</p>
                <p className="mt-2 font-serif text-2xl font-black text-stone-950">AI costs, automation prompts, and infrastructure choices</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <div className="mb-5 border-b-2 border-stone-900 pb-2">
                <h2 className="font-serif text-3xl font-black text-stone-950">Use Now</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {liveTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="news-card group flex min-h-[18rem] flex-col p-5"
                  >
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                      {tool.kicker}
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                      {tool.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{tool.description}</p>
                    <p className="mt-auto border-t border-stone-200 pt-4 text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
                      {tool.bestFor}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="mt-10">
                <div className="mb-5 border-b-2 border-stone-900 pb-2">
                  <h2 className="font-serif text-3xl font-black text-stone-950">Coming Next</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {plannedTools.map((tool) => (
                    <article key={tool.title} className="border border-stone-200 bg-neutral-50 p-5">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-stone-500">
                        Planned
                      </p>
                      <h3 className="mt-3 font-serif text-xl font-black leading-tight text-stone-950">
                        {tool.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-stone-600">{tool.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <h2 className="font-serif text-2xl font-black text-stone-950">Tool Tracks</h2>
                <div className="mt-4 divide-y divide-stone-200">
                  <Link href="/topic/ai/tooling" className="flex items-center justify-between py-3 text-sm font-bold text-stone-800 hover:text-red-900">
                    <span>AI tooling</span>
                    <span aria-hidden="true">{'->'}</span>
                  </Link>
                  <Link href="/blog/solana-rpc-providers-compared" className="flex items-center justify-between py-3 text-sm font-bold text-stone-800 hover:text-red-900">
                    <span>Solana infrastructure</span>
                    <span aria-hidden="true">{'->'}</span>
                  </Link>
                  <Link href="/topic/automation/workflows" className="flex items-center justify-between py-3 text-sm font-bold text-stone-800 hover:text-red-900">
                    <span>Automation workflows</span>
                    <span aria-hidden="true">{'->'}</span>
                  </Link>
                </div>
              </div>

              <div className="border border-stone-950 bg-stone-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-300">Dispatch</p>
                <h2 className="mt-2 font-serif text-2xl font-black">Get tool updates</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  New calculators and checklists will land here first.
                </p>
                <div className="mt-5">
                  <SubscribeForm />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
