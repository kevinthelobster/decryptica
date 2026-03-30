import Link from 'next/link';
import { Metadata } from 'next';
import { getArticleBySlug, articles } from '../../data/articles';
import SubscribeForm from '../../components/SubscribeForm';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
  if (!article) {
    return { title: 'Article Not Found | Decryptica' };
  }
  
  return {
    title: `${article.title} | Decryptica`,
    description: article.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="section-heading mb-4">Article Not Found</h1>
        <p className="text-zinc-400 mb-6">The article "{slug}" doesn't exist yet.</p>
        <Link href="/articles" className="btn-primary">
          Browse All Articles
        </Link>
      </div>
    );
  }

  // Get related articles from same category
  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-3">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link 
                href={`/topic/${article.category}`}
                className="topic-tag hover:bg-indigo-500/20 transition-colors"
              >
                {article.category}
              </Link>
              <span className="text-zinc-600">•</span>
              <span className="text-sm text-zinc-500">{article.readTime}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>{article.date}</span>
              {article.author && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>{article.author}</span>
                </>
              )}
            </div>
          </header>

          {/* Subscribe Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl">
            <h3 className="font-display font-semibold text-lg text-white mb-2">
              Stay ahead of the curve
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Get weekly technical intelligence delivered to your inbox. No fluff, just signal.
            </p>
            <SubscribeForm />
          </div>

          {/* Article Content */}
          <div className="prose prose-invert prose-zinc max-w-none">
            {article.content.split('\n\n').map((paragraph, i) => {
              // Handle headings
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={i} className="font-display text-xl font-semibold text-white mt-8 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              // Handle bold text
              const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p key={i} className="text-zinc-300 leading-relaxed mb-4">
                  {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-12 pt-8 border-t border-zinc-800/50">
              <h3 className="font-display font-semibold text-lg text-white mb-6 flex items-center gap-2">
                <span className="text-indigo-400">→</span> Related Intelligence
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="card-elevated p-5 group"
                  >
                    <span className="text-sm text-indigo-400 mb-2 block">{related.category}</span>
                    <h4 className="font-display font-semibold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                      {related.title}
                    </h4>
                    <span className="text-xs text-zinc-500 mt-2 block">{related.date}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Article Summary */}
            <div className="card-elevated p-5">
              <h3 className="font-display font-semibold text-sm text-indigo-400 mb-4 uppercase tracking-wider">
                Quick Summary
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            {/* Topic Links */}
            <div className="card-elevated p-5">
              <h3 className="font-display font-semibold text-sm text-zinc-500 mb-4 uppercase tracking-wider">
                Topics
              </h3>
              <div className="space-y-2">
                <Link 
                  href="/topic/crypto"
                  className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
                >
                  <span>₿</span>
                  <span>Crypto & DeFi</span>
                  <span className="ml-auto text-zinc-600 group-hover:text-indigo-400">→</span>
                </Link>
                <Link 
                  href="/topic/ai"
                  className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
                >
                  <span>🤖</span>
                  <span>Artificial Intelligence</span>
                  <span className="ml-auto text-zinc-600 group-hover:text-indigo-400">→</span>
                </Link>
                <Link 
                  href="/topic/automation"
                  className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
                >
                  <span>⚡</span>
                  <span>Automation</span>
                  <span className="ml-auto text-zinc-600 group-hover:text-indigo-400">→</span>
                </Link>
              </div>
            </div>

            {/* Back to Articles */}
            <Link href="/articles" className="btn-secondary w-full justify-center">
              ← All Articles
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}