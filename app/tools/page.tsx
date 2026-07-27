import type { Metadata } from 'next';
import Link from 'next/link';
import LeadMagnetCapture from '../components/LeadMagnetCapture';
import { getLeadMagnetBySlug, leadMagnets } from '../data/lead-magnets';
import { tools } from '../data/tools';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../lib/schema';

export const metadata: Metadata = {
  title: 'Tools Desk',
  description:
    'Free Decryptica tools, calculators, checklists, and research packets for comparing AI costs, pressure-testing infrastructure, and planning automation work.',
  alternates: {
    canonical: '/tools',
  },
};

const liveTools = [
  ...tools,
  {
    title: 'OpenClaw Prompt Library',
    kicker: 'Live library',
    href: '/prompts',
    track: 'Reusable workflows',
    description:
      'Browse copy-pasteable automations for research, monitoring, communication, coding, and memory workflows.',
    bestFor: 'Operators who want reusable automation patterns',
  },
  {
    title: 'Site Search',
    kicker: 'Live utility',
    href: '/search',
    track: 'Archive navigation',
    description:
      'Search reports, prompts, and tools when you need a specific answer instead of browsing the full archive.',
    bestFor: 'Returning readers and fast research sessions',
  },
];

const deskTracks = [
  {
    title: 'Compare the stack',
    description: 'Use calculators and buyer guides before choosing AI models, providers, or automation platforms.',
    href: '/topic/ai/tooling',
    label: 'AI tooling',
  },
  {
    title: 'Size local AI hardware',
    description: 'Check what your current machine can run, or what machine you need for a specific local model class.',
    href: '/tools/local-ai-hardware-calculator',
    label: 'Local AI',
  },
  {
    title: 'Check infrastructure risk',
    description: 'Pair crypto infrastructure reporting with pre-purchase checklists and benchmark criteria.',
    href: '/blog/solana-rpc-providers-compared',
    label: 'Crypto infrastructure',
  },
  {
    title: 'Plan the operating model',
    description: 'Move from article research into SOPs, risk registers, and rollout decisions.',
    href: '/topic/automation/workflows',
    label: 'Automation workflows',
  },
];

export default function ToolsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
  ]);
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Decryptica Tools Desk',
    description:
      'Free calculators, checklists, search utilities, and research packets from the Decryptica digital economy desk.',
    url: absoluteUrl('/tools'),
    isPartOf: { '@id': `${absoluteUrl()}/#website` },
    hasPart: liveTools.map((tool) => ({
      '@type': 'WebPage',
      name: tool.title,
      url: absoluteUrl(tool.href),
      description: tool.description,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(collectionSchema)} />

      <div className="bg-white text-stone-950">
        <section className="border-b border-stone-200">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Tools Desk</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-7xl">
                  Practical tools worth returning to
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Calculators, checklists, search utilities, and research packets built around the same
                  AI, crypto, and automation decisions Decryptica covers in its reporting.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Reader use case</p>
                <p className="mt-2 font-serif text-2xl font-black text-stone-950">
                  Come back when a report turns into a budget, checklist, or rollout decision.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-stone-200 pt-4 text-center">
                  <div>
                    <p className="font-serif text-2xl font-black text-stone-950">{liveTools.length}</p>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-stone-500">Live</p>
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-black text-stone-950">{tools.length}</p>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-stone-500">Tools</p>
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-black text-stone-950">{leadMagnets.length}</p>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-stone-500">Packets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-5 py-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {deskTracks.map((track) => (
                <Link key={track.title} href={track.href} className="group border border-stone-200 bg-white p-4 hover:border-red-800">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                    {track.label}
                  </p>
                  <h2 className="mt-2 font-serif text-xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                    {track.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{track.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <div className="mb-5 flex flex-col gap-2 border-b-2 border-stone-900 pb-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Live tools</p>
                  <h2 className="font-serif text-3xl font-black text-stone-950">Use Now</h2>
                </div>
                <p className="max-w-lg text-sm leading-6 text-stone-600">
                  These are working destinations, not gated placeholders. Use them alongside articles, saved guides, and packets.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {liveTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="news-card group flex min-h-[21rem] flex-col p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                        {tool.kicker}
                      </p>
                      <p className="border border-stone-200 bg-neutral-50 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-stone-500">
                        {tool.track}
                      </p>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                      {tool.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{tool.description}</p>
                    <div className="mt-auto border-t border-stone-200 pt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
                        {tool.bestFor}
                      </p>
                      <p className="mt-3 text-sm font-bold text-red-800 group-hover:text-red-950">
                        {tool.href.startsWith('/tools/') ? 'Open tool' : 'Open resource'} {'->'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 grid gap-3 border border-stone-200 bg-neutral-50 p-5 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Returning reader path</p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Start with search if you remember the problem, use the calculator when numbers matter, then save or download the packet that matches the decision.
                  </p>
                </div>
                <Link
                  href="/search"
                  className="inline-flex min-h-11 items-center justify-center border border-stone-950 bg-white px-4 text-sm font-bold uppercase tracking-[0.1em] text-stone-950 hover:bg-stone-950 hover:text-white"
                >
                  Search desk
                </Link>
              </div>

              <div className="mt-10">
                <div className="mb-5 border-b-2 border-stone-900 pb-2">
                  <h2 className="font-serif text-3xl font-black text-stone-950">Research Packets</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {leadMagnets.map((offer) => (
                    <LeadMagnetCapture
                      key={offer.slug}
                      offer={offer}
                      location="tools_research_packets"
                      category={offer.category}
                      compact
                    />
                  ))}
                </div>
              </div>

              <div className="mt-10 border border-stone-900 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Growth loop</p>
                <h2 className="mt-2 font-serif text-3xl font-black text-stone-950">Articles now route into tools.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
                  Relevant reports point readers into the calculator, checker, or packet that matches the article topic. That turns one-time search traffic into repeat-use workflows.
                </p>
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

              <div className="border border-stone-900 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Editorial standard</p>
                <h2 className="mt-2 font-serif text-2xl font-black text-stone-950">Tools follow the coverage.</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  Decryptica adds tools where repeat reader questions show up in reporting: pricing math,
                  infrastructure checks, workflow planning, and risk review.
                </p>
              </div>

              <LeadMagnetCapture
                offer={getLeadMagnetBySlug('ai-workflow-risk-register')}
                location="tools_sidebar_risk_register"
                category="automation"
                compact
                dark
              />
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
