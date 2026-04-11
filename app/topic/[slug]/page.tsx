import Link from 'next/link';
import { Metadata } from 'next';
import type { ReactNode } from 'react';
import IntentRouter from '../../components/IntentRouter';
import IntentContextBanner from '../../components/IntentContextBanner';
import TrackedLink from '../../components/TrackedLink';
import HubSectionNav from '../../components/HubSectionNav';
import HubRelatedModule from '../../components/HubRelatedModule';
import RouteDepthTracker from '../../components/RouteDepthTracker';
import { articles, getTopicBySlug, getArticlesByCategory } from '../../data/articles';
import { getSubpillarPath, getSubpillarsForPillar, type PillarSlug } from '../../data/topic-routing';

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
      canonical: `https://decryptica.com/topic/${slug}`,
    },
  };
}

const topicIcons: Record<string, ReactNode> = {
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

function getTopicSecondaryCta(slug: PillarSlug) {
  if (slug === 'ai') {
    return {
      href: '/tools/ai-price-calculator',
      label: 'Compare AI Costs',
      cta: 'calculate',
    } as const;
  }

  if (slug === 'automation') {
    return {
      href: '/services/ai-automation-consulting',
      label: 'See Automation Examples',
      cta: 'implement',
    } as const;
  }

  return {
    href: '/articles',
    label: 'Compare Crypto Playbooks',
    cta: 'learn',
  } as const;
}

function getIntentBadge(title: string): 'Learn' | 'Calculate' | 'Implement' {
  const lower = title.toLowerCase();
  if (lower.includes('vs') || lower.includes('best') || lower.includes('compare')) {
    return 'Calculate';
  }
  if (lower.includes('how to') || lower.includes('setup') || lower.includes('guide')) {
    return 'Implement';
  }
  return 'Learn';
}

function getContinueLearningItems(topicCategory: PillarSlug, topicArticles: ReturnType<typeof getArticlesByCategory>) {
  const adjacentByCategory: Record<PillarSlug, PillarSlug> = {
    ai: 'automation',
    automation: 'ai',
    crypto: 'ai',
  };

  const sameIntent = topicArticles[0];
  const adjacentIntent = articles.find((item) => item.category === adjacentByCategory[topicCategory]);
  const evergreen =
    articles.find((item) => /how to|guide|best|vs|compare/i.test(item.title) && item.slug !== sameIntent?.slug) ||
    topicArticles[1];

  return [sameIntent, adjacentIntent, evergreen]
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 3)
    .map((item) => ({
      href: `/blog/${item.slug}`,
      title: item.title,
      valueProp: item.excerpt,
      readTime: item.readTime,
      intentBadge: getIntentBadge(item.title),
      articleSlug: item.slug,
    }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  const topicCategory = slug as PillarSlug;
  const topicArticles = getArticlesByCategory(topicCategory);
  const secondaryCta = getTopicSecondaryCta(topicCategory);
  const subpillars = getSubpillarsForPillar(topicCategory);

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

  const keyQuestions = topicArticles.slice(0, 3).map((article) => article.title);
  const comparisonSet = topicArticles
    .filter((article) => /best|vs|compare|guide|setup|how to/i.test(article.title))
    .slice(0, 3);

  const navSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'key-questions', label: 'Key Questions' },
    { id: 'tools-comparisons', label: 'Tools/Comparisons' },
    { id: 'next-step', label: 'Next Step' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-28 md:pb-12">
      <RouteDepthTracker depth={1} pillar={topicCategory} />

      <section id="overview" className="mb-8 scroll-mt-28">
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
              <p className="text-zinc-400 text-lg leading-relaxed">{topic.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {subpillars.map((subpillar) => (
                  <TrackedLink
                    key={subpillar.slug}
                    href={getSubpillarPath(topicCategory, subpillar.slug)}
                    className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-400/50 hover:text-white transition-colors"
                    eventType="hub_nav_click"
                    metadata={{
                      location: 'topic_subpillar_chips',
                      category: topicCategory,
                      pillar: topicCategory,
                      subpillar: subpillar.slug,
                    }}
                  >
                    {subpillar.name}
                  </TrackedLink>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <TrackedLink
                  href="/#subscribe"
                  className="btn-primary"
                  eventType="hub_primary_cta_click"
                  metadata={{
                    surface: 'topic',
                    location: 'topic_hero',
                    moduleVariant: 'primary',
                    cta: 'learn',
                    slug,
                    category: topicCategory,
                  }}
                >
                  Get Weekly Brief
                </TrackedLink>
                <TrackedLink
                  href={secondaryCta.href}
                  className="btn-secondary"
                  eventType="hub_secondary_cta_click"
                  metadata={{
                    surface: 'topic',
                    location: 'topic_hero',
                    moduleVariant: 'secondary',
                    cta: secondaryCta.cta,
                    slug,
                    category: topicCategory,
                  }}
                >
                  {secondaryCta.label}
                </TrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-10">
        <HubSectionNav
          sections={navSections}
          surface="topic"
          category={topicCategory}
          slug={slug}
          location="topic_local_nav"
          moduleVariant="sticky"
        />
      </div>

      <section id="key-questions" className="scroll-mt-28 mb-10">
        <div className="card-elevated p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Key Questions</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">Start with the highest-signal reads</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {keyQuestions.map((question, index) => (
              <li key={`${question}-${index}`} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300">
                {question}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <HubRelatedModule
            heading="Continue Learning"
            description="Same intent, adjacent intent, and one evergreen pick to deepen this topic cluster."
            items={getContinueLearningItems(topicCategory, topicArticles)}
            surface="topic"
            location="topic_continue_learning"
            moduleVariant="after_first_section"
            slug={slug}
            category={topicCategory}
          />
        </div>
      </section>

      <section id="tools-comparisons" className="scroll-mt-28 mb-10">
        <div className="card-elevated p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Tools & Comparisons</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">Operator-focused implementation guides</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {(comparisonSet.length > 0 ? comparisonSet : topicArticles.slice(0, 3)).map((article) => (
              <TrackedLink
                key={article.id}
                href={`/blog/${article.slug}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-indigo-400/40"
                eventType="related_module_click"
                articleSlug={article.slug}
                metadata={{
                  surface: 'topic',
                  location: 'topic_tools_comparisons',
                  moduleVariant: 'grid',
                  slug,
                  category: topicCategory,
                  cta: 'related_guide',
                }}
              >
                <span className="text-xs text-indigo-400">{article.readTime}</span>
                <h3 className="mt-2 font-display text-sm font-semibold text-white">{article.title}</h3>
                <p className="mt-2 text-xs text-zinc-400">{article.excerpt}</p>
              </TrackedLink>
            ))}
          </div>
        </div>
      </section>

      <section id="next-step" className="scroll-mt-28 mb-10 space-y-4">
        <IntentContextBanner pageType="topic" category={topicCategory} />
        <IntentRouter
          location="topic_intent_router"
          category={topicCategory}
          variant="compact"
          learnHref="#latest-articles"
        />
      </section>

      {topicArticles.length > 0 ? (
        <section id="latest-articles" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-24">
          {topicArticles.map((article) => (
            <TrackedLink
              key={article.id}
              href={`/blog/${article.slug}`}
              className="article-card p-6 group"
              eventType="article_click"
              articleSlug={article.slug}
              metadata={{ location: 'topic_latest_articles', sourceTopic: slug, category: topicCategory }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{article.category}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-500">{article.readTime}</span>
              </div>
              <h2 className="font-display font-semibold text-lg text-white mb-3 group-hover:text-indigo-400 transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{article.date}</span>
                <span className="text-xs text-indigo-400 font-medium group-hover:underline">Read more →</span>
              </div>
            </TrackedLink>
          ))}
        </section>
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
