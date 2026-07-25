import type { Metadata } from 'next';
import { articles } from '../data/articles';
import promptsData from '../../data/prompts/prompts.json';
import SearchClient, { type SearchResult } from './SearchClient';

export const metadata: Metadata = {
  title: 'Search | Decryptica',
  description: 'Search Decryptica articles, prompt library entries, and tools.',
  alternates: {
    canonical: '/search',
  },
};

type PromptRecord = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  prompt_text?: string;
  tools?: string[];
};

const promptRecords = (promptsData.prompts as PromptRecord[]) || [];

const tools: SearchResult[] = [
  {
    id: 'tool-ai-price-calculator',
    title: 'AI Model Price Calculator',
    excerpt:
      'Compare current API pricing across OpenAI, Claude, Gemini, DeepSeek, Grok, Mistral, Cohere, and Amazon Nova.',
    href: '/tools/ai-price-calculator',
    type: 'Tool',
    category: 'AI Tools',
    keywords: 'llm api pricing token cost calculator gpt claude gemini deepseek grok mistral nova',
  },
  {
    id: 'tool-prompt-library',
    title: 'OpenClaw Prompt Library',
    excerpt:
      'Browse copy-pasteable OpenClaw automations for research, monitoring, communication, coding, and memory workflows.',
    href: '/prompts',
    type: 'Tool',
    category: 'Automation',
    keywords: 'prompts automation openclaw agents workflows templates operator library',
  },
];

function categoryName(category: string) {
  if (category === 'crypto') return 'Crypto';
  if (category === 'ai') return 'AI';
  if (category === 'automation') return 'Automation';
  return category;
}

function buildSearchIndex(): SearchResult[] {
  const articleResults: SearchResult[] = articles
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((article) => ({
      id: `article-${article.id}`,
      title: article.title,
      excerpt: article.excerpt,
      href: `/blog/${article.slug}`,
      type: 'Article',
      category: categoryName(article.category),
      date: article.date,
      readTime: article.readTime,
      keywords: [
        article.category,
        article.primaryKeyword,
        article.targetSubpillar,
        ...(article.tags || []),
      ]
        .filter(Boolean)
        .join(' '),
    }));

  const promptResults: SearchResult[] = promptRecords.map((prompt) => ({
    id: `prompt-${prompt.id}`,
    title: prompt.title,
    excerpt: prompt.description,
    href: `/prompts/${prompt.slug}`,
    type: 'Prompt',
    category: prompt.category,
    keywords: [...(prompt.tools || []), prompt.prompt_text || ''].join(' '),
  }));

  return [...tools, ...articleResults, ...promptResults];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawQuery = params?.q;
  const initialQuery = Array.isArray(rawQuery) ? rawQuery[0] || '' : rawQuery || '';

  return <SearchClient results={buildSearchIndex()} initialQuery={initialQuery} />;
}
