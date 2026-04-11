import Link from 'next/link';
import { Metadata } from 'next';
import { getArticleBySlug, articles } from '../../data/articles';
import SubscribeForm from '../../components/SubscribeForm';
import AnalyticsTracker from '../../components/AnalyticsTracker';
import ArticleProgressNav from '../../components/ArticleProgressNav';
import MidArticleLeadCapture from '../../components/MidArticleLeadCapture';
import MobileProgressSheet from '../../components/MobileProgressSheet';
import MobileStickyCtaDock from '../../components/MobileStickyCtaDock';
import TrackedLink from '../../components/TrackedLink';
import IntentContextBanner from '../../components/IntentContextBanner';
import IntentAwareConversionStrip from '../../components/IntentAwareConversionStrip';
import TrackedFAQSection from '../../components/TrackedFAQSection';
import HubSectionNav from '../../components/HubSectionNav';
import HubRelatedModule from '../../components/HubRelatedModule';
import { ArticleMilestoneStrip, ArticleSerpPromiseModules } from '../../components/ArticleSerpPromiseModules';
import RouteDepthTracker from '../../components/RouteDepthTracker';
import { getSubpillarBySlug, getSubpillarPath, inferSubpillarFromArticle, type PillarSlug } from '../../data/topic-routing';

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

function BreadcrumbSchema({
  slug,
  category,
  subpillar,
  subpillarName,
}: {
  slug: string;
  category: string;
  subpillar: string;
  subpillarName: string;
}) {
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
        name: categoryNames[category] || category,
        item: `https://decryptica.com/topic/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: subpillarName,
        item: `https://decryptica.com/topic/${category}/${subpillar}`,
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

function extractHeadings(content: string): { id: string; label: string }[] {
  const headingMatches = content.match(/^##\s+.+$/gm) || [];
  return headingMatches.map((line) => {
    const label = line.replace(/^##\s+/, '').trim();
    const id = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return { id, label };
  });
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

function getIntentBadgeFromTitle(title: string): 'Learn' | 'Calculate' | 'Implement' {
  const lower = title.toLowerCase();
  if (lower.includes('best') || lower.includes('vs') || lower.includes('compare')) {
    return 'Calculate';
  }
  if (lower.includes('how to') || lower.includes('setup') || lower.includes('guide')) {
    return 'Implement';
  }
  return 'Learn';
}

function toRelatedModuleItems(related: any[]) {
  return related.slice(0, 3).map((item) => ({
    href: `/blog/${item.slug}`,
    title: item.title,
    valueProp: item.excerpt,
    readTime: item.readTime,
    intentBadge: getIntentBadgeFromTitle(item.title),
    articleSlug: item.slug,
  }));
}

// ─── SEO Copy Framework: Headline/Deck Conventions by Surface ──────────────
//
// AI surface: How-to titles, tool comparisons, implementation guides
// Crypto surface: Analysis, explainers, price/risk comparisons
// Automation surface: Step-by-step setup, tool tutorials, workflow guides

function getHeadlineIntentPattern(category: string, title: string): string {
  // Returns the intent classification for the headline
  const lowerTitle = title.toLowerCase();
  if (category === 'ai') {
    if (lowerTitle.includes('best') || lowerTitle.includes('top')) return 'comparison';
    if (lowerTitle.includes('how to') || lowerTitle.includes('guide')) return 'howto';
    return 'tool_focus';
  }
  if (category === 'crypto') {
    if (lowerTitle.includes('vs') || lowerTitle.includes('compare')) return 'comparison';
    if (lowerTitle.includes('analysis') || lowerTitle.includes('why')) return 'analysis';
    return 'explainer';
  }
  if (category === 'automation') {
    if (lowerTitle.includes('how to') || lowerTitle.includes('setup')) return 'step_setup';
    if (lowerTitle.includes('best') || lowerTitle.includes('top')) return 'comparison';
    return 'workflow';
  }
  return 'generic';
}

// ─── SEO Copy Framework: Meta Title/Description Variants (CTR Tests) ────────

function getMetaVariants(article: any): { metaTitle: string; metaDesc: string; variantB: { title: string; description: string } } {
  const category = article.category as string;
  const title = article.title;
  const baseDesc = article.excerpt;

  // Primary meta (current default)
  const metaTitle = `${title} | Decryptica`;
  const metaDesc = baseDesc;

  // Variant B: punchier, action-oriented (for A/B CTR testing)
  const intent = getHeadlineIntentPattern(category, title);
  let variantBTitle = metaTitle;
  let variantBDesc = metaDesc;

  if (intent === 'comparison') {
    variantBTitle = `${title.split(' vs ')[0]} vs ${title.split(' vs ')[1] || title.split('-')[1] || 'Alternatives'} — Which Wins in 2026?`;
    variantBDesc = `Deep comparison of ${title.split(' vs ')[0] || title.split('-')[0] || title}. Pros, cons, pricing, and real-world performance compared.`;
  } else if (intent === 'howto') {
    const topic = title.replace(/^How to\s+/i, '').replace(/\s+[-—].*$/, '');
    variantBTitle = `${topic}: Complete 2026 Implementation Guide`;
    variantBDesc = `Step-by-step ${topic.toLowerCase()} guide with real examples. Updated for 2026 — save hours of research.`;
  } else if (intent === 'analysis') {
    variantBTitle = `${title} — What the Data Actually Shows`;
    variantBDesc = `Beyond the headlines: data-driven analysis of ${title.split("'")[1] || title.split(' ').slice(0, 3).join(' ')}. Read before you decide.`;
  } else if (intent === 'step_setup') {
    const tool = title.replace(/^How to\s+/i, '').replace(/\s+in.*$/i, '').replace(/\s+with.*$/i, '');
    variantBTitle = `How to Set Up ${tool}: Free Automation Walkthrough (2026)`;
    variantBDesc = `${tool} automation setup in plain English. No coding required. Save 5+ hours weekly with this step-by-step guide.`;
  } else if (intent === 'explainer') {
    variantBTitle = `${title} — Explained Simply`;
    variantBDesc = `Plain-English explainer: ${baseDesc.slice(0, 120)}...`;
  } else if (intent === 'tool_focus') {
    variantBTitle = `${title} — Ranked & Reviewed (2026)`;
    variantBDesc = `We tested the top ${title.split(' ')[2] || 'options'} so you don't have to. Full comparison inside.`;
  }

  return { metaTitle, metaDesc, variantB: { title: variantBTitle, description: variantBDesc } };
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
  const { metaTitle, metaDesc } = getMetaVariants(article);

  return {
    title: metaTitle,
    description: metaDesc,
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

function renderContent(
  content: string,
  insertions?: {
    trustStrip?: React.ReactNode;
    midCapture?: React.ReactNode;
    relatedMid?: React.ReactNode;
  }
) {
  const elements: React.ReactNode[] = [];
  const blocks = content.split(/(?:^|\n)(?=## )/);
  let majorSectionsSeen = 0;
  let trustInserted = false;
  let relatedInserted = false;
  let midInserted = false;

  blocks.forEach((block, blockIndex) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    if (trimmedBlock.startsWith('## ')) {
      majorSectionsSeen += 1;
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

      if (majorSectionsSeen === 1 && insertions?.trustStrip && !trustInserted) {
        elements.push(<div key="trust-strip">{insertions.trustStrip}</div>);
        trustInserted = true;
      }

      if (majorSectionsSeen === 2 && insertions?.relatedMid && !relatedInserted) {
        elements.push(<div key="related-mid">{insertions.relatedMid}</div>);
        relatedInserted = true;
      }

      if (majorSectionsSeen === 3 && insertions?.midCapture && !midInserted) {
        elements.push(<div key="mid-capture">{insertions.midCapture}</div>);
        midInserted = true;
      }
    } else {
      elements.push(...parseContent(trimmedBlock, blockIndex));
    }
  });

  if (!trustInserted && insertions?.trustStrip) {
    elements.unshift(<div key="trust-strip-fallback">{insertions.trustStrip}</div>);
  }

  if (!midInserted && insertions?.midCapture) {
    elements.push(<div key="mid-capture-fallback">{insertions.midCapture}</div>);
  }

  if (!relatedInserted && insertions?.relatedMid) {
    elements.push(<div key="related-mid-fallback">{insertions.relatedMid}</div>);
  }

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

function FreshnessEvidenceStrip({
  article,
  methodAnchorId,
}: {
  article: any;
  methodAnchorId: string;
}) {
  const updated = article.lastUpdated || article.date;
  const sourcesReviewed = Number(article?.sourcesReviewed);
  const hasSourcesCount = Number.isFinite(sourcesReviewed) && sourcesReviewed > 0;

  return (
    <section
      className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3"
      aria-label="Freshness and evidence"
    >
      <ul className="grid gap-2 sm:grid-cols-3">
        <li className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
          <span className="text-zinc-500">Last updated:</span> {updated}
        </li>
        <li className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
          <span className="text-zinc-500">Sources reviewed:</span>{' '}
          {hasSourcesCount ? sourcesReviewed : 'Editorially reviewed'}
        </li>
        <li className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
          <span className="text-zinc-500">Method:</span>{' '}
          <a href={`#${methodAnchorId}`} className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200">
            View methodology
          </a>
        </li>
      </ul>
    </section>
  );
}

// ─── SEO Copy Framework: Funnel-Stage CTA Blocks ───────────────────────────
// EXPLORE (top of funnel): Awareness — "learn more" intent
// COMPARE (mid funnel): Consideration — "evaluate options" intent
// START (bottom of funnel): Decision — "get started now" intent

function CTAExplore({ articleSlug, category }: { articleSlug: string; category: string }) {
  const categoryContent: Record<string, { heading: string; body: string; cta: string; href: string }> = {
    ai: {
      heading: 'Explore AI Tools & Guides',
      body: 'Discover how teams are using AI to automate workflows, cut costs, and ship faster in 2026.',
      cta: 'Browse AI Articles',
      href: '/topic/ai/tooling',
    },
    crypto: {
      heading: 'Stay Ahead of Crypto Markets',
      body: 'Data-driven crypto analysis and DeFi guides to help you make smarter investment decisions.',
      cta: 'Explore Crypto Content',
      href: '/topic/crypto/trading',
    },
    automation: {
      heading: 'Automate Your Workflow',
      body: 'Step-by-step guides to automate repetitive tasks and reclaim hours every week.',
      cta: 'See Automation Guides',
      href: '/topic/automation/workflows',
    },
  };
  const content = categoryContent[category] || categoryContent.ai;
  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 md:hover:-translate-y-0.5 md:hover:border-indigo-400/40 md:focus-within:-translate-y-0.5 md:focus-within:border-indigo-400/40">
      <h4 className="font-display text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">
        Explore
      </h4>
      <p className="text-white font-medium mb-1">{content.heading}</p>
      <p className="text-zinc-400 text-sm mb-3">{content.body}</p>
      <TrackedLink
        href={content.href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        eventType="cta_click"
        articleSlug={articleSlug}
        metadata={{ location: 'article_conversion_strip', cta: 'explore_topic', category, funnel: 'explore' }}
      >
        {content.cta} →
      </TrackedLink>
    </div>
  );
}

function CTACompare({ articleSlug, category, title }: { articleSlug: string; category: string; title: string }) {
  const categoryContent: Record<string, { heading: string; body: string; cta: string; href: string }> = {
    ai: {
      heading: 'Compare AI Models & Tools',
      body: 'Not sure which AI tool fits your needs? See head-to-head comparisons of the top options.',
      cta: 'View AI Comparisons',
      href: '/articles',
    },
    crypto: {
      heading: 'Compare Crypto Strategies',
      body: 'Evaluate different approaches to DeFi, staking, and portfolio allocation side by side.',
      cta: 'See Comparison Guides',
      href: '/articles',
    },
    automation: {
      heading: 'Compare Automation Tools',
      body: 'Zapier vs Make vs n8n? We break down pricing, features, and real-world use cases.',
      cta: 'Browse Comparisons',
      href: '/articles',
    },
  };
  const content = categoryContent[category] || categoryContent.ai;
  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 md:hover:-translate-y-0.5 md:hover:border-blue-400/40 md:focus-within:-translate-y-0.5 md:focus-within:border-blue-400/40">
      <h4 className="font-display text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">
        Compare
      </h4>
      <p className="text-white font-medium mb-1">{content.heading}</p>
      <p className="text-zinc-400 text-sm mb-3">{content.body}</p>
      <TrackedLink
        href={content.href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        eventType="cta_click"
        articleSlug={articleSlug}
        metadata={{ location: 'article_conversion_strip', cta: 'compare_tools', category, funnel: 'compare' }}
      >
        {content.cta} →
      </TrackedLink>
    </div>
  );
}

function CTAStart({ articleSlug, category }: { articleSlug: string; category: string }) {
  return (
    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 transition-all duration-200 md:hover:-translate-y-0.5 md:hover:border-purple-400/40 md:focus-within:-translate-y-0.5 md:focus-within:border-purple-400/40">
      <h4 className="font-display text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
        Get Started
      </h4>
      <p className="text-white font-medium mb-1">Ready to put this into practice?</p>
      <p className="text-zinc-400 text-sm mb-3">Get the latest implementation guides and tool walkthroughs delivered to your inbox.</p>
      <TrackedLink
        href="#subscribe"
        className="btn-primary"
        eventType="cta_click"
        articleSlug={articleSlug}
        metadata={{ location: 'article_conversion_strip', cta: 'start_workflow', category, funnel: 'start' }}
      >
        Subscribe for Free
      </TrackedLink>
    </div>
  );
}

// ─── SEO Copy Framework: ConversionStrip with Funnel-Stage CTAs ─────────────

function ConversionStrip({ articleSlug, category, title }: { articleSlug: string; category: string; title: string }) {
  return (
    <section className="mt-10 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-purple-500/5 p-6 md:p-8">
      {/* Meta variant data for CTR testing — hidden from users, visible to crawlers */}
      <meta name="decryptica:meta:variant" content="explore|compare|start" />
      <div className="grid md:grid-cols-3 gap-4">
        <CTAExplore articleSlug={articleSlug} category={category} />
        <CTACompare articleSlug={articleSlug} category={category} title={title} />
        <CTAStart articleSlug={articleSlug} category={category} />
      </div>
    </section>
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
  const relatedModuleItems = toRelatedModuleItems(relatedArticles);
  const headings = extractHeadings(article.content);

  // Auto-generate FAQs from the article content if none provided
  const faqs = article.faqs || generateAutoFAQs(article);

  const categoryNames: Record<string, string> = {
    crypto: 'Crypto & DeFi',
    ai: 'Artificial Intelligence',
    automation: 'Automation',
  };

  const navSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'key-questions', label: 'Key Questions' },
    { id: 'tools-comparisons', label: 'Tools/Comparisons' },
    { id: 'next-step', label: 'Next Step' },
  ];
  const subpillarSlug = inferSubpillarFromArticle(article);
  const subpillarConfig = getSubpillarBySlug(article.category as PillarSlug, subpillarSlug);
  const subpillarName = subpillarConfig?.name || subpillarSlug;
  const subpillarPath = getSubpillarPath(article.category as PillarSlug, subpillarSlug);

  return (
    <>
      {/* JSON-LD Schemas */}
      <ArticleSchema article={article} url={canonicalUrl} />
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema
        slug={slug}
        category={article.category}
        subpillar={subpillarSlug}
        subpillarName={subpillarName}
      />
      <AnalyticsTracker articleSlug={slug} category={article.category} />
      <RouteDepthTracker depth={3} pillar={article.category} subpillar={subpillarSlug} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/topic/${article.category}`}
            className="hover:text-white transition-colors"
          >
            {categoryNames[article.category] || article.category}
          </Link>
          <span>/</span>
          <Link href={subpillarPath} className="hover:text-white transition-colors">
            {subpillarName}
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
            <header id="overview" className="mb-8 scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href={`/topic/${article.category}`}
                  className="topic-tag hover:bg-indigo-500/20 transition-colors"
                >
                  {categoryNames[article.category] || article.category}
                </Link>
                <Link
                  href={subpillarPath}
                  className="topic-tag hover:bg-indigo-500/20 transition-colors"
                >
                  {subpillarName}
                </Link>
                {/* Editorial State Indicator */}
                {article.status && article.status !== 'published' && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      article.status === 'draft'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        : article.status === 'in_review'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : article.status === 'archived'
                        ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        : 'bg-green-500/10 text-green-400 border-green-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        article.status === 'draft'
                          ? 'bg-yellow-400'
                          : article.status === 'in_review'
                          ? 'bg-blue-400'
                          : article.status === 'archived'
                          ? 'bg-zinc-400'
                          : 'bg-green-400'
                      }`}
                    />
                    {article.status === 'in_review' ? 'In Review' : article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  </span>
                )}
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

            <IntentContextBanner pageType="article" category={article.category} articleSlug={slug} />

            <div className="mb-8">
              <HubSectionNav
                sections={navSections}
                surface="article"
                category={article.category}
                slug={slug}
                location="article_local_nav"
                moduleVariant="sticky"
              />
            </div>

            <ArticleMilestoneStrip articleSlug={slug} category={article.category} />
            <FreshnessEvidenceStrip article={article} methodAnchorId="methodology" />

            {/* Subscribe Banner */}
            <div
              id="subscribe"
              className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl"
            >
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                Stay ahead of the curve
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                Get weekly technical intelligence delivered to your inbox. No fluff, just signal.
              </p>
              <SubscribeForm />
            </div>

            <section id="key-questions" className="scroll-mt-28">
              <TLDNRBox excerpt={article.excerpt} />
              <ArticleSerpPromiseModules
                articleSlug={slug}
                category={article.category}
                title={article.title}
                excerpt={article.excerpt}
              />
            </section>

            {/* Article Content */}
            <section id="tools-comparisons" className="scroll-mt-28">
              <div id="article-content" className="prose prose-invert prose-zinc max-w-none article-reading-body">
                <div className="max-w-[75ch]">
                  {renderContent(article.content, {
                    relatedMid: (
                      <HubRelatedModule
                        heading="Related Guides"
                        description="Continue with adjacent implementation and comparison guides."
                        items={relatedModuleItems}
                        surface="article"
                        location="article_related_module"
                        moduleVariant="mid_article"
                        slug={slug}
                        category={article.category}
                      />
                    ),
                    midCapture: <MidArticleLeadCapture articleSlug={slug} category={article.category} />,
                  })}
                </div>
              </div>
            </section>

            <section id="methodology" className="mt-8 scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-950/65 p-4">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-zinc-400">Method & Sources</h3>
              <p className="mt-2 text-sm text-zinc-300">
                Articles are reviewed by Decryptica editorial and updated when source conditions change. Treat this content as informational research, then validate assumptions with current primary data before execution.
              </p>
            </section>

            {/* FAQ Section */}
            <TrackedFAQSection faqs={faqs} articleSlug={slug} />

            <section id="next-step" className="scroll-mt-28">
              <IntentAwareConversionStrip articleSlug={slug} category={article.category} />
            </section>

            {relatedModuleItems.length > 0 && (
              <section className="mt-12 pt-8 border-t border-zinc-800">
                <HubRelatedModule
                  heading="Related Guides"
                  description="Keep reading with matched intent and adjacent comparisons."
                  items={relatedModuleItems}
                  surface="article"
                  location="article_related_module"
                  moduleVariant="post_content"
                  slug={slug}
                  category={article.category}
                />
              </section>
            )}

            <div id="article-end-marker" />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <ArticleProgressNav articleSlug={slug} category={article.category} headings={headings} />

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
                    href="/topic/crypto/trading"
                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
                  >
                    <span>₿</span>
                    <span>Crypto & DeFi</span>
                    <span className="ml-auto text-zinc-600 group-hover:text-indigo-400">→</span>
                  </Link>
                  <Link
                    href="/topic/ai/tooling"
                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm group"
                  >
                    <span>🤖</span>
                    <span>Artificial Intelligence</span>
                    <span className="ml-auto text-zinc-600 group-hover:text-indigo-400">→</span>
                  </Link>
                  <Link
                    href="/topic/automation/workflows"
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
      <MobileProgressSheet articleSlug={slug} category={article.category} headings={headings} />
      <MobileStickyCtaDock articleSlug={slug} category={article.category} endMarkerId="article-end-marker" />
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
      {
        question: 'Are the tools and services mentioned free to use?',
        answer:
          'We always note free tiers, trial periods, and paid features. Check individual tool websites for the most current pricing information.',
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
      {
        question: 'How do these AI tools compare to each other?',
        answer:
          'We evaluate AI tools across key dimensions including accuracy, ease of use, pricing, and real-world performance. Our verdicts are based on hands-on testing.',
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
      {
        question: 'How long does setup typically take?',
        answer:
          'Simple automations can be set up in 15–30 minutes. More complex workflows involving multiple integrations may take a few hours to configure properly.',
      },
    ],
  };

  return categoryFAQs[article.category] || [
    {
      question: 'Is this article still accurate?',
      answer:
        'We aim to keep articles updated. Check the date and verify with official sources for the most current information.',
    },
    {
      question: 'What tools are covered in this article?',
      answer:
        'We research and cover real, currently-available tools. All products mentioned are verified before publication.',
    },
    {
      question: 'How often is this content updated?',
      answer:
        'We review articles monthly and update them when tools change pricing, features, or availability.',
    },
  ];
}
