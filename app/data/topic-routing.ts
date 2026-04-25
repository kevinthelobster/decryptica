import type { Article } from './articles';

export type PillarSlug = 'ai' | 'crypto' | 'automation';

export interface SubpillarDefinition {
  slug: string;
  name: string;
  description: string;
}

const AI_SUBPILLARS: SubpillarDefinition[] = [
  {
    slug: 'llms',
    name: 'LLMs',
    description: 'Model capabilities, prompt strategy, and production evaluation patterns.',
  },
  {
    slug: 'agents',
    name: 'Agents',
    description: 'Autonomous workflows, orchestration, and human-in-the-loop control loops.',
  },
  {
    slug: 'local',
    name: 'Local AI',
    description: 'Local and edge AI deployment, privacy tradeoffs, and self-hosted model operations.',
  },
  {
    slug: 'use-cases',
    name: 'Use Cases',
    description: 'Applied AI workflows for support, operations, marketing, and internal team execution.',
  },
  {
    slug: 'tooling',
    name: 'Tooling',
    description: 'AI stack selection, integration, and deployment operations.',
  },
];

const CRYPTO_SUBPILLARS: SubpillarDefinition[] = [
  {
    slug: 'defi',
    name: 'DeFi',
    description: 'Protocols, market structure, and risk-aware DeFi operations.',
  },
  {
    slug: 'wallets',
    name: 'Wallets',
    description: 'Custody, wallet architecture, and secure operational practices.',
  },
  {
    slug: 'trading',
    name: 'Trading',
    description: 'Execution frameworks, market signals, and portfolio positioning.',
  },
];

const AUTOMATION_SUBPILLARS: SubpillarDefinition[] = [
  {
    slug: 'workflows',
    name: 'Workflows',
    description: 'Process design, routing logic, and operational handoff patterns.',
  },
  {
    slug: 'infrastructure',
    name: 'Infrastructure',
    description: 'Runtime architecture, queues, reliability, and scaling constraints.',
  },
  {
    slug: 'tooling',
    name: 'Tooling',
    description: 'Platform selection, integration depth, and implementation tradeoffs.',
  },
];

export const SUBPILLARS_BY_PILLAR: Record<PillarSlug, SubpillarDefinition[]> = {
  ai: AI_SUBPILLARS,
  crypto: CRYPTO_SUBPILLARS,
  automation: AUTOMATION_SUBPILLARS,
};

const SUBPILLAR_KEYWORDS: Record<PillarSlug, Record<string, RegExp[]>> = {
  ai: {
    llms: [/llm/i, /gpt/i, /claude/i, /prompt/i, /rag/i, /chatbot/i, /writing/i],
    agents: [/agent/i, /autonom/i, /copilot/i, /assistant/i, /orchestrat/i],
    local: [/local/i, /edge ai/i, /edge-ai/i, /self-host/i, /ollama/i, /on-device/i, /on-prem/i, /private ai/i, /llama 3 locally/i],
    'use-cases': [/workflow/i, /use-case/i, /operations/i, /support/i, /customer-support/i, /marketing/i, /sales/i],
    tooling: [/tool/i, /stack/i, /sdk/i, /framework/i, /platform/i, /integration/i],
  },
  crypto: {
    defi: [/defi/i, /dex/i, /lending/i, /staking/i, /yield/i, /amm/i],
    wallets: [/wallet/i, /custody/i, /seed/i, /ledger/i, /trezor/i, /key/i],
    trading: [/trading/i, /market/i, /price/i, /inflow/i, /analysis/i, /etf/i, /signal/i],
  },
  automation: {
    workflows: [/workflow/i, /zapier/i, /make/i, /n8n/i, /process/i, /routing/i],
    infrastructure: [/kafka/i, /pubsub/i, /queue/i, /event/i, /infra/i, /temporal/i, /architecture/i],
    tooling: [/tool/i, /platform/i, /comparison/i, /best/i, /software/i, /integrat/i],
  },
};

const DEFAULT_SUBPILLAR: Record<PillarSlug, string> = {
  ai: 'use-cases',
  crypto: 'trading',
  automation: 'workflows',
};

export function getSubpillarsForPillar(pillar: PillarSlug): SubpillarDefinition[] {
  return SUBPILLARS_BY_PILLAR[pillar] ?? [];
}

export function getSubpillarBySlug(pillar: PillarSlug, subpillar: string): SubpillarDefinition | undefined {
  return getSubpillarsForPillar(pillar).find((item) => item.slug === subpillar);
}

export function getSubpillarPath(pillar: PillarSlug, subpillar: string): string {
  return `/topic/${pillar}/${subpillar}`;
}

export function inferSubpillarFromArticle(article: Pick<Article, 'category' | 'slug' | 'title' | 'tags' | 'targetSubpillar'>): string {
  const pillar = article.category as PillarSlug;

  if (article.targetSubpillar && getSubpillarBySlug(pillar, article.targetSubpillar)) {
    return article.targetSubpillar;
  }

  const rules = SUBPILLAR_KEYWORDS[pillar];
  const haystack = `${article.slug} ${article.title} ${(article.tags || []).join(' ')}`;

  const orderedSubpillars = getSubpillarsForPillar(pillar).map((item) => item.slug);
  for (const subpillar of orderedSubpillars) {
    const patterns = rules[subpillar] ?? [];
    if (patterns.some((pattern) => pattern.test(haystack))) {
      return subpillar;
    }
  }

  return DEFAULT_SUBPILLAR[pillar];
}
