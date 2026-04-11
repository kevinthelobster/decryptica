import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TrackedLink from '../../../components/TrackedLink';
import IntentRouter from '../../../components/IntentRouter';
import IntentContextBanner from '../../../components/IntentContextBanner';
import RouteDepthTracker from '../../../components/RouteDepthTracker';
import { articles, getTopicBySlug } from '../../../data/articles';
import {
  getSubpillarBySlug,
  getSubpillarPath,
  getSubpillarsForPillar,
  inferSubpillarFromArticle,
  type PillarSlug,
} from '../../../data/topic-routing';

interface SubpillarPageProps {
  params: Promise<{
    pillar: string;
    subpillar: string;
  }>;
}

export async function generateMetadata({ params }: SubpillarPageProps): Promise<Metadata> {
  const { pillar, subpillar } = await params;
  const topic = getTopicBySlug(pillar);

  if (!topic) {
    return { title: 'Topic Not Found | Decryptica' };
  }

  const subpillarConfig = getSubpillarBySlug(pillar as PillarSlug, subpillar);
  if (!subpillarConfig) {
    return { title: 'Sub-Pillar Not Found | Decryptica' };
  }

  return {
    title: `${topic.name} ${subpillarConfig.name} | Decryptica`,
    description: subpillarConfig.description,
    alternates: {
      canonical: `https://decryptica.com${getSubpillarPath(pillar as PillarSlug, subpillar)}`,
    },
  };
}

export default async function SubpillarPage({ params }: SubpillarPageProps) {
  const { pillar, subpillar } = await params;
  const pillarSlug = pillar as PillarSlug;
  const topic = getTopicBySlug(pillarSlug);

  if (!topic) {
    notFound();
  }

  const currentSubpillar = getSubpillarBySlug(pillarSlug, subpillar);
  if (!currentSubpillar) {
    notFound();
  }

  const subpillars = getSubpillarsForPillar(pillarSlug);
  const articleCards = articles
    .filter((article) => article.category === pillarSlug)
    .filter((article) => inferSubpillarFromArticle(article) === subpillar);

  const adjacentSubpillars = subpillars.filter((item) => item.slug !== subpillar).slice(0, 3);

  const conversionHref = pillarSlug === 'ai'
    ? '/tools/ai-price-calculator'
    : pillarSlug === 'automation'
      ? '/services/ai-automation-consulting'
      : '/articles';

  const conversionLabel = pillarSlug === 'ai'
    ? 'Run AI ROI Calculator'
    : pillarSlug === 'automation'
      ? 'See Automation Consulting'
      : 'Explore Crypto Playbooks';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-28 md:pb-12">
      <RouteDepthTracker depth={2} pillar={pillarSlug} subpillar={subpillar} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/topic/${pillarSlug}`} className="hover:text-white transition-colors">{topic.name}</Link>
        <span>/</span>
        <span className="text-zinc-300">{currentSubpillar.name}</span>
      </nav>

      <section className="card-elevated p-7 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Sub-Pillar Index</p>
        <h1 className="mt-2 section-heading">{topic.name} {currentSubpillar.name}</h1>
        <p className="mt-3 text-zinc-400">{currentSubpillar.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {subpillars.map((item) => (
            <Link
              key={item.slug}
              href={getSubpillarPath(pillarSlug, item.slug)}
              className={[
                'rounded-full border px-3 py-2 text-sm transition-colors',
                item.slug === subpillar
                  ? 'border-indigo-400/70 bg-indigo-500/20 text-indigo-200'
                  : 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-indigo-400/60 hover:text-white',
              ].join(' ')}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8" id="next-step">
        <IntentContextBanner pageType="topic" category={pillarSlug} />
        <div className="mt-4">
          <IntentRouter location="topic_intent_router" category={pillarSlug} variant="compact" learnHref="#subpillar-articles" />
        </div>
      </section>

      <section id="subpillar-articles" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-white">Cluster Articles</h2>
          <span className="text-sm text-zinc-500">{articleCards.length} articles</span>
        </div>
        {articleCards.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articleCards.map((article) => (
              <TrackedLink
                key={article.id}
                href={`/blog/${article.slug}`}
                className="article-card p-6 group"
                eventType="article_click"
                articleSlug={article.slug}
                metadata={{
                  location: 'subpillar_articles',
                  pillar: pillarSlug,
                  subpillar,
                  category: pillarSlug,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-indigo-400 uppercase tracking-wider">{article.category}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs text-zinc-500">{article.readTime}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 line-clamp-3">{article.excerpt}</p>
              </TrackedLink>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-6 text-sm text-zinc-400">
            No articles are mapped to this sub-pillar yet. Use the adjacent sub-pillars below to keep exploring.
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {adjacentSubpillars.map((item) => (
          <TrackedLink
            key={item.slug}
            href={getSubpillarPath(pillarSlug, item.slug)}
            className="rounded-xl border border-zinc-800 bg-zinc-900/65 p-4 hover:border-indigo-400/50"
            eventType="hub_nav_click"
            metadata={{
              location: 'subpillar_adjacent_links',
              pillar: pillarSlug,
              subpillar,
              targetSubpillar: item.slug,
              category: pillarSlug,
            }}
          >
            <p className="text-xs text-indigo-300 uppercase tracking-wider">Adjacent</p>
            <h3 className="mt-1 font-display text-lg text-white">{item.name}</h3>
            <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
          </TrackedLink>
        ))}
      </section>

      <section className="mt-10">
        <div className="card-elevated p-6 md:p-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Next Step</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white">Move from research to execution</h2>
          </div>
          <TrackedLink
            href={conversionHref}
            className="btn-primary"
            eventType="hub_secondary_cta_click"
            metadata={{
              location: 'subpillar_conversion',
              cta: 'next_step',
              pillar: pillarSlug,
              subpillar,
              category: pillarSlug,
            }}
          >
            {conversionLabel}
          </TrackedLink>
        </div>
      </section>
    </div>
  );
}
