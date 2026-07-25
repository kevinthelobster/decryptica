import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RouteDepthTracker from '../../components/RouteDepthTracker';
import SubscribeForm from '../../components/SubscribeForm';
import TrackedLink from '../../components/TrackedLink';
import { articles, getTopicBySlug } from '../../data/articles';
import {
  getSubpillarPath,
  getSubpillarsForPillar,
  inferSubpillarFromArticle,
  type PillarSlug,
} from '../../data/topic-routing';
import { getBreadcrumbSchema, jsonLdScript } from '../../lib/schema';

interface PillarPageProps {
  params: Promise<{
    pillar: string;
  }>;
}

const PILLAR_GUIDES: Record<PillarSlug, {
  label: string;
  headline: string;
  deck: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  retentionPrompt: string;
  decisionLanes: Array<{
    label: string;
    title: string;
    description: string;
    href: string;
  }>;
}> = {
  ai: {
    label: 'AI Hub',
    headline: 'Practical AI tools, agents, costs, and implementation paths',
    deck:
      'Start here when you need to choose an AI stack, pressure-test model costs, or figure out which workflows are worth automating first.',
    primaryHref: '/tools/ai-price-calculator',
    primaryLabel: 'Estimate AI Costs',
    secondaryHref: '/prompts',
    secondaryLabel: 'Browse Prompts',
    retentionPrompt: 'Best next step for AI readers: compare cost, pick a use case, then move into implementation guidance.',
    decisionLanes: [
      {
        label: 'Cost',
        title: 'Model spend and vendor choice',
        description: 'Compare token pricing, stack tradeoffs, and where hosted, local, or hybrid AI makes economic sense.',
        href: '/tools/ai-price-calculator',
      },
      {
        label: 'Workflow',
        title: 'Real business use cases',
        description: 'See where AI belongs in support, operations, internal knowledge, and repeatable team workflows.',
        href: '/topic/ai/use-cases',
      },
      {
        label: 'Build',
        title: 'Agents and tooling',
        description: 'Move from model curiosity into orchestration, evaluation, observability, and rollout discipline.',
        href: '/topic/ai/agents',
      },
    ],
  },
  crypto: {
    label: 'Crypto Hub',
    headline: 'Crypto market structure, wallets, DeFi, and trading infrastructure',
    deck:
      'Use this hub to move from broad crypto research into the specific custody, trading, and protocol questions that affect real decisions.',
    primaryHref: '/topic/crypto/trading',
    primaryLabel: 'Read Market Guides',
    secondaryHref: '/topic/crypto/wallets',
    secondaryLabel: 'Review Wallets',
    retentionPrompt: 'Best next step for crypto readers: understand the market, secure custody, then evaluate infrastructure.',
    decisionLanes: [
      {
        label: 'Markets',
        title: 'Trading signals and infrastructure',
        description: 'Track ETF flows, RPC providers, execution constraints, and the market plumbing behind crypto moves.',
        href: '/topic/crypto/trading',
      },
      {
        label: 'Custody',
        title: 'Wallets and self-custody',
        description: 'Compare wallets, backup practices, and operational habits before moving meaningful balances.',
        href: '/topic/crypto/wallets',
      },
      {
        label: 'Protocols',
        title: 'DeFi risk and opportunity',
        description: 'Evaluate liquidity, chain effects, protocol design, and where DeFi participation gets fragile.',
        href: '/topic/crypto/defi',
      },
    ],
  },
  automation: {
    label: 'Automation Hub',
    headline: 'Workflow automation, reliability, and AI implementation planning',
    deck:
      'Use this hub to sort workflow ideas, spot reliability risks, and decide when an automation project needs a stronger implementation plan.',
    primaryHref: '/services/ai-automation-consulting',
    primaryLabel: 'Scope Automation Help',
    secondaryHref: '/topic/automation/workflows',
    secondaryLabel: 'Browse Workflows',
    retentionPrompt: 'Best next step for automation readers: identify the workflow, design the handoff, then validate reliability.',
    decisionLanes: [
      {
        label: 'Process',
        title: 'Workflow design',
        description: 'Map triggers, routing, approvals, and exception handling before picking another automation tool.',
        href: '/topic/automation/workflows',
      },
      {
        label: 'Reliability',
        title: 'Queues, webhooks, and failure states',
        description: 'Understand what breaks at scale and how to build automation that survives real operations.',
        href: '/topic/automation/infrastructure',
      },
      {
        label: 'Tooling',
        title: 'Platform selection',
        description: 'Compare no-code tools, iPaaS platforms, internal tooling, and AI workflow vendors with clearer tradeoffs.',
        href: '/topic/automation/tooling',
      },
    ],
  },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function generateStaticParams() {
  return (Object.keys(PILLAR_GUIDES) as PillarSlug[]).map((pillar) => ({ pillar }));
}

export async function generateMetadata({ params }: PillarPageProps): Promise<Metadata> {
  const { pillar } = await params;
  const topic = getTopicBySlug(pillar);
  const guide = PILLAR_GUIDES[pillar as PillarSlug];

  if (!topic || !guide) {
    return { title: 'Topic Not Found | Decryptica' };
  }

  return {
    title: `${topic.name} Hub | Decryptica`,
    description: guide.deck,
    alternates: {
      canonical: `https://decryptica.com/topic/${pillar}`,
    },
  };
}

export default async function PillarPage({ params }: PillarPageProps) {
  const { pillar } = await params;
  const pillarSlug = pillar as PillarSlug;
  const topic = getTopicBySlug(pillarSlug);
  const guide = PILLAR_GUIDES[pillarSlug];

  if (!topic || !guide) {
    notFound();
  }

  const subpillars = getSubpillarsForPillar(pillarSlug);
  const pillarArticles = articles
    .filter((article) => article.category === pillarSlug)
    .sort((a, b) => new Date(b.lastUpdated || b.date).getTime() - new Date(a.lastUpdated || a.date).getTime());
  const featured = pillarArticles[0];
  const latestArticles = pillarArticles.slice(1, 7);
  const totalReadMinutes = pillarArticles.reduce((sum, article) => {
    const minutes = Number.parseInt(article.readTime, 10);
    return Number.isFinite(minutes) ? sum + minutes : sum;
  }, 0);

  const subpillarCounts = new Map<string, number>();
  for (const article of pillarArticles) {
    const inferred = inferSubpillarFromArticle(article);
    subpillarCounts.set(inferred, (subpillarCounts.get(inferred) ?? 0) + 1);
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: topic.name, path: `/topic/${pillarSlug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />

      <div className="bg-white text-stone-950">
        <RouteDepthTracker depth={1} pillar={pillarSlug} />

        <section className="border-b border-stone-200">
          <div className="mx-auto max-w-7xl px-5 py-10 md:py-12">
            <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-red-900">Home</Link>
              <span>/</span>
              <span className="text-stone-300">{topic.name}</span>
            </nav>

            <div className="border-y-2 border-stone-900 py-7 md:py-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">{guide.label}</p>
              <div className="mt-3 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
                <div>
                  <h1 className="max-w-5xl break-words font-serif text-4xl font-black leading-tight md:text-7xl">
                    {guide.headline}
                  </h1>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">{guide.deck}</p>
                </div>
                <div className="border border-stone-200 bg-neutral-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Reading Map</p>
                  <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <dt className="font-serif text-3xl font-black text-stone-950">{pillarArticles.length}</dt>
                      <dd className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Reports</dd>
                    </div>
                    <div>
                      <dt className="font-serif text-3xl font-black text-stone-950">{subpillars.length}</dt>
                      <dd className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Tracks</dd>
                    </div>
                    <div>
                      <dt className="font-serif text-3xl font-black text-stone-950">{totalReadMinutes}</dt>
                      <dd className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-stone-500">Minutes</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <TrackedLink
                  href={guide.primaryHref}
                  className="btn-primary"
                  eventType="hub_secondary_cta_click"
                  metadata={{ location: 'pillar_hero', pillar: pillarSlug, cta: 'primary', category: pillarSlug }}
                >
                  {guide.primaryLabel}
                </TrackedLink>
                <TrackedLink
                  href={guide.secondaryHref}
                  className="inline-flex items-center justify-center border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-950 transition-colors hover:border-stone-950 hover:bg-neutral-50"
                  eventType="hub_nav_click"
                  metadata={{ location: 'pillar_hero', pillar: pillarSlug, cta: 'secondary', category: pillarSlug }}
                >
                  {guide.secondaryLabel}
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div>
              <div className="mb-5 border-b-2 border-stone-900 pb-2">
                <h2 className="font-serif text-3xl font-black text-stone-950">Choose a Track</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {subpillars.map((subpillar) => (
                  <TrackedLink
                    key={subpillar.slug}
                    href={getSubpillarPath(pillarSlug, subpillar.slug)}
                    className="news-card group flex min-h-[16rem] flex-col p-5"
                    eventType="hub_nav_click"
                    metadata={{
                      location: 'pillar_track_grid',
                      pillar: pillarSlug,
                      subpillar: subpillar.slug,
                      category: pillarSlug,
                    }}
                  >
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                      {subpillarCounts.get(subpillar.slug) ?? 0} reports
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                      {subpillar.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{subpillar.description}</p>
                    <p className="mt-auto border-t border-stone-200 pt-4 text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
                      Open track
                    </p>
                  </TrackedLink>
                ))}
              </div>

              <div className="mt-10">
                <div className="mb-5 border-b-2 border-stone-900 pb-2">
                  <h2 className="font-serif text-3xl font-black text-stone-950">Decision Paths</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {guide.decisionLanes.map((lane) => (
                    <TrackedLink
                      key={lane.href}
                      href={lane.href}
                      className="border border-stone-200 bg-neutral-50 p-5 transition-colors hover:border-red-900 hover:bg-white"
                      eventType="hub_nav_click"
                      metadata={{ location: 'pillar_decision_paths', pillar: pillarSlug, target: lane.href, category: pillarSlug }}
                    >
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">{lane.label}</p>
                      <h3 className="mt-3 font-serif text-xl font-black leading-tight text-stone-950">{lane.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-stone-600">{lane.description}</p>
                    </TrackedLink>
                  ))}
                </div>
              </div>

              {featured ? (
                <div className="mt-10">
                  <div className="mb-5 border-b-2 border-stone-900 pb-2">
                    <h2 className="font-serif text-3xl font-black text-stone-950">Start Here</h2>
                  </div>
                  <TrackedLink
                    href={`/blog/${featured.slug}`}
                    className="group grid gap-6 border border-stone-200 bg-white p-5 transition-colors hover:border-red-900 md:grid-cols-[minmax(0,1fr)_12rem]"
                    eventType="article_click"
                    articleSlug={featured.slug}
                    metadata={{ location: 'pillar_featured_article', pillar: pillarSlug, category: pillarSlug }}
                  >
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                        Featured report / {formatDate(featured.lastUpdated || featured.date)}
                      </p>
                      <h2 className="mt-3 break-words font-serif text-3xl font-black leading-tight text-stone-950 group-hover:text-red-900 md:text-4xl">
                        {featured.title}
                      </h2>
                      <p className="mt-4 text-base leading-7 text-stone-600">{featured.excerpt}</p>
                    </div>
                    <div className="border-t border-stone-200 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Reader fit</p>
                      <p className="mt-3 text-sm leading-6 text-stone-700">{guide.retentionPrompt}</p>
                    </div>
                  </TrackedLink>
                </div>
              ) : null}

              {latestArticles.length > 0 ? (
                <div className="mt-10">
                  <div className="mb-5 flex items-end justify-between border-b-2 border-stone-900 pb-2">
                    <h2 className="font-serif text-3xl font-black text-stone-950">Latest in {topic.name}</h2>
                    <Link href="/articles" className="text-sm font-bold text-red-900 hover:text-stone-950">All articles</Link>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    {latestArticles.map((article) => (
                      <TrackedLink
                        key={article.id}
                        href={`/blog/${article.slug}`}
                        className="article-card group p-5"
                        eventType="article_click"
                        articleSlug={article.slug}
                        metadata={{ location: 'pillar_latest_articles', pillar: pillarSlug, category: pillarSlug }}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">
                            {inferSubpillarFromArticle(article).replace('-', ' ')}
                          </span>
                          <span className="text-stone-300">/</span>
                          <span className="text-xs text-stone-500">{article.readTime}</span>
                        </div>
                        <h3 className="break-words font-serif text-xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{article.excerpt}</p>
                      </TrackedLink>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="border border-stone-950 bg-stone-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-300">Dispatch</p>
                <h2 className="mt-2 font-serif text-2xl font-black">Keep the thread</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Get the weekly Decryptica dispatch when new reports, tools, and buyer guides land.
                </p>
                <div className="mt-5">
                  <SubscribeForm />
                </div>
              </div>

              <div className="border border-stone-200 bg-neutral-50 p-5">
                <h2 className="font-serif text-2xl font-black text-stone-950">Fast Links</h2>
                <div className="mt-4 divide-y divide-stone-200">
                  <Link href="/search" className="flex items-center justify-between py-3 text-sm font-bold text-stone-800 hover:text-red-900">
                    <span>Search Decryptica</span>
                    <span aria-hidden="true">{'->'}</span>
                  </Link>
                  <Link href="/tools" className="flex items-center justify-between py-3 text-sm font-bold text-stone-800 hover:text-red-900">
                    <span>Tools hub</span>
                    <span aria-hidden="true">{'->'}</span>
                  </Link>
                  <Link href="/prompts" className="flex items-center justify-between py-3 text-sm font-bold text-stone-800 hover:text-red-900">
                    <span>Prompt library</span>
                    <span aria-hidden="true">{'->'}</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
