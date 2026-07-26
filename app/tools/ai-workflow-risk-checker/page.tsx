import type { Metadata } from 'next';
import Link from 'next/link';
import RiskChecker from './RiskChecker';
import LeadMagnetCapture from '../../components/LeadMagnetCapture';
import { getLeadMagnetBySlug } from '../../data/lead-magnets';
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'AI Workflow Risk Checker',
  description:
    'Review AI workflow risk across private data, external actions, prompt injection, approval gates, credentials, logging, rollback, and ownership.',
  alternates: { canonical: '/tools/ai-workflow-risk-checker' },
};

export default function AiWorkflowRiskCheckerPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'AI Workflow Risk Checker', path: '/tools/ai-workflow-risk-checker' },
  ]);
  const toolSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Workflow Risk Checker',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/tools/ai-workflow-risk-checker'),
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
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-red-800">AI governance</p>
            <div className="mt-3 grid gap-6 border-y border-stone-900 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">
                  AI Workflow Risk Checker
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Use this before an AI agent or workflow touches real systems. The goal is not paperwork. It is finding the one risk that can wreck the launch.
                </p>
              </div>
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Good fit</p>
                <p className="mt-2 font-serif text-2xl font-black text-stone-950">
                  Agents, copilots, customer ops, internal automations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10">
          <RiskChecker />
        </section>

        <section className="border-t border-stone-200 bg-neutral-50">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <h2 className="font-serif text-3xl font-black text-stone-950">Treat the score as a launch gate</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
                Any checked item can still be acceptable if it has a control: least-privilege credentials, approval gates, clear logs, rollback steps, and a named owner.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/services/ai-automation-consulting" className="inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-red-950">
                  Request a workflow audit
                </Link>
                <Link href="/topic/automation/workflows" className="inline-flex min-h-11 items-center justify-center border border-stone-950 px-4 text-sm font-bold uppercase tracking-[0.1em] text-stone-950 hover:bg-stone-950 hover:text-white">
                  Read workflow guides
                </Link>
              </div>
            </div>
            <LeadMagnetCapture
              offer={getLeadMagnetBySlug('ai-workflow-risk-register')}
              location="ai_workflow_risk_checker_tool"
              category="automation"
              compact
            />
          </div>
        </section>
      </main>
    </>
  );
}
