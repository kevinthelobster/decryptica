import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Toolbox | Decryptica',
  description: 'Curated AI and Automation tools. Premium recommendations with referral links.',
};

const tools = [
  {
    name: 'Cursor',
    description: 'AI-first code editor built for pair programming. The leader in AI coding assistance.',
    category: 'AI Coding',
    url: 'https://cursor.sh',
    affiliate: true,
    icon: '⌨️',
  },
  {
    name: 'Windsurf',
    description: 'Flow-aware AI coding assistant with innovative Cascade feature.',
    category: 'AI Coding',
    url: 'https://windsurf.ai',
    affiliate: true,
    icon: '🌊',
  },
  {
    name: 'Perplexity',
    description: 'AI-powered search and research tool. Real-time answers with citations.',
    category: 'AI Research',
    url: 'https://perplexity.ai',
    affiliate: true,
    icon: '🔍',
  },
  {
    name: 'ChatGPT',
    description: "OpenAI's flagship AI assistant. The baseline for conversational AI.",
    category: 'AI Assistant',
    url: 'https://chat.openai.com',
    affiliate: false,
    icon: '💬',
  },
  {
    name: 'Ollama',
    description: 'Run LLMs locally. Full privacy and no API fees.',
    category: 'Local AI',
    url: 'https://ollama.com',
    affiliate: false,
    icon: '🏠',
  },
  {
    name: 'n8n',
    description: 'Open-source workflow automation. Self-host for unlimited tasks.',
    category: 'Automation',
    url: 'https://n8n.io',
    affiliate: false,
    icon: '⚡',
  },
];

export default function ToolboxPage() {
  // Group tools by category
  const categories = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="section-heading mb-4">Toolbox</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Hand-picked tools we use daily. Some links may earn us a commission — 
          it helps keep the lights on without selling your data.
        </p>
      </div>

      {/* Tools by Category */}
      <div className="space-y-12">
        {Object.entries(categories).map(([category, categoryTools]) => (
          <div key={category}>
            <h2 className="font-display font-semibold text-xl text-white mb-6 flex items-center gap-3">
              <span className="text-indigo-400">/</span>
              {category}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {categoryTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-elevated p-5 group"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h3>
                        {tool.affiliate && (
                          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                            affiliate
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 card-elevated p-8 text-center">
        <h2 className="font-display text-xl font-semibold text-white mb-3">
          Need custom automation?
        </h2>
        <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
          We build tailored solutions for teams that need more than off-the-shelf tools.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Get in Touch
        </Link>
      </div>
    </div>
  );
}