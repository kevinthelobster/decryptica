import Link from "next/link";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase())} | Decryptica`,
    description: "Expert technical intelligence on this topic.",
  };
}

function generateJsonLd(post: { title: string; description: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: `https://decryptica.com/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Decryptica",
      logo: {
        "@type": "ImageObject",
        url: "https://decryptica.com/logo.png",
      },
    },
  };
}

// Sample data - in production, this comes from content_index.json
const samplePost = {
  title: "Build Your First AI Agent in 2026",
  description: "A comprehensive guide to creating autonomous AI agents using modern frameworks.",
  slug: "ai-agent-primer",
  publishedAt: "2026-03-15",
  author: "Decryptica",
  quickSummary: [
    "AI agents are not just chatbots — they're autonomous systems that can take actions.",
    "The key is prompt engineering + tool use + memory — not just LLM calls.",
    "Start with ReAct (Reasoning + Acting) patterns before adding complexity.",
  ],
  relatedPosts: [
    { slug: "cursor-vs-windsurf", title: "Cursor vs Windsurf: Which AI Editor?" },
    { slug: "llm-agents-deep-dive", title: "LLM Agents Deep Dive" },
  ],
  toolRecommendation: {
    name: "LangChain",
    description: "Build context-aware reasoning applications.",
    url: "https://langchain.com",
    affiliate: false,
  },
};

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = samplePost; // In production, fetch by slug

  const jsonLd = generateJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <header className="mb-8">
              <h1 className="font-mono text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-mono">
                <span>{post.publishedAt}</span>
                <span>•</span>
                <span>{post.author}</span>
              </div>
            </header>

            {/* Conversion Zone: Newsletter */}
            <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-lime-500/10 border border-cyan-500/30 rounded-lg">
              <h3 className="font-mono text-lg font-bold mb-2">Stay ahead of the curve</h3>
              <p className="text-slate-400 text-sm mb-4">
                Get weekly technical intelligence delivered to your inbox. No fluff, just signal.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" className="btn-cyber">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Article Content Placeholder */}
            <div className="prose prose-invert prose-slate max-w-none">
              <p>
                This is where your article content goes. Use proper heading structures,
                code blocks, and strategic formatting.
              </p>
              <h2>Getting Started</h2>
              <p>
                Your content here...
              </p>
            </div>

            {/* Related Intelligence */}
            <section className="mt-12 pt-8 border-t border-slate-800">
              <h3 className="font-mono text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-cyan-400">▸</span> Related Intelligence
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {post.relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="card-glow p-4 rounded-lg group"
                  >
                    <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      {related.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Quick Summary Box */}
              <div className="p-4 bg-slate-900/50 border border-cyan-500/30 rounded-lg mb-6">
                <h3 className="font-mono text-sm font-bold text-cyan-400 mb-3">
                  ⚡ 3 Things You Won't Find Elsewhere
                </h3>
                <ol className="space-y-3">
                  {post.quickSummary.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300">
                      <span className="text-lime-400 font-mono mr-2">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Conversion Zone: Tool Recommendation */}
              <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-lg">
                <h3 className="font-mono text-xs font-bold text-slate-500 mb-2">RECOMMENDED</h3>
                <a
                  href={post.toolRecommendation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h4 className="font-mono font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-1">
                    {post.toolRecommendation.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    {post.toolRecommendation.description}
                  </p>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
