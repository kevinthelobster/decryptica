import Link from "next/link";
import { Metadata } from "next";
import SubscribeForm from "./components/SubscribeForm";
import TrackedLink from "./components/TrackedLink";
import IntentRouter from "./components/IntentRouter";
import { articles } from "./data/articles";

export const metadata: Metadata = {
  title: "Decryptica | Technical Intelligence",
  description: "Expert insights on Crypto, AI, and Automation. Stay ahead of the curve with technical intelligence.",
};

// Get the 3 most recent articles
const featuredArticles = [...articles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3)
  .map((article) => ({
    id: article.id,
    category: article.category === 'crypto' ? 'Crypto' : article.category === 'ai' ? 'AI' : 'Automation',
    title: article.title,
    excerpt: article.excerpt,
    readTime: article.readTime,
    date: new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    slug: article.slug,
  }));

const topics = [
  {
    slug: "crypto",
    title: "Crypto & DeFi",
    description: "Deep dives into blockchain protocols, DeFi strategies, and market analysis.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "from-amber-500 to-orange-600",
    count: articles.filter(a => a.category === 'crypto').length,
  },
  {
    slug: "ai",
    title: "Artificial Intelligence",
    description: "Stay ahead with insights on LLMs, AI agents, and emerging technology.",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "from-indigo-500 to-purple-600",
    count: articles.filter(a => a.category === 'ai').length,
  },
  {
    slug: "automation",
    title: "Automation",
    description: "Tools, workflows, and strategies to automate your work and life.",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v.01M4.582 9H4.582m0 0a8.001 8.001 0 0115.356-2M15.356 9a8.001 8.001 0 00-15.356 2m15.356-2a8.001 8.001 0 01-15.356 2M12 12l-3 3m0 0l3 3m-3-3v8",
    color: "from-emerald-500 to-teal-600",
    count: articles.filter(a => a.category === 'automation').length,
  },
];

export default function IndexPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[34rem]">
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
            <TrackedLink
              href="/articles"
              className="btn-primary"
              eventType="cta_click"
              metadata={{ location: "home_hero", cta: "start_reading", category: "all" }}
            >
              Start Reading
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </TrackedLink>
            <TrackedLink
              href="/tools/ai-price-calculator"
              className="btn-secondary"
              eventType="cta_click"
              metadata={{ location: "home_hero", cta: "calculate", category: "all" }}
            >
              Try AI Calculator
            </TrackedLink>
          </div>
          <TrackedLink
            href="/services/ai-automation-consulting"
            className="mt-4 inline-flex text-sm font-medium text-indigo-300 underline decoration-indigo-400/60 underline-offset-4 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            eventType="cta_click"
            metadata={{ location: "home_hero", cta: "implement", category: "all" }}
          >
            Book Automation Audit
          </TrackedLink>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              "Trusted by builders, operators, and technical teams",
              "New research snapshots every week",
              "Field-tested guides with practical implementation details",
            ].map((point) => (
              <div
                key={point}
                className="min-h-[74px] rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-4 text-sm text-zinc-300"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="relative border-t border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-zinc-400">
              <li>Fast-loading article templates</li>
              <li>Schema-first technical publishing</li>
              <li>CTR and scroll-depth instrumentation ready</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Latest Articles</h2>
          <TrackedLink
            href="/articles"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            eventType="cta_click"
            metadata={{ location: "home_latest_articles", cta: "view_all" }}
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </TrackedLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <TrackedLink
              key={article.id}
              href={`/blog/${article.slug}`}
              className="article-card group cursor-pointer"
              eventType="article_click"
              articleSlug={article.slug}
              metadata={{ location: "home_latest_articles", category: article.category }}
            >
              <div className="h-24 bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-800" />
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
            </TrackedLink>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <IntentRouter
          location="home_intent_router"
          category="all"
          variant="default"
          learnHref="/articles"
        />
      </section>

      {/* Topics Grid */}
      <section id="topics" className="max-w-7xl mx-auto px-6 py-16">
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

      {/* AI Calculator Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/30 border border-zinc-800 p-8 md:p-12">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left: Text content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Free Tool
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                AI Model Price Calculator
              </h2>
              <p className="text-zinc-400 text-lg mb-6 max-w-xl mx-auto lg:mx-0">
                Compare costs across {32} AI models from OpenAI, Anthropic, Google, Meta, DeepSeek, and more. See exactly how much you'll pay before you build.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <TrackedLink
                  href="/tools/ai-price-calculator"
                  className="btn-primary"
                  eventType="cta_click"
                  metadata={{ location: "home_calculator", cta: "try_calculator" }}
                >
                  Try the Calculator
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </TrackedLink>
                <div className="flex items-center gap-2 justify-center lg:justify-start text-sm text-zinc-500">
                  <span>32 models</span>
                  <span className="text-zinc-700">&#xb7;</span>
                  <span>Updated April 2026</span>
                </div>
              </div>
            </div>

            {/* Right: Mini preview */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <div className="bg-zinc-950/80 rounded-2xl border border-zinc-700/50 p-6 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">100K input + 20K output</p>
                    <p className="text-zinc-500 text-sm">Typical AI query</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-emerald-400 font-medium">Cheapest</span>
                    <span className="text-white font-semibold">$0.044 — Gemini 1.5 Flash</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                    <span className="text-indigo-400 font-medium">Most Popular</span>
                    <span className="text-white font-semibold">$0.95 — GPT-4o mini</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-red-400 font-medium">Most Expensive</span>
                    <span className="text-white font-semibold">$3.15 — Claude Opus 4.6</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 text-center">Save up to 98% by choosing the right model</p>
                </div>
              </div>
            </div>
          </div>
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
