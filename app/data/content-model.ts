/**
 * Decryptica Content Model — TypeScript Interfaces
 * Defines all content types, enums, and type guards for the CMS.
 *
 * Part of SEO_ARCHITECTURE.md implementation (Phase 1)
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export type TopicSlug = 'crypto' | 'ai' | 'automation';

export type ContentFormat =
  | 'review'
  | 'comparison'
  | 'tutorial'
  | 'explainer'
  | 'news'
  | 'listicle'
  | 'guide';

// ─── Core Content Types ──────────────────────────────────────────────────────

export interface FAQ {
  question: string;
  answer: string;
  order?: number;
}

export interface Article {
  // Identity
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;

  // Taxonomy
  category: TopicSlug;
  tags?: string[];
  format?: ContentFormat; // Optional: determines article template/structure

  // Authorship
  author?: string;
  authorId?: string;

  // Publishing
  status?: ArticleStatus; // Optional for backward compat; defaults to 'published'
  date: string;           // ISO 8601: YYYY-MM-DD
  lastUpdated?: string;    // ISO 8601: YYYY-MM-DD
  readTime: string;        // e.g. "11 min"

  // Computed
  wordCount?: number;
  faqs?: FAQ[];

  // SEO
  primaryKeyword?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  featuredImage?: string;
  affiliateLinks?: string[];

  // Internal
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  slug: TopicSlug;
  name: string;
  description: string;
  icon: string;
  color?: string;
  parentSlug?: string;
  articleCount?: number; // Computed
}

export interface Author {
  id: string;
  name: string;
  role: string;           // "Editor", "Contributor", "Staff Writer"
  bio: string;
  avatar: string;
  twitter?: string;
  isOrg: boolean;         // True for Decryptica (org-level authorship)
}

export interface Tag {
  slug: string;
  name: string;
  count?: number;         // Computed
}

// ─── Sub-Topic Taxonomy (Hierarchical) ──────────────────────────────────────

export interface SubTopic {
  slug: string;
  name: string;
  parent: TopicSlug;
  description: string;
  articleCount?: number;  // Computed
}

// ─── Content Format Templates ────────────────────────────────────────────────

export interface ContentTemplate {
  type: ContentFormat;
  label: string;
  description: string;
  minWords: number;
  maxWords: number;
  recommendedFAQs: number;
  sections: string[];     // Expected H2 sections
}

// ─── Validation Result ────────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isArticle(obj: unknown): obj is Article {
  if (!obj || typeof obj !== 'object') return false;
  const a = obj as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.slug === 'string' &&
    typeof a.title === 'string' &&
    typeof a.excerpt === 'string' &&
    typeof a.content === 'string' &&
    typeof a.category === 'string' &&
    Array.isArray(a.tags) &&
    typeof a.status === 'string' &&
    typeof a.date === 'string' &&
    typeof a.readTime === 'string'
  );
}

export function isTopicSlug(value: unknown): value is TopicSlug {
  return value === 'crypto' || value === 'ai' || value === 'automation';
}

export function isArticleStatus(value: unknown): value is ArticleStatus {
  return (
    value === 'draft' ||
    value === 'in_review' ||
    value === 'published' ||
    value === 'archived'
  );
}

export function isContentFormat(value: unknown): value is ContentFormat {
  return (
    value === 'review' ||
    value === 'comparison' ||
    value === 'tutorial' ||
    value === 'explainer' ||
    value === 'news' ||
    value === 'listicle' ||
    value === 'guide'
  );
}

// ─── Factory Helpers ─────────────────────────────────────────────────────────

export function createArticleId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75);
}

export function estimateWordCount(content: string): number {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~\[\]]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function estimateReadTime(wordCount: number): string {
  const wordsPerMinute = 225;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
}

export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ─── Content Templates Registry ──────────────────────────────────────────────

export const CONTENT_TEMPLATES: Record<ContentFormat, ContentTemplate> = {
  comparison: {
    type: 'comparison',
    label: 'Comparison',
    description: 'Side-by-side comparison of two or more tools/products',
    minWords: 1800,
    maxWords: 2500,
    recommendedFAQs: 4,
    sections: ['Introduction', 'Quick Comparison', 'Product A Deep Dive', 'Product B Deep Dive', 'Pros & Cons', 'Our Recommendation', 'Related Articles'],
  },
  tutorial: {
    type: 'tutorial',
    label: 'Tutorial',
    description: 'Step-by-step how-to guide with actionable instructions',
    minWords: 1500,
    maxWords: 2500,
    recommendedFAQs: 3,
    sections: ['Introduction', 'Prerequisites', 'Step 1', 'Step 2', 'Step 3', 'Common Mistakes', 'Next Steps'],
  },
  explainer: {
    type: 'explainer',
    label: 'Explainer',
    description: 'Concept definition and conceptual overview',
    minWords: 1200,
    maxWords: 1800,
    recommendedFAQs: 4,
    sections: ['Introduction', 'What Is X', 'How It Works', 'Why It Matters', 'FAQ'],
  },
  review: {
    type: 'review',
    label: 'Review',
    description: 'In-depth product review with pros/cons',
    minWords: 2000,
    maxWords: 3000,
    recommendedFAQs: 5,
    sections: ['Introduction', 'Key Features', 'Pros', 'Cons', 'Pricing', 'Our Verdict', 'Alternatives'],
  },
  news: {
    type: 'news',
    label: 'News',
    description: 'Current event analysis with expert commentary',
    minWords: 800,
    maxWords: 1200,
    recommendedFAQs: 2,
    sections: ['What Happened', 'Why It Matters', 'What It Means For You'],
  },
  listicle: {
    type: 'listicle',
    label: 'Listicle',
    description: 'Numbered roundup of tools, tips, or resources',
    minWords: 1500,
    maxWords: 2500,
    recommendedFAQs: 3,
    sections: ['Introduction', '#1', '#2', '#3', '#4', '#5', 'Conclusion'],
  },
  guide: {
    type: 'guide',
    label: 'Guide',
    description: 'Comprehensive pillar content for top-of-funnel authority',
    minWords: 3000,
    maxWords: 5000,
    recommendedFAQs: 6,
    sections: ['Introduction', 'Getting Started', 'Core Concepts', 'Advanced Strategies', 'Common Pitfalls', 'FAQ', 'Final Thoughts'],
  },
};

// ─── Topic Registry ────────────────────────────────────────────────────────────

export const TOPICS: Topic[] = [
  {
    slug: 'crypto',
    name: 'Crypto & DeFi',
    description: 'Blockchain technology, decentralized finance, and the evolving crypto landscape.',
    icon: '₿',
    color: '#f7931a',
  },
  {
    slug: 'ai',
    name: 'Artificial Intelligence',
    description: 'Machine learning, AI agents, and the latest in artificial intelligence.',
    icon: '🤖',
    color: '#6366f1',
  },
  {
    slug: 'automation',
    name: 'Automation',
    description: 'Workflow automation, productivity tools, and scripting solutions.',
    icon: '⚡',
    color: '#22c55e',
  },
];

// ─── Sub-Topics Registry ─────────────────────────────────────────────────────

export const SUB_TOPICS: SubTopic[] = [
  // Crypto sub-topics
  { slug: 'defi', name: 'DeFi', parent: 'crypto', description: 'Decentralized finance protocols and platforms' },
  { slug: 'nfts', name: 'NFTs', parent: 'crypto', description: 'Non-fungible tokens, marketplaces, and digital collectibles' },
  { slug: 'wallets', name: 'Wallets', parent: 'crypto', description: 'Crypto wallets, custody solutions, and key management' },
  { slug: 'trading', name: 'Trading', parent: 'crypto', description: 'Crypto trading strategies, bots, and technical analysis' },
  { slug: 'protocols', name: 'Protocols', parent: 'crypto', description: 'Blockchain protocols, L2 solutions, and infrastructure' },

  // AI sub-topics
  { slug: 'llms', name: 'LLMs', parent: 'ai', description: 'Large language models and their applications' },
  { slug: 'tools', name: 'AI Tools', parent: 'ai', description: 'AI-powered tools and software products' },
  { slug: 'agents', name: 'AI Agents', parent: 'ai', description: 'Autonomous AI agents and multi-agent systems' },
  { slug: 'automation-ai', name: 'AI Automation', parent: 'ai', description: 'AI-driven automation and prompt engineering' },
  { slug: 'research', name: 'Research', parent: 'ai', description: 'AI research, papers, and academic developments' },

  // Automation sub-topics
  { slug: 'tools-auto', name: 'Automation Tools', parent: 'automation', description: 'Zapier, Make, n8n, and workflow automation platforms' },
  { slug: 'scripting', name: 'Scripting', parent: 'automation', description: 'Python, JavaScript, and bash scripting' },
  { slug: 'workflows', name: 'Workflows', parent: 'automation', description: 'CRM, marketing, and operations automation workflows' },
  { slug: 'infrastructure', name: 'Infrastructure', parent: 'automation', description: 'Webhooks, APIs, queues, and integration patterns' },
];

// ─── Author Registry ──────────────────────────────────────────────────────────

export const AUTHORS: Author[] = [
  {
    id: 'decryptica-org',
    name: 'Decryptica',
    role: 'Editorial',
    bio: 'Decryptica is an independent technical publication covering AI, Crypto, and Automation.',
    avatar: '/avatars/decryptica.png',
    twitter: 'decryptica',
    isOrg: true,
  },
];

// ─── Canonical Topic Mapping ──────────────────────────────────────────────────

export const TOPIC_SLUGS: TopicSlug[] = ['crypto', 'ai', 'automation'];

export const TOPIC_BY_SLUG: Record<TopicSlug, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t])
) as Record<TopicSlug, Topic>;

export const SUB_TOPICS_BY_PARENT: Record<TopicSlug, SubTopic[]> = Object.fromEntries(
  TOPIC_SLUGS.map((slug) => [
    slug,
    SUB_TOPICS.filter((st) => st.parent === slug),
  ])
) as Record<TopicSlug, SubTopic[]>;

// ─── Status Transition Rules ──────────────────────────────────────────────────

export const STATUS_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['in_review'],
  in_review: ['draft', 'published'],
  published: ['archived'],
  archived: ['draft'],
};

export function canTransitionTo(current: ArticleStatus, next: ArticleStatus): boolean {
  return STATUS_TRANSITIONS[current].includes(next);
}

// ─── Export all articles (re-export from articles.ts for type co-location) ──
// Note: Import actual articles from './articles' in implementation
