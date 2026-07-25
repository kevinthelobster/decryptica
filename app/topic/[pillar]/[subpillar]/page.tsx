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
    <div className="mx-auto max-w-6xl px-5 py-10 pb-28 text-stone-950 md:px-6 md:py-12 md:pb-12">
      <RouteDepthTracker depth={2} pillar={pillarSlug} subpillar={subpillar} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-red-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/topic/${pillarSlug}`} className="hover:text-red-900 transition-colors">{topic.name}</Link>
        <span>/</span>
        <span className="text-stone-300">{currentSubpillar.name}</span>
      </nav>

      <section className="border-y-2 border-stone-900 bg-white py-7 md:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Sub-Pillar Index</p>
        <h1 className="mt-2 max-w-[21rem] break-words font-serif text-2xl font-black leading-tight text-stone-950 sm:max-w-none sm:text-5xl md:text-6xl">
          {topic.name} {currentSubpillar.name}
        </h1>
        <p className="mt-4 max-w-[20rem] text-base leading-7 text-stone-700 sm:max-w-3xl">{currentSubpillar.description}</p>

        <div className="mt-6 grid max-w-[20rem] grid-cols-2 gap-2 sm:flex sm:max-w-none sm:flex-wrap">
          {subpillars.map((item) => (
            <Link
              key={item.slug}
              href={getSubpillarPath(pillarSlug, item.slug)}
              className={[
                'inline-flex items-center justify-center border px-3 py-2 text-center text-sm font-bold transition-colors',
                item.slug === subpillar
                  ? 'border-red-900 bg-red-900 text-white'
                  : 'border-stone-300 bg-stone-50 text-stone-800 hover:border-stone-950 hover:bg-white hover:text-stone-950',
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
          <h2 className="break-words font-serif text-2xl font-black text-stone-950">Cluster Articles</h2>
          <span className="text-sm text-stone-500">{articleCards.length} articles</span>
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
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">{article.category}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{article.readTime}</span>
                </div>
                <h3 className="break-words font-serif text-xl font-black leading-tight text-stone-950 transition-colors group-hover:text-red-800">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600 line-clamp-3">{article.excerpt}</p>
              </TrackedLink>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-6 text-sm leading-6 text-stone-600">
            No articles are mapped to this sub-pillar yet. Use the adjacent sub-pillars below to keep exploring.
          </div>
        )}
      </section>

      {(pillarSlug === 'ai' && ['llms', 'agents', 'local', 'use-cases', 'tooling'].includes(subpillar)) || (pillarSlug === 'automation' && ['workflows', 'infrastructure'].includes(subpillar)) || (pillarSlug === 'crypto' && ['wallets', 'defi'].includes(subpillar)) ? (
        <section className="mt-10">
          <div className="card-elevated p-6 md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Buyer Intent Directory</p>
            <h2 className="mt-2 break-words font-serif text-2xl font-black leading-tight text-stone-950 md:text-3xl">
              {pillarSlug === 'ai' && subpillar === 'llms'
                ? 'High-intent LLM buying and deployment paths'
                : pillarSlug === 'ai' && subpillar === 'agents'
                  ? 'AI agent implementation paths for active buyers'
                  : pillarSlug === 'ai' && subpillar === 'local'
                    ? 'Local AI deployment paths for privacy and cost-conscious teams'
                    : pillarSlug === 'ai' && subpillar === 'use-cases'
                      ? 'Operational AI rollout paths that convert'
                      : pillarSlug === 'crypto' && subpillar === 'wallets'
                        ? 'High-intent wallet and custody paths for self-custody buyers'
                        : pillarSlug === 'crypto' && subpillar === 'defi'
                          ? 'High-intent DeFi research paths for active on-chain participants'
                          : 'Automation reliability paths for technical buyers'}
            </h2>
            <p className="mt-3 text-stone-600">
              {pillarSlug === 'ai' && subpillar === 'llms'
                ? 'Use these pages to move from model curiosity into concrete stack, cost, and implementation decisions.'
                : pillarSlug === 'ai' && subpillar === 'agents'
                  ? 'These pages help teams move from agent curiosity into practical implementation, budget validation, and consulting conversations.'
                  : pillarSlug === 'ai' && subpillar === 'local'
                    ? 'Use these paths to evaluate local and edge AI tradeoffs, validate economics, and decide whether you need implementation help.'
                    : pillarSlug === 'ai' && subpillar === 'use-cases'
                      ? 'These guides help operations teams go from “should we automate this?” to scoped rollout and consulting conversations.'
                      : pillarSlug === 'crypto' && subpillar === 'wallets'
                        ? 'Use these pages to compare custody options, tighten operational security, and move from wallet research into safer self-custody decisions.'
                        : pillarSlug === 'crypto' && subpillar === 'defi'
                          ? 'These pages help readers move from DeFi curiosity into protocol selection, chain tradeoff analysis, and risk-aware participation.'
                          : 'These pages are the shortest path from architecture research into reliability decisions and implementation help.'}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pillarSlug === 'ai' && subpillar === 'llms' ? (
                <>
                  <TrackedLink href="/blog/local-llm-setup-guide" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'local-llm-setup-guide', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Local deployment</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Running LLMs Locally</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">For teams comparing privacy, cost control, and on-prem style deployment tradeoffs.</p>
                  </TrackedLink>
                  <TrackedLink href="/blog/cursor-vs-windsurf-ai-coding" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'cursor-vs-windsurf-ai-coding', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Tool selection</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Cursor vs Windsurf</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A practical comparison for teams deciding where AI coding fits in the stack.</p>
                  </TrackedLink>
                  <TrackedLink href="/tools/ai-price-calculator" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_price_calculator', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Budget validation</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI ROI Calculator</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Validate whether local, hosted, or hybrid AI economics make sense before you commit.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'ai' && subpillar === 'agents' ? (
                <>
                  <TrackedLink href="/blog/ai-agents-explained" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'ai-agents-explained', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Foundations</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI Agents Explained</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Anchor buyers with a practical guide to what agents are, how they work, and where they fit.</p>
                  </TrackedLink>
                  <TrackedLink href="/tools/ai-price-calculator" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_price_calculator', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Budget validation</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI ROI Calculator</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Pressure-test agent automation economics before committing engineering time or vendor spend.</p>
                  </TrackedLink>
                  <TrackedLink href="/services/ai-automation-consulting" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_automation_consulting', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Implementation help</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI Automation Consulting</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Bring in help when agent orchestration, guardrails, or rollout planning need to move faster.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'ai' && subpillar === 'local' ? (
                <>
                  <TrackedLink href="/blog/local-llm-setup-guide" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'local-llm-setup-guide', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Local deployment</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Running LLMs Locally</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A practical buyer-facing guide for teams evaluating privacy, cost control, and self-hosted AI workflows.</p>
                  </TrackedLink>
                  <TrackedLink href="/tools/ai-price-calculator" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_price_calculator', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Cost modeling</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI ROI Calculator</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Compare local, hosted, and hybrid cost structures before choosing an edge AI path.</p>
                  </TrackedLink>
                  <TrackedLink href="/services/ai-automation-consulting" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_automation_consulting', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Implementation help</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI Automation Consulting</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Get help scoping local or edge AI deployment when privacy, infra, or rollout complexity is slowing decisions.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'ai' && subpillar === 'use-cases' ? (
                <>
                  <TrackedLink href="/blog/best-ai-tools-for-small-business-automation" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'best-ai-tools-for-small-business-automation', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Buyer guide</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Best AI Tools for Small Business Automation</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A high-intent shortlist for owners comparing cost, setup friction, and real-world fit.</p>
                  </TrackedLink>
                  <TrackedLink href="/blog/ai-workflow-examples-for-operations-teams" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'ai-workflow-examples-for-operations-teams', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Use-case playbook</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI Workflow Examples for Operations Teams</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Examples that turn abstract AI interest into concrete workflow rollout ideas.</p>
                  </TrackedLink>
                  <TrackedLink href="/services/ai-automation-consulting" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_automation_consulting', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Implementation help</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI Automation Consulting</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">When the team needs architecture, rollout planning, or a faster path to production.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'ai' && subpillar === 'tooling' ? (
                <>
                  <TrackedLink href="/blog/best-ai-tools-for-small-business-automation" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'best-ai-tools-for-small-business-automation', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Tool selection</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Best AI Tools for Small Business Automation</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A practical buyer guide to the AI and workflow tools small teams actually adopt.</p>
                  </TrackedLink>
                  <TrackedLink href="/blog/ai-observability-tools-compared" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'ai-observability-tools-compared', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Monitoring</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI Observability Tools Compared</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Use this to evaluate when your stack needs tracing, evaluation, and governance layers.</p>
                  </TrackedLink>
                  <TrackedLink href="/tools/ai-price-calculator" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_price_calculator', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Budget validation</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">AI ROI Calculator</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Pressure-test tooling and usage costs before you add more AI vendors.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'crypto' && subpillar === 'wallets' ? (
                <>
                  <TrackedLink href="/blog/ledger-vs-trezor-vs-keystone-best-hardware-wallet-2026" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'ledger-vs-trezor-vs-keystone-best-hardware-wallet-2026', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Hardware comparison</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Ledger vs Trezor vs Keystone</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A direct path for buyers comparing the leading hardware wallets by security model, convenience, and fit.</p>
                  </TrackedLink>
                  <TrackedLink href="/blog/crypto-wallets-2026" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'crypto-wallets-2026', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Wallet shortlist</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Best Crypto Wallets in 2026</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Start with a broad wallet shortlist, then narrow into the custody model that matches your balances and habits.</p>
                  </TrackedLink>
                  <TrackedLink href="/tools/crypto-wallet-security-checklist" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'crypto_wallet_security_checklist', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Security checklist</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Crypto Wallet Security Checklist</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Tighten backup, seed phrase, purchase-source, and transaction verification habits before moving larger balances.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'crypto' && subpillar === 'defi' ? (
                <>
                  <TrackedLink href="/blog/why-most-defi-users-will-never-leave-ethereum" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'why-most-defi-users-will-never-leave-ethereum', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Chain selection</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Why Most DeFi Users Will Never Leave Ethereum</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A practical read on why liquidity depth, execution quality, and network effects still matter more than raw fee narratives.</p>
                  </TrackedLink>
                  <TrackedLink href="/blog/why-liquidity-fragmentation-is-killing-defi" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'why-liquidity-fragmentation-is-killing-defi', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Market structure</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Why Liquidity Fragmentation Is Killing DeFi</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Use this to understand the execution and interoperability risks that shape real DeFi returns across chains.</p>
                  </TrackedLink>
                  <TrackedLink href="/topic/crypto/wallets" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSubpillar: 'wallets', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Custody foundation</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Crypto Wallets Hub</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Bridge DeFi participation back into wallet setup, self-custody, and security habits before chasing yield.</p>
                  </TrackedLink>
                </>
              ) : pillarSlug === 'automation' && subpillar === 'workflows' ? (
                <>
                  <TrackedLink href="/blog/the-human-in-the-loop-problem-for-automation" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'the-human-in-the-loop-problem-for-automation', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Human handoffs</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Human-in-the-Loop Automation</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Use this to scope where approvals, exception handling, and operator review need to stay in the loop.</p>
                  </TrackedLink>
                  <TrackedLink href="/blog/why-most-automation-projects-fail-at-scale" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'why-most-automation-projects-fail-at-scale', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Scale risk</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Why Automation Projects Fail at Scale</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A buyer-facing guide to the workflow design and operating mistakes that break automation after launch.</p>
                  </TrackedLink>
                  <TrackedLink href="/services/ai-automation-consulting" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_automation_consulting', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Implementation help</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Workflow Automation Consulting</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Bring in help when process mapping, handoff logic, or rollout sequencing needs to move faster.</p>
                  </TrackedLink>
                </>
              ) : (
                <>
                  <TrackedLink href="/blog/queue-vs-webhook-for-workflow-reliability" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSlug: 'queue-vs-webhook-for-workflow-reliability', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Architecture choice</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Queue vs Webhook Reliability</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">A direct path for buyers evaluating automation reliability under real load and failure conditions.</p>
                  </TrackedLink>
                  <TrackedLink href="/topic/automation/workflows" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_nav_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, targetSubpillar: 'workflows', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Workflow design</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Automation Workflows Hub</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Bridge reliability questions back into process design, routing logic, and rollout patterns.</p>
                  </TrackedLink>
                  <TrackedLink href="/services/ai-automation-consulting" className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900" eventType="hub_secondary_cta_click" metadata={{ location: 'subpillar_intent_directory', pillar: pillarSlug, subpillar, cta: 'ai_automation_consulting', category: pillarSlug }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Implementation help</p>
                    <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">Automation Consulting</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Bring in help when reliability, queueing, or infra tradeoffs are slowing the team down.</p>
                  </TrackedLink>
                </>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {adjacentSubpillars.map((item) => (
          <TrackedLink
            key={item.slug}
            href={getSubpillarPath(pillarSlug, item.slug)}
            className="border border-stone-200 bg-white p-4 transition-colors hover:border-red-900"
            eventType="hub_nav_click"
            metadata={{
              location: 'subpillar_adjacent_links',
              pillar: pillarSlug,
              subpillar,
              targetSubpillar: item.slug,
              category: pillarSlug,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Adjacent</p>
            <h3 className="mt-1 break-words font-serif text-lg font-black leading-tight text-stone-950">{item.name}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
          </TrackedLink>
        ))}
      </section>

      <section className="mt-10">
        <div className="card-elevated p-6 md:p-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">Next Step</p>
            <h2 className="mt-2 break-words font-serif text-2xl font-black leading-tight text-stone-950">Move from research to execution</h2>
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
