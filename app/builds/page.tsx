import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Builds | Decryptica",
  description: "Code-heavy tutorials, scripts, and practical automation builds.",
};

const builds = [
  {
    slug: "ai-agent-primer",
    title: "Build Your First AI Agent in 2026",
    description: "A comprehensive guide to creating autonomous AI agents using modern frameworks.",
    tech: ["Python", "OpenAI", "LangChain"],
    readTime: "12 min",
  },
];

export default function BuildsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-mono text-4xl font-bold mb-4">
          <span className="text-cyan-400">$</span> ls /builds
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Practical, code-first content. These posts prove expertise through utility —
          copy, paste, run, learn.
        </p>
      </div>

      <div className="space-y-4">
        {builds.map((build) => (
          <a
            key={build.slug}
            href={`/builds/${build.slug}`}
            className="card-glow p-6 rounded-lg block group"
          >
            <h2 className="font-mono text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-2">
              {build.title}
            </h2>
            <p className="text-slate-400 text-sm mb-4">{build.description}</p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="text-cyan-400">{build.readTime}</span>
              <div className="flex gap-2">
                {build.tech.map((t) => (
                  <span key={t} className="bg-slate-800 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
