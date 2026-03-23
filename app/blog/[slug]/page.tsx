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
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  
  const validSlugs = ["ethereums-make-or-break-moment-is-a-false-narrative"];
  
  if (!validSlugs.includes(slug)) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="font-mono text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-slate-400">The article "{slug}" doesn't exist yet.</p>
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
          ← Back to Index
        </Link>
      </div>
    );
  }

  const post = {
    title: "Ethereum's 'Make-or-Break' Moment Is a False Narrative",
    description: "The real threat to Ethereum isn't quantum computing or AI competition - it's Layer 2 fragmentation destroying network effects.",
    slug: slug,
    publishedAt: "2026-03-22",
    author: "Decryptica",
    quickSummary: [
      "Layer 2 fragmentation is killing ETH's network effect - TVL is spread across 5+ chains",
      "The 'scaling narrative' hides a deeper problem - interoperability remains unsolved",
      "AI integration is missing entirely - Ethereum has no native AI tooling story",
    ],
    relatedPosts: [
      { slug: "solana-vs-ethereum-2026", title: "Solana vs Ethereum 2026: The Landscape Shifts" },
      { slug: "layer-2-bridging-guide", title: "A Practical Guide to L2 Bridging" },
    ],
    toolRecommendation: {
      name: "Arbitrum",
      description: "Scale Ethereum with optimistic rollups. Low fees, EVM equivalent.",
      url: "https://arbitrum.io",
      affiliate: false,
    },
  };

  const jsonLd = generateJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            <header className="mb-8">
              <h1 className="font-mono text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-mono">
                <span>{post.publishedAt}</span>
                <span>•</span>
                <span>{post.author}</span>
              </div>
            </header>

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

            <div className="prose prose-invert prose-slate max-w-none">
              <p>Everyone's sweating Ethereum. Headlines scream about "quantum threats" and "AI competition." The consensus is clear: Ethereum is on the ropes.</p>
              <p className="text-lg text-cyan-400 font-semibold">I don't buy it.</p>
              <p>The real problem isn't sexy enough for headlines. It's that <strong>Layer 2 chains are fracturing ETH's network effect</strong> while the foundation pretends everything is fine.</p>
              <h2>The Layer 2 Fragmentation Problem</h2>
              <p>Here's what the mainstream misses: Ethereum isn't one blockchain anymore. It's five.</p>
              <ul>
                <li><strong>Optimism</strong> → $6.5B TVL</li>
                <li><strong>Arbitrum</strong> → $5.2B TVL</li>
                <li><strong>Base</strong> → $4.1B TVL</li>
                <li><strong>Starknet</strong> → $1.8B TVL</li>
                <li><strong>zkSync</strong> → $1.2B TVL</li>
              </ul>
              <h2>What Actually Matters</h2>
              <p>The "make-or-break" framing is noise. The real question: <strong>Can ETH unify its L2 ecosystem before the fragmentation becomes irreversible?</strong></p>
            </div>

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

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
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
