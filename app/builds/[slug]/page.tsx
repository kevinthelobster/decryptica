import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface BuildsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BuildsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const buildNames: Record<string, string> = {
    'ai-agent-primer': 'Build Your First AI Agent in 2026',
    'local-llm-setup': 'Local LLM Setup with Ollama',
    'n8n-integration': 'n8n Workflow Integration Patterns',
  };
  
  const title = buildNames[slug] || 'Build';
  return {
    title: `${title} | Decryptica`,
  };
}

export default async function BuildPage({ params }: BuildsPageProps) {
  await params;
  redirect('/articles');
}
