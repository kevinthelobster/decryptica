import Link from 'next/link';
import { Metadata } from 'next';

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
  const { slug } = await params;
  
  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="card-elevated p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
          This build is being finalized. Check back soon for code-heavy tutorials, scripts, and practical automation content.
        </p>
        <Link href="/builds" className="btn-primary">
          ← Back to Builds
        </Link>
      </div>
    </div>
  );
}
