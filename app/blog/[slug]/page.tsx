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
    return { 
      title: 'Article Not Found | Decryptica',
      robots: 'noindex'
    };
  }
  
  const canonicalUrl = `https://decryptica.com/blog/${slug}`;
  const ogImage = `https://decryptica.com/og/${slug}.jpg`;
  
  return {
    // Basic SEO
    title: `${article.title} | Decryptica`,
    description: article.excerpt,
    keywords: [article.category, 'crypto', 'ai', 'automation', 'technical'],
    authors: [{ name: 'Decryptica' }],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: 'index, follow',
    
    // Open Graph (Facebook, LinkedIn, Pinterest)
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: 'Decryptica',
      locale: 'en_US',
      type: 'article',
      publishedTime: article.date,
      authors: ['Decryptica'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
      site: '@decryptica',
      creator: '@decryptica'
    }
  };
}

// Content renderer with design standards
function renderContent(content: string) {
  const elements: React.ReactNode[] = [];
  const blocks = content.split(/(?:^|\n)(?=## )/);
  
  blocks.forEach((block, blockIndex) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;
    
    // Check if it's a heading block
    if (trimmedBlock.startsWith('## ')) {
      const title = trimmedBlock.replace(/^## /, '').split('\n')[0];
      elements.push(
        <h2 key={`h2-${blockIndex}`} className="font-display text-xl font-semibold text-white mt-10 mb-4 pb-2 border-b border-zinc-800">
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
  
  // First pass: extract and render ### headings within the text
  const parts = text.split(/(?:^|\n)(?=### )/);
  
  parts.forEach((part, partIndex) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    // Check if this part starts with ###
    if (trimmed.startsWith('### ')) {
      const title = trimmed.replace(/^### /, '').split('\n')[0];
      elements.push(
        <h3 key={`h3-${keyPrefix}-${partIndex}`} className="font-display text-lg font-semibold text-white mt-6 mb-3 text-indigo-300">
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
          <div key={`code-${keyPrefix}-${paraIndex}`} className="my-6 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
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
      const lines = trimmed.split('\n');
      const tableLines = lines.filter(line => line.trim().startsWith('|'));
      
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').filter(c => c.trim()).map(h => h.trim());
        const rows = tableLines.slice(2);
        
        elements.push(
          <div key={`table-${keyPrefix}-${paraIndex}`} className="my-6 overflow-x-auto">
            <table className="w-full text-sm border border-zinc-700 rounded-xl overflow-hidden">
              <thead className="bg-zinc-800">
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} className="px-4 py-3 text-left text-white font-semibold border-b border-zinc-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => {
                  const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
                  return (
                    <tr key={rowIndex} className="border-b border-zinc-700/50 hover:bg-zinc-800/30">
                      {cells.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 text-zinc-300">
                          {cell}
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
        <blockquote key={`quote-${keyPrefix}-${paraIndex}`} className="my-6 border-l-4 border-indigo-500 pl-5 py-2 italic text-zinc-400 bg-zinc-800/30 rounded-r-xl">
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
    
    // List items (only if starts with - or • or numbered)
    if (trimmed.match(/^[-•*] /m) || trimmed.match(/^\d+\. /m)) {
      const isOrdered = /^\d+\. /m.test(trimmed);
      const isUnordered = /^[-•*] /m.test(trimmed);
      
      if (isOrdered) {
        const items = trimmed.split('\n').filter(line => line.trim().match(/^\d+\. /));
        elements.push(
          <ol key={`ol-${keyPrefix}-${paraIndex}`} className="my-4 space-y-2 list-decimal list-inside">
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
        const items = trimmed.split('\n').filter(line => line.trim().match(/^[-•*] /));
        elements.push(
          <ul key={`ul-${keyPrefix}-${paraIndex}`} className="my-4 space-y-2">
            {items.map((item, i) => {
              const text = item.replace(/^[-•*] /, '');
              return (
                <li key={i} className="text-zinc-300 pl-4 relative">
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
        <p key={`p-${keyPrefix}-${paraIndex}`} className="text-zinc-300 leading-relaxed mb-4">
          {renderInline(trimmed)}
        </p>
      );
    }
  });
  
  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle bold (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    
    // Handle inline code (`code`)
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        return <code key={`${i}-${j}`} className="mx-1 bg-zinc-800 px-2 py-1 rounded-lg text-pink-400 font-mono text-sm">{cp.slice(1, -1)}</code>;
      }
      return cp;
    });
  });
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
            {renderContent(article.content)}
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