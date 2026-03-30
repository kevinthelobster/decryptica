import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Builds | Decryptica',
  description: 'Code-heavy tutorials, scripts, and practical automation builds.',
};

const builds = [
  {
    slug: 'ai-agent-primer',
    title: 'Build Your First AI Agent in 2026',
    description: 'A comprehensive guide to creating autonomous AI agents using modern frameworks. Covers LangChain, tool use, and deployment.',
    tech: ['Python', 'LangChain', 'OpenAI'],
    readTime: '12 min',
    category: 'ai',
  },
  {
    slug: 'local-llm-setup',
    title: 'Local LLM Setup with Ollama',
    description: 'Step-by-step guide to running Llama 3 and other models on your own hardware. Privacy-first AI for everyone.',
    tech: ['Ollama', 'Docker', 'API'],
    readTime: '8 min',
    category: 'ai',
  },
  {
    slug: 'n8n-integration',
    title: 'n8n Workflow Integration Patterns',
    description: 'Common patterns for building production-grade automations with n8n. Error handling, testing, and monitoring included.',
    tech: ['n8n', 'Node.js', 'API'],
    readTime: '10 min',
    category: 'automation',
  },
];

const categoryColors: Record<string, string> = {
  ai: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  automation: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
};

export default function BuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="section-heading mb-4">Builds</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Practical, code-first content. These posts prove expertise through utility — 
          copy, paste, run, learn.
        </p>
      </div>

      {/* Builds List */}
      <div className="space-y-4">
        {builds.map((build) => (
          <a
            key={build.slug}
            href={`/builds/${build.slug}`}
            className="card-elevated p-6 block group"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${categoryColors[build.category] || categoryColors.automation}`}>
                    {build.category}
                  </span>
                  <span className="text-xs text-zinc-500">{build.readTime}</span>
                </div>
                <h2 className="font-display font-semibold text-xl text-white group-hover:text-indigo-400 transition-colors mb-3">
                  {build.title}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {build.description}
                </p>
              </div>
              
              {/* Tech Stack */}
              <div className="flex flex-wrap items-center gap-2 md:flex-shrink-0">
                {build.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-lg border border-zinc-700/50"
                  >
                    {t}
                  </span>
                ))}
                <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform ml-2">
                  →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="mt-16 card-elevated p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-3">
          More builds coming soon
        </h2>
        <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
          We&apos;re working on scripts for crypto trading bots, AI automation pipelines, and homelab infrastructure. Stay tuned.
        </p>
        <Link href="/articles" className="btn-primary inline-flex">
          Browse Articles
        </Link>
      </div>
    </div>
  );
}