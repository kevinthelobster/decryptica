import Link from 'next/link';
import { Metadata } from 'next';
import { articles, type Article } from '../data/articles';
import SubscribeForm from '../components/SubscribeForm';
import { getBreadcrumbSchema, getCollectionPageSchema, jsonLdScript, absoluteUrl } from '../lib/schema';

export const metadata: Metadata = {
  title: 'Articles | Decryptica',
  description: 'Expert insights on Crypto, AI, and Automation. Browse all articles.',
  alternates: {
    canonical: '/articles',
  },
};

export default function ArticlesPage() {
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categories: { name: string; href: string; slug: Article['category']; count: number }[] = [
    { name: 'Crypto & DeFi', href: '/topic/crypto/defi', slug: 'crypto', count: articles.filter((a) => a.category === 'crypto').length },
    { name: 'Artificial Intelligence', href: '/topic/ai/use-cases', slug: 'ai', count: articles.filter((a) => a.category === 'ai').length },
    { name: 'Automation', href: '/topic/automation/workflows', slug: 'automation', count: articles.filter((a) => a.category === 'automation').length },
  ];
  const collectionSchema = getCollectionPageSchema({
    name: 'All Articles',
    description: 'Browse expert articles on crypto, AI tools, and automation workflows.',
    path: '/articles',
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
  ]);
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All Decryptica articles',
    numberOfItems: sortedArticles.length,
    itemListElement: sortedArticles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/blog/${article.slug}`),
      name: article.title,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(collectionSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListSchema)} />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="section-heading mb-4">All Articles</h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Expert intelligence on crypto, AI, and automation. {articles.length} articles and counting.
          </p>
        </div>

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
    </>
  );
}
