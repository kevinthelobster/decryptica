export type ToolCategory = 'ai' | 'crypto' | 'automation';

export type DecrypticaTool = {
  slug: string;
  title: string;
  shortTitle: string;
  kicker: string;
  href: string;
  category: ToolCategory;
  track: string;
  description: string;
  bestFor: string;
  articleMatch: string[];
  leadMagnetSlug: string;
};

export const tools: DecrypticaTool[] = [
  {
    slug: 'ai-price-calculator',
    title: 'AI Model Price Calculator',
    shortTitle: 'AI cost calculator',
    kicker: 'Live calculator',
    href: '/tools/ai-price-calculator',
    category: 'ai',
    track: 'AI costs',
    description:
      'Compare AI API model costs across major providers before choosing a stack or estimating monthly spend.',
    bestFor: 'Model selection, budget planning, and vendor comparison',
    articleMatch: ['ai', 'model', 'pricing', 'llm', 'token', 'api', 'cost', 'gpt', 'claude', 'gemini'],
    leadMagnetSlug: 'ai-model-pricing-sheet',
  },
  {
    slug: 'solana-rpc-benchmark',
    title: 'Solana RPC Benchmark Checker',
    shortTitle: 'RPC benchmark checker',
    kicker: 'Live checker',
    href: '/tools/solana-rpc-benchmark',
    category: 'crypto',
    track: 'Crypto infrastructure',
    description:
      'Score an RPC provider against latency, websocket, failover, rate-limit, indexing, and support criteria before buying.',
    bestFor: 'Trading bots, DeFi apps, infra buyers, and provider shortlists',
    articleMatch: ['solana', 'rpc', 'helius', 'quicknode', 'alchemy', 'triton', 'chainstack', 'latency', 'websocket'],
    leadMagnetSlug: 'solana-rpc-benchmark-checklist',
  },
  {
    slug: 'automation-roi-estimator',
    title: 'Automation ROI Estimator',
    shortTitle: 'Automation ROI estimator',
    kicker: 'Live calculator',
    href: '/tools/automation-roi-estimator',
    category: 'automation',
    track: 'Automation economics',
    description:
      'Estimate time savings, payback period, and whether a workflow is worth automating before scoping a build.',
    bestFor: 'Workflow prioritization, agency handoff, and internal ops planning',
    articleMatch: ['automation', 'workflow', 'zapier', 'make', 'n8n', 'roi', 'sop', 'operations', 'process'],
    leadMagnetSlug: 'automation-sop-template',
  },
  {
    slug: 'ai-workflow-risk-checker',
    title: 'AI Workflow Risk Checker',
    shortTitle: 'AI risk checker',
    kicker: 'Live checker',
    href: '/tools/ai-workflow-risk-checker',
    category: 'automation',
    track: 'AI governance',
    description:
      'Review prompt injection, private data, approval gates, external actions, logging, and rollback risk before launch.',
    bestFor: 'AI agents, customer workflows, internal copilots, and automation reviews',
    articleMatch: ['agent', 'risk', 'security', 'prompt-injection', 'approval', 'privacy', 'governance', 'ai-workflow'],
    leadMagnetSlug: 'ai-workflow-risk-register',
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug) || tools[0];
}

export function getToolsByCategory(category: string) {
  return tools.filter((tool) => tool.category === category);
}

export function getRecommendedTool(args: {
  category: string;
  title?: string;
  slug?: string;
  tags?: string[];
  primaryConversionHref?: string;
}) {
  const direct = args.primaryConversionHref?.match(/^\/tools\/([^/?#]+)/)?.[1];
  if (direct) return getToolBySlug(direct);

  const haystack = `${args.title || ''} ${args.slug || ''} ${(args.tags || []).join(' ')}`.toLowerCase();
  const scored = tools
    .map((tool) => ({
      tool,
      score:
        (tool.category === args.category ? 3 : 0) +
        tool.articleMatch.reduce((total, token) => total + (haystack.includes(token) ? 2 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].tool : tools.find((tool) => tool.category === args.category) || tools[0];
}
