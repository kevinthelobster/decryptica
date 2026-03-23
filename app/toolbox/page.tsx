import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolbox | Decryptica",
  description: "Curated AI and Automation tools. Premium recommendations with referral links.",
};

const tools = [
  {
    name: "Cursor",
    description: "AI-first code editor built for pair programming.",
    category: "AI Coding",
    url: "https://cursor.sh",
    affiliate: true,
  },
  {
    name: "Windsurf",
    description: "Flow-aware AI coding assistant.",
    category: "AI Coding",
    url: "https://windsurf.ai",
    affiliate: true,
  },
  {
    name: "Perplexity",
    description: "AI-powered search and research tool.",
    category: "AI Research",
    url: "https://perplexity.ai",
    affiliate: true,
  },
  {
    name: "ChatGPT",
    description: "OpenAI's flagship AI assistant.",
    category: "AI Assistant",
    url: "https://chat.openai.com",
    affiliate: false,
  },
];

export default function ToolboxPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-mono text-4xl font-bold mb-4">
          <span className="text-cyan-400">$</span> ls /toolbox
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Hand-picked tools we use daily. Some links may earn us a commission —
          it helps keep the lights on without selling your data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-glow p-6 rounded-lg block group"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-mono text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                {tool.name}
              </h2>
              {tool.affiliate && (
                <span className="text-xs font-mono text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded">
                  affil.
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-3">{tool.description}</p>
            <span className="text-xs font-mono text-slate-500">{tool.category}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
