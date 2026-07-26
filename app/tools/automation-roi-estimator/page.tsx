import type { Metadata } from 'next';
import Link from 'next/link';
import RoiTool from './RoiTool';
import LeadMagnetCapture from '../../components/LeadMagnetCapture';
import { getLeadMagnetBySlug } from '../../data/lead-magnets';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Automation ROI Estimator',
  description:
    'Estimate automation ROI, monthly savings, payback period, and first-year net value before scoping an automation project.',
  alternates: { canonical: '/tools/automation-roi-estimator' },
};

export default function AutomationRoiEstimatorPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'Automation ROI Estimator', path: '/tools/automation-roi-estimator' },
  ]);
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Automation ROI Estimator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/tools/automation-roi-estimator'),
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
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-red-800">Automation economics</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
                  Automation ROI Estimator
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Estimate whether a workflow is worth automating before you pay for software, hire an agency, or assign internal build time.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Decision rule</p>
                <p className="mt-2 font-serif text-2xl font-black text-stone-950">
                  Fast payback beats impressive demos.
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  If the math is weak, narrow the workflow before adding tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <RoiTool />
        </section>

        <section className="border-t border-stone-200 bg-neutral-50">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl font-black text-stone-950">Use this before the build brief</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
                The estimator is intentionally conservative. It counts partial automation, maintenance, and build cost so the result does not depend on best-case assumptions.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/services/ai-automation-consulting" className="inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-red-950">
                  Scope an audit
                </Link>
                <Link href="/topic/automation/workflows" className="inline-flex min-h-11 items-center justify-center border border-stone-950 px-4 text-sm font-bold uppercase tracking-[0.1em] text-stone-950 hover:bg-stone-950 hover:text-white">
                  Browse workflow guides
                </Link>
              </div>
            </div>
            <LeadMagnetCapture
              offer={getLeadMagnetBySlug('automation-sop-template')}
              location="automation_roi_tool"
              category="automation"
              compact
            />
          </div>
        </section>
      </main>
    </>
  );
}
