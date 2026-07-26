export type LeadMagnetCategory = 'ai' | 'crypto' | 'automation' | 'all';

export type LeadMagnet = {
  slug: string;
  title: string;
  category: LeadMagnetCategory;
  eyebrow: string;
  description: string;
  deliverable: string;
  cadence: string;
  ctaLabel: string;
  compactCtaLabel?: string;
  successMessage: string;
  bullets: string[];
  secondaryHref: string;
  secondaryLabel: string;
};

export const leadMagnets: LeadMagnet[] = [
  {
    slug: 'ai-model-pricing-sheet',
    title: 'AI Model Pricing Sheet',
    category: 'ai',
    eyebrow: 'AI cost desk',
    description:
      'A worksheet for comparing AI provider costs, hidden pricing drivers, model fit, and budget assumptions without relying on stale static prices.',
    deliverable: 'Provider cost worksheet plus budget notes',
    cadence: 'Updated when major pricing changes ship',
    ctaLabel: 'Send the pricing sheet',
    compactCtaLabel: 'Send sheet',
    successMessage: 'Pricing sheet queued. Check your inbox for the Decryptica cost desk note.',
    bullets: ['Cost-driver checklist', 'Provider notes', 'Budget worksheet'],
    secondaryHref: '/tools/ai-price-calculator',
    secondaryLabel: 'Use the calculator',
  },
  {
    slug: 'solana-rpc-benchmark-checklist',
    title: 'Solana RPC Benchmark Checklist',
    category: 'crypto',
    eyebrow: 'Infrastructure field note',
    description:
      'A pre-purchase checklist for testing latency, websocket behavior, failover, rate limits, and indexing fit before choosing an RPC provider.',
    deliverable: 'Benchmark checklist and acceptance criteria',
    cadence: 'Reviewed with Solana infrastructure coverage',
    ctaLabel: 'Send the RPC checklist',
    compactCtaLabel: 'Send checklist',
    successMessage: 'Checklist queued. Check your inbox for the Solana RPC benchmark note.',
    bullets: ['Latency tests', 'Failover prompts', 'Provider questions'],
    secondaryHref: '/blog/solana-rpc-providers-compared',
    secondaryLabel: 'Read the RPC comparison',
  },
  {
    slug: 'automation-sop-template',
    title: 'Automation SOP Template',
    category: 'automation',
    eyebrow: 'Operator template',
    description:
      'A practical SOP outline for documenting triggers, owners, exception paths, approvals, and rollback steps before a workflow becomes fragile.',
    deliverable: 'Editable SOP structure for automation rollouts',
    cadence: 'Maintained with automation implementation guides',
    ctaLabel: 'Send the SOP template',
    compactCtaLabel: 'Send template',
    successMessage: 'SOP template queued. Check your inbox for the automation rollout note.',
    bullets: ['Trigger map', 'Owner matrix', 'Rollback checklist'],
    secondaryHref: '/topic/automation/workflows',
    secondaryLabel: 'Browse workflow guides',
  },
  {
    slug: 'ai-workflow-risk-register',
    title: 'AI Workflow Risk Register',
    category: 'automation',
    eyebrow: 'Review packet',
    description:
      'A lightweight register for tracking prompt injection, privacy, external actions, approval gates, and monitoring gaps before an AI workflow goes live.',
    deliverable: 'Risk review worksheet for AI automations',
    cadence: 'Updated with AI automation risk coverage',
    ctaLabel: 'Send the risk register',
    compactCtaLabel: 'Send register',
    successMessage: 'Risk register queued. Check your inbox for the AI workflow review packet.',
    bullets: ['Approval gates', 'Data exposure checks', 'Monitoring owners'],
    secondaryHref: '/services/ai-automation-consulting',
    secondaryLabel: 'Run an automation audit',
  },
];

export function getLeadMagnetBySlug(slug: string): LeadMagnet {
  return leadMagnets.find((offer) => offer.slug === slug) || leadMagnets[0];
}

export function getLeadMagnetForCategory(category: string): LeadMagnet {
  if (category === 'crypto') return getLeadMagnetBySlug('solana-rpc-benchmark-checklist');
  if (category === 'automation') return getLeadMagnetBySlug('automation-sop-template');
  return getLeadMagnetBySlug('ai-model-pricing-sheet');
}
