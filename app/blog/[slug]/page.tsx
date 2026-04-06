import Link from 'next/link';
import { Metadata } from 'next';
import { getArticleBySlug, articles } from '../../data/articles';
import SubscribeForm from '../../components/SubscribeForm';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ─── JSON-LD Schema Components ─────────────────────────────────────────────

function ArticleSchema({ article, url }: { article: any; url: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.lastUpdated || article.date,
    author: {
      '@type': 'Organization',
      name: 'Decryptica',
      url: 'https://decryptica.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Decryptica',
      logo: {
        '@type': 'ImageObject',
        url: 'https://decryptica.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category,
    wordCount: article.wordCount || estimateWordCount(article.content),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function FAQSchema({ faqs }: { faqs: any[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function BreadcrumbSchema({ slug, category }: { slug: string; category: string }) {
  const categoryNames: Record<string, string> = {
    crypto: 'Crypto & DeFi',
    ai: 'Artificial Intelligence',
    automation: 'Automation',
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://decryptica.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: 'https://decryptica.com/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryNames[category] || category,
        item: `https://decryptica.com/topic/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        item: `https://decryptica.com/blog/${slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Word Count Estimator ───────────────────────────────────────────────────

function estimateWordCount(content: string): number {
  return content
    .replace(/```[\s\S]*?```/g, '') // strip code blocks
    .replace(/[#*`_~\[\]]/g, '')   // strip markdown
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

// ─── Smart Related Articles (topical cluster linking) ───────────────────────

function getRelatedArticles(article: any, allArticles: any[]): any[] {
  // Strategy: same category first, then cross-link to other categories for topical authority
  const sameCategory = allArticles.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  );

  const otherCategory = allArticles.filter(
    (a) => a.category !== article.category && a.slug !== article.slug
  );

  // Interleave: 2 from same category + 1 from another category = topical cluster
  const related: any[] = [];
  let sameIdx = 0;
  let otherIdx = 0;

  for (let i = 0; i < 3; i++) {
    if (i % 3 === 2 && otherIdx < otherCategory.length) {
      related.push(otherCategory[otherIdx++]);
    } else if (sameIdx < sameCategory.length) {
      related.push(sameCategory[sameIdx++]);
    }
  }

  return related;
}

// ─── Generate Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Decryptica',
      robots: 'noindex',
    };
  }

  const canonicalUrl = `https://decryptica.com/blog/${slug}`;
  const ogImage = `https://decryptica.com/og/${slug}.jpg`;
  const wordCount = estimateWordCount(article.content);

  return {
    title: `${article.title} | Decryptica`,
    description: article.excerpt,
    keywords: [
      article.category,
      'crypto',
      'ai',
      'automation',
      'technical',
      ...(article.tags || []),
    ],
    authors: [{ name: 'Decryptica' }],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: 'Decryptica',
      locale: 'en_US',
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.lastUpdated || article.date,
      authors: ['Decryptica'],
      section: article.category,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
      site: '@decryptica',
      creator: '@decryptica',
    },
  };
}

// ─── Content Renderer ──────────────────────────────────────────────────────

function renderContent(content: string) {
  const elements: React.ReactNode[] = [];
  const blocks = content.split(/(?:^|\n)(?=## )/);

  blocks.forEach((block, blockIndex) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    if (trimmedBlock.startsWith('## ')) {
      const title = trimmedBlock.replace(/^## /, '').split('\n')[0];
      elements.push(
        <h2
          key={`h2-${blockIndex}`}
          id={title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')}
          className="font-display text-xl font-semibold text-white mt-10 mb-4 pb-2 border-b border-zinc-800 scroll-mt-24"
        >
          {title}
        </h2>
      );

      const rest = trimmedBlock.replace(/^## .*\n?/, '').trim();
      if (rest) {
        elements.push(...parseContent(rest, blockIndex));
      }
    } else {
      elements.push(...parseContent(trimmedBlock, blockIndex));
    }
  });

  return elements;
}

function parseContent(text: string, keyPrefix: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const parts = text.split(/(?:^|\n)(?=### )/);

  parts.forEach((part, partIndex) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('### ')) {
      const title = trimmed.replace(/^### /, '').split('\n')[0];
      elements.push(
        <h3
          key={`h3-${keyPrefix}-${partIndex}`}
          className="font-display text-lg font-semibold text-white mt-6 mb-3 text-indigo-300"
        >
          {title}
        </h3>
      );

      const rest = trimmed.replace(/^### .*\n?/, '').trim();
      if (rest) {
        elements.push(...parseListOrParagraph(rest, `${keyPrefix}-${partIndex}`));
      }
    } else {
      elements.push(...parseListOrParagraph(trimmed, `${keyPrefix}-${partIndex}`));
    }
  });

  return elements;
}

function parseListOrParagraph(text: string, keyPrefix: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((para, paraIndex) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Code block
    if (trimmed.startsWith('```')) {
      const match = trimmed.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (match) {
        const language = match[1] || 'code';
        const code = match[2].trim();
        elements.push(
          <div
            key={`code-${keyPrefix}-${paraIndex}`}
            className="my-6 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
              <span className="text-xs text-zinc-400 font-mono uppercase">{language}</span>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono text-zinc-300 whitespace-pre">{code}</code>
            </pre>
          </div>
        );
        return;
      }
    }

    // Table
    if (trimmed.includes('|') && trimmed.includes('---')) {
      const tableLines = trimmed.split('\n').filter((line) => line.trim().startsWith('|'));

      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .filter((c) => c.trim())
          .map((h) => h.trim());
        const rows = tableLines.slice(2);

        elements.push(
          <div key={`table-${keyPrefix}-${paraIndex}`} className="my-6 overflow-x-auto">
            <table className="w-full text-sm border border-zinc-700 rounded-xl overflow-hidden">
              <thead className="bg-zinc-800">
                <tr>
                  {headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-white font-semibold border-b border-zinc-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => {
                  const cells = row
                    .split('|')
                    .filter((c) => c.trim())
                    .map((c) => c.trim());
                  return (
                    <tr
                      key={rowIndex}
                      className="border-b border-zinc-700/50 hover:bg-zinc-800/30"
                    >
                      {cells.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 text-zinc-300">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        return;
      }
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quote = trimmed.replace(/^> /, '');
      elements.push(
        <blockquote
          key={`quote-${keyPrefix}-${paraIndex}`}
          className="my-6 border-l-4 border-indigo-500 pl-5 py-2 italic text-zinc-400 bg-zinc-800/30 rounded-r-xl"
        >
          {quote}
        </blockquote>
      );
      return;
    }

    // Horizontal rule
    if (trimmed === '---') {
      elements.push(
        <hr key={`hr-${keyPrefix}-${paraIndex}`} className="my-8 border-t border-zinc-700" />
      );
      return;
    }

    // List items
    if (trimmed.match(/^[-•*] /m) || trimmed.match(/^\d+\. /m)) {
      const isOrdered = /^\d+\. /m.test(trimmed);
      const isUnordered = /^[-•*] /m.test(trimmed);

      if (isOrdered) {
        const items = trimmed.split('\n').filter((line) => line.trim().match(/^\d+\. /));
        elements.push(
          <ol
            key={`ol-${keyPrefix}-${paraIndex}`}
            className="my-4 space-y-2 list-decimal list-inside"
          >
            {items.map((item, i) => {
              const text = item.replace(/^\d+\. /, '');
              return (
                <li key={i} className="text-zinc-300 pl-2">
                  {renderInline(text)}
                </li>
              );
            })}
          </ol>
        );
      } else if (isUnordered) {
        const items = trimmed.split('\n').filter((line) => line.trim().match(/^[-•*] /));
        elements.push(
          <ul
            key={`ul-${keyPrefix}-${paraIndex}`}
            className="my-4 space-y-2"
          >
            {items.map((item, i) => {
              const text = item.replace(/^[-•*] /, '');
              return (
                <li
                  key={i}
                  className="text-zinc-300 pl-4 relative"
                >
                  <span className="absolute left-0 text-indigo-400">•</span>
                  <span className="pl-3">{renderInline(text)}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      return;
    }

    // Regular paragraph
    if (trimmed) {
      elements.push(
        <p
          key={`p-${keyPrefix}-${paraIndex}`}
          className="text-zinc-300 leading-relaxed mb-4"
        >
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Split on bold, code blocks, and markdown links
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="mx-1 bg-zinc-800 px-2 py-1 rounded-lg text-pink-400 font-mono text-sm"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown links: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 hover:no-underline transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

// ─── FAQ Section Renderer ───────────────────────────────────────────────────

function FAQSection({ faqs }: { faqs: any[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-zinc-800">
      <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-indigo-400">❓</span> Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium list-none hover:bg-zinc-800/30 transition-colors">
              <span>{faq.question}</span>
              <span className="text-indigo-400 group-open:rotate-45 transition-transform text-xl ml-4">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-zinc-400 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ─── TL;DR Box ─────────────────────────────────────────────────────────────

function TLDNRBox({ excerpt }: { excerpt: string }) {
  return (
    <div className="mb-8 p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
      <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
        <span>⚡</span> Quick Summary
      </h3>
      <p className="text-zinc-300 text-sm leading-relaxed">{excerpt}</p>
    </div>
  );
}

// ─── Article Page Component ────────────────────────────────────────────────

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="section-heading mb-4">Article Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The article &quot;{slug}&quot; doesn&apos;t exist yet.
        </p>
        <Link href="/articles" className="btn-primary">
          Browse All Articles
        </Link>
      </div>
    );
  }

  const canonicalUrl = `https://decryptica.com/blog/${slug}`;
  const wordCount = estimateWordCount(article.content);
  const relatedArticles = getRelatedArticles(article, articles);

  // Auto-generate FAQs from the article content if none provided
  const faqs = article.faqs || generateAutoFAQs(article);

  const categoryNames: Record<string, string> = {
    crypto: 'Crypto & DeFi',
    ai: 'Artificial Intelligence',
    automation: 'Automation',
  };

  return (
    <>
      {/* JSON-LD Schemas */}
      <ArticleSchema article={article} url={canonicalUrl} />
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema slug={slug} category={article.category} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-white transition-colors">
            Articles
          </Link>
          <span>/</span>
          <Link
            href={`/topic/${article.category}`}
            className="hover:text-white transition-colors"
          >
            {categoryNames[article.category] || article.category}
          </Link>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[200px]">
            {article.title.length > 40
              ? article.title.slice(0, 40) + '...'
              : article.title}
          </span>
        </nav>

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
                  {categoryNames[article.category] || article.category}
                </Link>
                <span className="text-zinc-600">•</span>
                <span className="text-sm text-zinc-500">{article.readTime}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-sm text-zinc-500">{wordCount.toLocaleString()} words</span>
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

            {/* TL;DR Box */}
            <TLDNRBox excerpt={article.excerpt} />

            {/* Article Content */}
            <div className="prose prose-invert prose-zinc max-w-none">
              {renderContent(article.content)}
            </div>

            {/* FAQ Section */}
            <FAQSection faqs={faqs} />

            {/* Related Articles - Smart Topical Clusters */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 pt-8 border-t border-zinc-800">
                <h3 className="font-display font-semibold text-lg text-white mb-2 flex items-center gap-2">
                  <span className="text-indigo-400">→</span> Related Intelligence
                </h3>
                <p className="text-zinc-500 text-sm mb-6">
                  Explore more from Decryptica&apos;s topical clusters
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="card-elevated p-5 group"
                    >
                      <span className="text-xs text-indigo-400 mb-2 block">
                        {categoryNames[related.category] || related.category}
                      </span>
                      <h4 className="font-display font-semibold text-white group-hover:text-indigo-400 transition-colors leading-snug text-sm">
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
                <p className="text-zinc-300 text-sm leading-relaxed">{article.excerpt}</p>
              </div>

              {/* Article Stats */}
              <div className="card-elevated p-5">
                <h3 className="font-display font-semibold text-sm text-zinc-500 mb-4 uppercase tracking-wider">
                  Article Info
                </h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Published</dt>
                    <dd className="text-zinc-300">{article.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Words</dt>
                    <dd className="text-zinc-300">{wordCount.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Read time</dt>
                    <dd className="text-zinc-300">{article.readTime}</dd>
                  </div>
                  {article.lastUpdated && (
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Updated</dt>
                      <dd className="text-zinc-300">{article.lastUpdated}</dd>
                    </div>
                  )}
                </dl>
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
    </>
  );
}

// ─── Auto-Generate FAQs from Content ───────────────────────────────────────

function generateAutoFAQs(article: any): { question: string; answer: string }[] {
  const categoryFAQs: Record<string, { question: string; answer: string }[]> = {
    crypto: [
      {
        question: 'Is this still relevant in 2026?',
        answer:
          'The crypto space moves fast. We regularly update our articles to reflect the latest developments. Check the date and always verify with current sources before making decisions.',
      },
      {
        question: 'Where can I learn more about this topic?',
        answer:
          'Decryptica covers crypto, AI, and automation topics in depth. Browse our articles section or check the related articles above for more coverage.',
      },
    ],
    ai: [
      {
        question: 'Is AI really worth using for this?',
        answer:
          'Based on our research, AI tools have matured significantly. The right tool depends on your use case — our comparisons help you make informed decisions.',
      },
      {
        question: 'What AI tools are mentioned in this article?',
        answer:
          'We only mention real, currently-available tools with accurate pricing. All links go to official product pages.',
      },
    ],
    automation: [
      {
        question: 'Do I need coding skills for this?',
        answer:
          'It depends on the approach. Some solutions require no code (Zapier, Make, n8n basics), while advanced setups benefit from JavaScript or Python knowledge.',
      },
      {
        question: 'Is this free to implement?',
        answer:
          'We always mention free tiers, one-time costs, and subscription pricing. Most automation tools have free plans to get started.',
      },
    ],
  };

  return categoryFAQs[article.category] || [
    {
      question: 'Is this article still accurate?',
      answer:
        'We aim to keep articles updated. Check the date and verify with official sources for the most current information.',
    },
  ];
}
