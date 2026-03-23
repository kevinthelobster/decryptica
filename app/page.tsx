import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Index | Decryptica",
  description: "Explore our topic clusters: Crypto, AI, and Automation. Expert technical intelligence.",
};

const topics = [
  {
    slug: "crypto",
    title: "Crypto",
    description: "DeFi protocols, blockchain development, and market intelligence.",
    articleCount: 0,
  },
  {
    slug: "ai",
    title: "AI",
    description: "Machine learning, AI agents, and automation tools.",
    articleCount: 0,
  },
  {
    slug: "automation",
    title: "Automation",
    description: "Workflow automation, scripts, and productivity systems.",
    articleCount: 0,
  },
];

export default function IndexPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-mono text-4xl font-bold mb-4">
          <span className="text-cyan-400">$</span> ls /topics
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Three pillars of technical intelligence. Each cluster represents deep expertise
          and practical, implementable knowledge.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topic/${topic.slug}`}
            className="card-glow p-6 rounded-lg block group"
          >
            <h2 className="font-mono text-2xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
              {topic.title}
            </h2>
            <p className="text-slate-400 text-sm mb-4">{topic.description}</p>
            <div className="text-xs font-mono text-slate-500">
              {topic.articleCount} articles
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
        <h3 className="font-mono text-lg font-bold mb-2 flex items-center gap-2">
          <span className="text-lime-400">▸</span> Top Trending AI Repo
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Check back tomorrow for the daily trending repository.
        </p>
      </section>
    </div>
  );
}
