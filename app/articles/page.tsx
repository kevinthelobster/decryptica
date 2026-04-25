import Link from 'next/link';
import { Metadata } from 'next';
import { articles, type Article } from '../data/articles';
import SubscribeForm from '../components/SubscribeForm';
import TrackedLink from '../components/TrackedLink';

// ─── SEO Copy Framework: Meta Title/Description Variants for Articles Listing ─

function getListingMetaVariants(articleCount: number): {
  primary: { title: string; description: string };
  variantB: { title: string; description: string };
} {
  // Primary variant: directory-style
  const primary = {
    title: `All Articles | Decryptica — ${articleCount} Guides on Crypto, AI & Automation`,
    description: `Browse ${articleCount}+ expert articles on crypto, AI tools, and automation workflows. Data-driven guides, comparisons, and how-tos updated for 2026.`,
  };

  // Variant B: benefit-driven, action-oriented
  const variantB = {
    title: `${articleCount}+ Expert Guides: Crypto, AI & Automation | Decryptica`,
    description: `Stop searching. Decryptica's expert team publishes actionable crypto analysis, AI tool comparisons, and automation tutorials. Updated weekly.`,
  };

  return { primary, variantB };
}

export const metadata: Metadata = {
  title: 'Articles | Decryptica',
  description: 'Expert insights on Crypto, AI, and Automation. Browse all articles.',
  alternates: {
    canonical: '/articles',
  },
};

// ─── SEO Copy Framework: Funnel-Stage CTA Blocks for Listing Page ────────────

function ListingCTAExplore() {
  return (
    <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      <h3 className="font-display text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Explore</h3>
      <p className="text-white font-medium mb-1">Not sure where to start?</p>
      <p className="text-zinc-400 text-sm mb-3">Browse by topic to find articles that match your current goal.</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/topic/ai/use-cases" className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-indigo-500/20 text-indigo-400 rounded-full transition-colors">AI Use Cases</Link>
        <Link href="/topic/crypto/trading" className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-indigo-500/20 text-indigo-400 rounded-full transition-colors">Crypto & DeFi</Link>
        <Link href="/topic/automation/workflows" className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-indigo-500/20 text-indigo-400 rounded-full transition-colors">Automation</Link>
      </div>
    </div>
  );
}

function ListingCTACompare() {
  return (
    <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      <h3 className="font-display text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Compare</h3>
      <p className="text-white font-medium mb-1">Making a decision?</p>
      <p className="text-zinc-400 text-sm mb-3">See side-by-side comparisons of the top tools before you commit.</p>
      <TrackedLink
        href="/articles?sort=comparison"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        eventType="cta_click"
        metadata={{ location: 'listing_cta_compare', cta: 'browse_comparisons' }}
      >
        Browse Comparisons →
      </TrackedLink>
    </div>
  );
}

function ListingCTAStart() {
  return (
    <div className="p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl">
      <h3 className="font-display text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Get Started</h3>
      <p className="text-white font-medium mb-1">Ready to dive in?</p>
      <p className="text-zinc-400 text-sm mb-3">Get the latest guides delivered to your inbox so you never miss a new article.</p>
      <SubscribeForm />
    </div>
  );
}

export default function ArticlesPage() {
  // Sort by date (newest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by category for display
  const categories: { name: string; href: string; slug: Article['category']; count: number }[] = [
    { name: 'Crypto & DeFi', href: '/topic/crypto/defi', slug: 'crypto', count: articles.filter(a => a.category === 'crypto').length },
    { name: 'Artificial Intelligence', href: '/topic/ai/use-cases', slug: 'ai', count: articles.filter(a => a.category === 'ai').length },
    { name: 'Automation', href: '/topic/automation/workflows', slug: 'automation', count: articles.filter(a => a.category === 'automation').length },
  ];

  const { primary } = getListingMetaVariants(articles.length);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="section-heading mb-4">All Articles</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Expert intelligence on crypto, AI, and automation. {articles.length} articles and counting.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 mb-10 overflow-x-auto px-6 -mx-6 md:overflow-visible md:px-0 md:mx-0 flex-nowrap">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="topic-tag shrink-0 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
          >
            {cat.name}
            <span className="ml-2 opacity-50">({cat.count})</span>
          </Link>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {sortedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="article-card p-6 group flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">{article.readTime}</span>
            </div>
            <h2 className="font-display font-semibold text-lg text-white mb-3 group-hover:text-indigo-400 transition-colors leading-snug flex-grow">
              {article.title}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
              <span className="text-xs text-zinc-500">{article.date}</span>
              <span className="text-xs text-indigo-400 font-medium group-hover:underline">
                Read more →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* SEO Copy Framework: Funnel-Stage CTA Blocks */}
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <ListingCTAExplore />
        <ListingCTACompare />
        <ListingCTAStart />
      </div>

      {/* Subscribe Section */}
      <div className="card-elevated p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Never miss an update
        </h2>
        <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
          Get weekly technical intelligence delivered straight to your inbox. No spam, just signal.
        </p>
        <div className="max-w-md mx-auto">
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}