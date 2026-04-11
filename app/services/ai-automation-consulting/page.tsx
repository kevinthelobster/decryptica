import type { Metadata } from 'next';
import TrackedLink from '@/app/components/TrackedLink';
import RoiEstimator from './RoiEstimator';
import DestinationConfidenceLayer from '@/app/components/DestinationConfidenceLayer';

export const metadata: Metadata = {
  title: 'AI Automation ROI Calculator + Workflow Strategy',
  description:
    'Estimate workflow automation savings, payback period, and annual ROI. Get a practical AI automation plan tailored to your team.',
  keywords: [
    'ai automation roi',
    'automation roi calculator',
    'workflow automation roi',
    'business process automation',
    'automation consulting',
  ],
  alternates: {
    canonical: 'https://decryptica.com/services/ai-automation-consulting',
  },
  openGraph: {
    title: 'AI Automation ROI Calculator + Workflow Strategy',
    description:
      'Estimate workflow automation savings, payback period, and annual ROI. Get a practical AI automation plan tailored to your team.',
    type: 'website',
    url: 'https://decryptica.com/services/ai-automation-consulting',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How quickly can we see ROI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most teams see measurable time savings within the first month after launch.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do we need to replace our existing tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The plan prioritizes integration with your current stack first.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if our workflows are messy right now?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'That is common. Discovery is designed to map and simplify before automation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this secure for sensitive operational data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Implementations follow least-privilege access and environment-specific controls.',
      },
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Automation ROI Consulting',
  serviceType: 'Business process automation consulting',
  provider: {
    '@type': 'Organization',
    name: 'Decryptica',
    url: 'https://decryptica.com',
  },
  description:
    'Workflow automation assessment and implementation planning focused on measurable ROI, payback period, and operational risk reduction.',
  areaServed: 'Global',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://decryptica.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Services',
      item: 'https://decryptica.com/services/ai-automation-consulting',
    },
  ],
};

const caseStudies = [
  {
    title: 'Ops handoff stabilization',
    before: 'Fragmented handoffs and long queue times across shared inbox workflows.',
    after: 'Automated routing and SLA-aware triage with weekly error reporting.',
    outcome: '42% cycle-time reduction and 31% fewer rework incidents in 6 weeks.',
  },
  {
    title: 'Revenue ops lead response',
    before: 'Manual qualification delayed high-intent lead response and follow-up.',
    after: 'Automated qualification and owner assignment with CRM sync guardrails.',
    outcome: '2.1x faster response times and 24% increase in qualified meetings.',
  },
  {
    title: 'Finance reconciliation',
    before: 'Spreadsheet-heavy reconciliation with frequent end-of-month exceptions.',
    after: 'Structured ingestion, validation checks, and exception queues.',
    outcome: '29 hours/month returned to finance team and 18% fewer correction loops.',
  },
];

const packages = [
  {
    name: 'Starter',
    summary: 'Focused automation for 1-2 workflows with fast validation.',
  },
  {
    name: 'Growth',
    summary: 'Multi-workflow rollout with analytics and iteration loop.',
  },
  {
    name: 'Scale',
    summary: 'Cross-team orchestration, governance, and continuous optimization.',
  },
];

const faqs = [
  {
    question: 'Who owns automation after launch?',
    answer: 'You keep ownership. We provide documentation, guardrails, and handoff support.',
  },
  {
    question: 'How much internal time will this require?',
    answer: 'Typically a small weekly commitment from one process owner and one stakeholder.',
  },
  {
    question: 'Can we start with one process?',
    answer: 'Yes. Starting with one high-impact process is usually the fastest path to proof.',
  },
  {
    question: 'What happens if ROI is lower than expected?',
    answer: 'We re-prioritize based on observed data and adjust the workflow roadmap.',
  },
];

export default function AIAutomationConsultingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-zinc-950">
        <section className="relative overflow-hidden border-b border-zinc-800/80">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-zinc-950 to-zinc-950" />
          <div className="absolute left-1/2 top-0 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20">
            <p className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              AI Automation ROI
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              See Your AI Automation ROI Before You Spend a Dollar
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-300">
              Estimate monthly savings, payback period, and annual ROI from your current workflows, then get a
              practical rollout plan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <TrackedLink
                href="#roi-calculator"
                className="btn-primary"
                eventType="cta_click"
                metadata={{ location: 'automation_roi_hero', cta: 'book_automation_audit' }}
              >
                Book Automation Audit
              </TrackedLink>
              <TrackedLink
                href="#proof"
                className="btn-secondary"
                eventType="cta_click"
                metadata={{ location: 'automation_roi_hero', cta: 'see_roi_case_studies' }}
              >
                See 3 ROI Case Studies
              </TrackedLink>
            </div>
            <p className="mt-6 max-w-3xl text-sm text-zinc-400">
              Trusted by operations and growth teams to reduce manual workload, rework, and process bottlenecks.
            </p>
          </div>
        </section>

        <DestinationConfidenceLayer pageType="consulting" />

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-3">
          <article className="card-elevated p-6">
            <h2 className="font-display text-xl font-semibold text-white">The hidden cost of staying manual</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>Manual handoffs drain high-value team time every week.</li>
              <li>Human error and rework create avoidable operational risk.</li>
              <li>Slow workflows delay revenue and weaken customer experience.</li>
            </ul>
            <p className="mt-4 text-sm text-zinc-400">
              Use the ROI calculator below to estimate your recoverable time and cost.
            </p>
          </article>
          <article className="card-elevated p-6 lg:col-span-2">
            <h2 className="font-display text-xl font-semibold text-white">A practical 3-step path to ROI</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Discover</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Identify repetitive, high-friction workflows and baseline current cost.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Automate</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Deploy the smallest set of automation changes that produces fast payback.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Measure</p>
                <p className="mt-2 text-sm text-zinc-300">
                  Track time saved, error reduction, and financial impact month over month.
                </p>
              </div>
            </div>
          </article>
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-12">
          <RoiEstimator />
        </div>

        <section id="proof" className="mx-auto max-w-7xl px-6 py-10">
          <h2 className="font-display text-3xl font-bold text-white">Real teams, measurable gains</h2>
          <p className="mt-2 max-w-3xl text-zinc-300">
            Operators and founders choose this approach because it produces visible ROI without massive process
            disruption.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {caseStudies.map((study) => (
              <article key={study.title} className="card-elevated p-5">
                <h3 className="font-display text-lg font-semibold text-white">{study.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">Before: {study.before}</p>
                <p className="mt-2 text-sm text-zinc-400">After: {study.after}</p>
                <p className="mt-3 text-sm font-semibold text-emerald-300">{study.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <article className="card-elevated p-6">
              <h2 className="font-display text-2xl font-bold text-white">Choose the right implementation depth</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {packages.map((pkg) => (
                  <div key={pkg.name} className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">{pkg.name}</h3>
                    <p className="mt-2 text-sm text-zinc-300">{pkg.summary}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="card-elevated p-6">
              <h2 className="font-display text-2xl font-bold text-white">Is this a fit for your team?</h2>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li>Repeated manual workflows with clear process ownership.</li>
                <li>Near-term efficiency or throughput goals tied to measurable outcomes.</li>
                <li>Willingness to pilot one high-impact process before broad rollout.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <h2 className="font-display text-3xl font-bold text-white">FAQ</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="card-elevated p-5">
                <h3 className="font-display text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm text-zinc-300">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-10">
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-zinc-900 to-indigo-950/40 p-7 md:p-10">
            <h2 className="font-display text-3xl font-bold text-white">Ready to quantify your automation upside?</h2>
            <p className="mt-2 max-w-3xl text-zinc-300">
              Share a few details and we will send a practical ROI-backed automation plan.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <TrackedLink
                href="#roi-calculator"
                className="btn-primary"
                eventType="cta_click"
                metadata={{ location: 'automation_roi_footer', cta: 'request_automation_plan' }}
              >
                Get My Automation Plan
              </TrackedLink>
              <TrackedLink
                href="/contact"
                className="btn-secondary"
                eventType="cta_click"
                metadata={{ location: 'automation_roi_footer', cta: 'contact_fallback' }}
              >
                Contact Us
              </TrackedLink>
            </div>
            <div className="mt-7 rounded-2xl border border-zinc-700 bg-zinc-950/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Related resources</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-indigo-300">
                <TrackedLink
                  href="/blog/the-roi-of-business-automation-real-numbers"
                  eventType="cta_click"
                  metadata={{ location: 'automation_roi_internal_links', cta: 'roi_article' }}
                >
                  ROI methodology
                </TrackedLink>
                <TrackedLink
                  href="/blog/the-human-in-the-loop-problem-for-automation"
                  eventType="cta_click"
                  metadata={{ location: 'automation_roi_internal_links', cta: 'workflow_risk_article' }}
                >
                  Workflow risk guide
                </TrackedLink>
                <TrackedLink
                  href="/blog/n8n-workflow-automation"
                  eventType="cta_click"
                  metadata={{ location: 'automation_roi_internal_links', cta: 'implementation_patterns_article' }}
                >
                  Automation implementation patterns
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
