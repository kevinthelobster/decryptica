import Link from 'next/link';
import { Metadata } from 'next';
import { articles, getTopicBySlug, getArticlesByCategory } from '../../data/articles';

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  
  if (!topic) {
    return { title: 'Topic Not Found | Decryptica' };
  }
  
  return {
    title: `${topic.name} | Decryptica`,
    description: topic.description,
    alternates: {
      canonical: `/topic/${slug}`,
    },
  };
}

const topicIcons: Record<string, React.ReactNode> = {
  crypto: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.66 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.66-1M12 8v8m0 0v1m0-1c1.11 0 2.08.402 2.66 1M6 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2m0 8c1.11 0 2.08.402 2.66 1M6 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.66-1M18 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2m0 8c1.11 0 2.08.402 2.66 1M18 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.66-1" />
    </svg>
  ),
  ai: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  automation: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  const topicArticles = getArticlesByCategory(slug as 'crypto' | 'ai' | 'automation');

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="section-heading mb-4">Topic Not Found</h1>
        <p className="text-zinc-400 mb-6">This topic doesn't exist yet.</p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Topic Header */}
      <div className="mb-12">
        <div className="card-elevated p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {topicIcons[slug] || topicIcons.crypto}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="section-heading">{topic.name}</h1>
                <span className="topic-tag">{topicArticles.length} articles</span>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">
                {topic.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {topicArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicArticles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="article-card p-6 group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                  {article.category}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-500">{article.readTime}</span>
              </div>
              <h2 className="font-display font-semibold text-lg text-white mb-3 group-hover:text-indigo-400 transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{article.date}</span>
                <span className="text-xs text-indigo-400 font-medium group-hover:underline">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-elevated p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-lg text-white mb-2">No Articles Yet</h3>
          <p className="text-zinc-400 text-sm">Content for {topic.name} is coming soon.</p>
        </div>
      )}
    </div>
  );
}