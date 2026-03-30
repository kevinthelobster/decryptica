import Link from "next/link";
import { Metadata } from "next";
import SubscribeForm from "./components/SubscribeForm";

export const metadata: Metadata = {
  title: "Decryptica | Technical Intelligence",
  description: "Expert insights on Crypto, AI, and Automation. Stay ahead of the curve with technical intelligence.",
};

const featuredArticles = [
  {
    id: 1,
    category: "AI",
    title: "The Rise of Local AI: Why Developers Are Leaving the Cloud",
    excerpt: "As privacy concerns grow and hardware becomes more powerful, running AI models locally is becoming increasingly viable.",
    readTime: "6 min read",
    date: "Mar 28, 2026",
  },
  {
    id: 2,
    category: "Crypto",
    title: "Understanding Solana's Transaction Finality in 2026",
    excerpt: "A deep dive into how Solana achieves sub-second finality and why it matters for DeFi applications.",
    readTime: "8 min read",
    date: "Mar 27, 2026",
  },
  {
    id: 3,
    category: "Automation",
    title: "Building Your First n8n Workflow: A Beginner's Guide",
    excerpt: "Learn how to automate repetitive tasks without writing a single line of code.",
    readTime: "12 min read",
    date: "Mar 26, 2026",
  },
];

const topics = [
  {
    slug: "crypto",
    title: "Crypto & DeFi",
    description: "Deep dives into blockchain protocols, DeFi strategies, and market analysis.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "from-amber-500 to-orange-600",
    count: 24,
  },
  {
    slug: "ai",
    title: "Artificial Intelligence",
    description: "Stay ahead with insights on LLMs, AI agents, and emerging technology.",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "from-indigo-500 to-purple-600",
    count: 31,
  },
  {
    slug: "automation",
    title: "Automation",
    description: "Tools, workflows, and strategies to automate your work and life.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v.01M4.582 9H4.582m0 0a8.001 8.001 0 0115.356-2M15.356 9a8.001 8.001 0 00-15.356 2m15.356-2a8.001 8.001 0 01-15.356 2M12 12l-3 3m0 0l3 3m-3-3v8",
    color: "from-emerald-500 to-teal-600",
    count: 18,
  },
];

export default function IndexPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              New articles weekly
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Technical intelligence<br />
            <span className="text-gradient">for the curious.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            We decode the complex world of crypto, AI, and automation into actionable insights. 
            No fluff. No hype. Just real technical depth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">
              Start Reading
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="btn-secondary">
              Browse Topics
            </button>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Latest Articles</h2>
          <Link href="/articles" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <article key={article.id} className="article-card group cursor-pointer">
              {/* Article Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-700/50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
                <div className="article-image absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`}>
                    {article.category}
                  </span>
                  <span className="text-xs text-zinc-500">{article.readTime}</span>
                </div>
                
                <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{article.date}</span>
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Topics Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="section-heading mb-8">Explore Topics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topic/${topic.slug}`}
              className="card-elevated p-8 group hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${topic.color} p-0.5 mb-6`}>
                <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={topic.icon} />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {topic.title}
              </h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                {topic.description}
              </p>

              {/* Count */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{topic.count} articles</span>
                <svg className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="subscribe" className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Stay ahead of the curve
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl">
              Get the best technical insights delivered to your inbox. No spam, just signal.
            </p>

            <SubscribeForm />
          </div>
        </div>
      </section>
    </div>
  );
}