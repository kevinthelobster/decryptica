import Link from 'next/link';
import { Metadata } from 'next';
import { articles, type Article } from '../data/articles';
import SubscribeForm from '../components/SubscribeForm';

export const metadata: Metadata = {
  title: 'Articles | Decryptica',
  description: 'Expert insights on Crypto, AI, and Automation. Browse all articles.',
  alternates: {
    canonical: '/articles',
  },
};

export default function ArticlesPage() {
  // Sort by date (newest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by category for display
  const categories: { name: string; slug: Article['category']; count: number }[] = [
    { name: 'Crypto & DeFi', slug: 'crypto', count: articles.filter(a => a.category === 'crypto').length },
    { name: 'Artificial Intelligence', slug: 'ai', count: articles.filter(a => a.category === 'ai').length },
    { name: 'Automation', slug: 'automation', count: articles.filter(a => a.category === 'automation').length },
  ];

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
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/topic/${cat.slug}`}
            className="topic-tag hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
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