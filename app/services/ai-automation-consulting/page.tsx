import type { Metadata } from 'next';
import TrackedLink from '@/app/components/TrackedLink';
import RoiEstimator from './RoiEstimator';
import DestinationConfidenceLayer from '@/app/components/DestinationConfidenceLayer';

export const metadata: Metadata = {
  title: 'AI Automation Consulting | ROI, Workflow Design, and Implementation',
  description:
    'Practical AI automation consulting for teams that need measurable ROI, reliable workflows, and implementation support without buying another disconnected tool.',
  keywords: [
    'ai automation consulting',
    'ai automation roi',
    'automation roi calculator',
    'workflow automation consulting',
    'business process automation',
  ],
  alternates: {
    canonical: 'https://decryptica.com/services/ai-automation-consulting',
  },
  openGraph: {
    title: 'AI Automation Consulting | ROI, Workflow Design, and Implementation',
    description:
      'Estimate automation ROI, identify the right workflows, and turn AI experiments into reliable operational systems.',
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
        text: 'Most teams can see measurable time savings within the first month after a focused pilot launches.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do we need to replace our existing tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The consulting process starts with your current stack and only recommends new tools when the existing system cannot support the workflow safely.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if our workflows are messy right now?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Messy workflows are normal. The first step is mapping ownership, handoffs, exceptions, and failure points before anything gets automated.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this secure for sensitive operational data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Implementations are planned around least-privilege access, environment-specific secrets, human approval points, and audit-friendly workflow design.',
      },
    },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Automation Consulting',
  serviceType: 'Workflow automation consulting and implementation planning',
  provider: {
    '@type': 'Organization',
    name: 'Decryptica',
    url: 'https://decryptica.com',
  },
  description:
    'AI automation assessment, ROI modeling, workflow design, and implementation planning for teams that need practical operating leverage.',
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
      name: 'AI Automation Consulting',
      item: 'https://decryptica.com/services/ai-automation-consulting',
    },
  ],
};

const heroImage = {
  src: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1600&q=80',
  alt: 'A team working together around laptops in a modern office',
  credit: 'Photo by Christina @ wocintechchat.com on Unsplash',
};

const signals = [
  'Manual handoffs decide too much of the customer experience.',
  'AI tools are being tested, but nobody owns the operating system around them.',
  'Cost, security, and workflow failure handling are unclear before rollout.',
];

const phases = [
  {
    label: 'Map',
    title: 'Find the workflow worth automating first',
    text: 'Document the current path, owner decisions, exceptions, tool handoffs, and the real cost of keeping the process manual.',
  },
  {
    label: 'Model',
    title: 'Quantify savings before build work starts',
    text: 'Estimate time recovery, rework reduction, payback period, and the minimum implementation scope needed to prove ROI.',
  },
  {
    label: 'Build',
    title: 'Ship a small system that can be operated',
    text: 'Turn the workflow into a durable automation with approvals, logging, fallback paths, and a clear handoff for the team.',
  },
];

const caseStudies = [
  {
    title: 'Ops handoff stabilization',
    before: 'Fragmented handoffs and long queue times across shared inbox workflows.',
    after: 'Automated routing and SLA-aware triage with weekly error reporting.',
    outcome: '42% cycle-time reduction in 6 weeks',
  },
  {
    title: 'Revenue ops lead response',
    before: 'Manual qualification delayed high-intent lead response and follow-up.',
    after: 'Automated qualification and owner assignment with CRM sync guardrails.',
    outcome: '2.1x faster response times',
  },
  {
    title: 'Finance reconciliation',
    before: 'Spreadsheet-heavy reconciliation with frequent month-end exceptions.',
    after: 'Structured ingestion, validation checks, and exception queues.',
    outcome: '29 hours/month returned',
  },
];

const packages = [
  {
    name: 'Pilot',
    summary: 'One high-friction workflow, ROI model, implementation plan, and lightweight launch support.',
  },
  {
    name: 'Operating System',
    summary: 'Multi-workflow design, tool selection, approval paths, reporting, and process owner handoff.',
  },
  {
    name: 'Scale Support',
    summary: 'Cross-team workflow governance, measurement cadence, failure reviews, and backlog prioritization.',
  },
];

const faqs = [
  {
    question: 'Who owns automation after launch?',
    answer: 'Your team does. The work includes documentation, operating notes, and clear process ownership so the system does not depend on a vendor staying in the loop forever.',
  },
  {
    question: 'How much internal time does this require?',
    answer: 'Usually one process owner and one stakeholder for a short weekly review. The heavier lift is clarifying decisions, exceptions, and approval rules.',
  },
  {
    question: 'Can we start with one process?',
    answer: 'Yes. That is the preferred path. A focused pilot gives you proof, cost clarity, and fewer surprises than a broad automation program.',
  },
  {
    question: 'What happens if ROI is lower than expected?',
    answer: 'The roadmap changes. The goal is not to force automation everywhere; it is to identify the workflows where automation produces measurable leverage.',
  },
];

export default function AIAutomationConsultingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen overflow-x-hidden bg-white text-stone-950">
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-5">
            <div className="flex min-w-0 flex-col gap-2 border-y border-stone-900 py-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-stone-700 sm:flex-row sm:items-center sm:justify-between">
              <span>AI automation consulting</span>
              <span>ROI / workflow design / implementation</span>
              <span>Built for operators</span>
            </div>

            <div className="grid min-w-0 gap-8 py-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(19rem,0.88fr)] lg:items-end">
              <div className="min-w-0">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-800">
                  Implementation support
                </p>
                <h1 className="max-w-5xl break-words font-serif text-4xl font-black leading-[0.98] text-stone-950 sm:text-5xl md:text-7xl">
                  Turn messy workflows into measurable AI automation.
                </h1>
                <p className="mt-5 max-w-3xl break-words border-l-4 border-red-800 pl-4 text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
                  Decryptica helps teams pick the right automation opportunities, model the return, and ship systems
                  that can survive real operations.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <TrackedLink
                    href="#roi-calculator"
                    className="btn-primary"
                    eventType="cta_click"
                    metadata={{ location: 'automation_consulting_hero', cta: 'estimate_roi' }}
                  >
                    Estimate ROI
                  </TrackedLink>
                  <TrackedLink
                    href="#process"
                    className="btn-secondary"
                    eventType="cta_click"
                    metadata={{ location: 'automation_consulting_hero', cta: 'view_process' }}
                  >
                    View Process
                  </TrackedLink>
                </div>
              </div>

              <aside className="min-w-0 border-t border-stone-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <div className="overflow-hidden border border-stone-200 bg-white">
                  <img src={heroImage.src} alt={heroImage.alt} className="aspect-[4/3] w-full object-cover" />
                  <p className="border-t border-stone-200 px-3 py-2 text-xs text-stone-500">{heroImage.credit}</p>
                </div>
                <div className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
                  {signals.map((signal) => (
                    <p key={signal} className="py-3 text-sm font-medium leading-6 text-stone-700">
                      {signal}
                    </p>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <DestinationConfidenceLayer pageType="consulting" />

        <section id="process" className="border-b border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">How the work runs</p>
              <h2 className="mt-2 font-serif text-3xl font-black leading-tight text-stone-950 md:text-5xl">
                Start with the process, then choose the AI.
              </h2>
              <p className="mt-3 text-base leading-7 text-stone-700">
                The expensive mistake is buying tools before the workflow is clear. This engagement starts with the
                operating reality: who decides, where work stalls, what can fail, and what return would justify the build.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {phases.map((phase) => (
                <article key={phase.label} className="border border-stone-300 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-red-800">{phase.label}</p>
                  <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-stone-950">{phase.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{phase.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Right-fit engagement</p>
            <h2 className="mt-2 font-serif text-3xl font-black leading-tight text-stone-950 md:text-5xl">
              Practical consulting, not a generic AI pitch.
            </h2>
            <p className="mt-3 text-base leading-7 text-stone-700">
              The output is a prioritized automation plan with ROI math, implementation scope, ownership notes, and
              failure handling. If the numbers do not justify automation, that should be obvious before build time.
            </p>
          </div>
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <article key={pkg.name} className="border border-stone-300 bg-white p-5">
                <h3 className="font-serif text-2xl font-black text-stone-950">{pkg.name}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{pkg.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 pb-12">
          <RoiEstimator />
        </div>

        <section id="proof" className="border-y border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <div className="mb-6 flex min-w-0 flex-col gap-3 border-b-2 border-stone-900 pb-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800">Proof points</p>
                <h2 className="mt-2 font-serif text-3xl font-black text-stone-950">Real teams, measurable gains</h2>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-stone-700">
                These examples show the type of operational result this work targets: faster handoffs, fewer errors,
                clearer ownership, and a smaller manual workload.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {caseStudies.map((study) => (
                <article key={study.title} className="border border-stone-300 bg-white p-5">
                  <h3 className="font-serif text-2xl font-black leading-tight text-stone-950">{study.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">Before: {study.before}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">After: {study.after}</p>
                  <p className="mt-4 border-t border-stone-200 pt-3 text-sm font-black uppercase tracking-[0.08em] text-red-800">
                    {study.outcome}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12">
          <h2 className="border-b-2 border-stone-900 pb-2 font-serif text-3xl font-black text-stone-950">FAQ</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="border border-stone-300 bg-white p-5">
                <h3 className="font-serif text-xl font-black text-stone-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-stone-200 bg-stone-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Next step</p>
              <h2 className="mt-2 max-w-3xl font-serif text-3xl font-black leading-tight md:text-5xl">
                Quantify the upside before the build.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                Use the calculator, then send the workflow details needed for a practical automation plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <TrackedLink
                href="#roi-calculator"
                className="border border-white bg-white px-5 py-3 text-sm font-bold text-stone-950 hover:bg-stone-200"
                eventType="cta_click"
                metadata={{ location: 'automation_consulting_footer', cta: 'estimate_roi' }}
              >
                Estimate ROI
              </TrackedLink>
              <TrackedLink
                href="/contact"
                className="border border-stone-500 px-5 py-3 text-sm font-bold text-white hover:border-white"
                eventType="cta_click"
                metadata={{ location: 'automation_consulting_footer', cta: 'contact_fallback' }}
              >
                Contact
              </TrackedLink>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
