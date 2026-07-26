import type { Metadata } from 'next';
import Link from 'next/link';
import BenchmarkChecker from './BenchmarkChecker';
import LeadMagnetCapture from '../../components/LeadMagnetCapture';
import { getLeadMagnetBySlug } from '../../data/lead-magnets';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Solana RPC Benchmark Checker',
  description:
    'Score Solana RPC providers against latency, websocket stability, failover, rate limits, indexing fit, support, and cost predictability.',
  alternates: { canonical: '/tools/solana-rpc-benchmark' },
};

export default function SolanaRpcBenchmarkPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'Solana RPC Benchmark Checker', path: '/tools/solana-rpc-benchmark' },
  ]);
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Solana RPC Benchmark Checker',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/tools/solana-rpc-benchmark'),
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
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-red-800">Crypto infrastructure</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
                  Solana RPC Benchmark Checker
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Use this before buying RPC infrastructure. Score the provider on the operational criteria that matter once real users, bots, or dashboards hit the endpoint.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Best paired with</p>
                <Link href="/blog/solana-rpc-providers-compared" className="mt-2 block font-serif text-2xl font-black text-stone-950 hover:text-red-900">
                  Solana RPC Providers Compared
                </Link>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Read the buyer guide, then use this checker to pressure-test your shortlist.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <BenchmarkChecker />
        </section>

        <section className="border-t border-stone-200 bg-neutral-50">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl font-black text-stone-950">How to use the score</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
                Do not treat this as a lab benchmark. Treat it as a purchase screen. A provider can have great marketing and still fail if websocket behavior, failover, rate limits, or archive coverage do not match your workload.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {['Run the same test during peak traffic.', 'Ask support how incidents are escalated.', 'Compare price against retries, not just requests.'].map((item) => (
                  <div key={item} className="border border-stone-200 bg-white p-4 text-sm font-semibold leading-6 text-stone-800">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <LeadMagnetCapture
              offer={getLeadMagnetBySlug('solana-rpc-benchmark-checklist')}
              location="solana_rpc_benchmark_tool"
              category="crypto"
              compact
            />
          </div>
        </section>
      </main>
    </>
  );
}
