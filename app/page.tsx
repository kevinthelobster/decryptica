import Link from "next/link";
import { Metadata } from "next";
import SubscribeForm from "./components/SubscribeForm";
import TrackedLink from "./components/TrackedLink";
import IntentRouter from "./components/IntentRouter";
import LeadMagnetCapture from "./components/LeadMagnetCapture";
import { articles } from "./data/articles";
import { getArticleImage } from "./data/article-images";
import { leadMagnets } from "./data/lead-magnets";
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from "./lib/schema";

export const metadata: Metadata = {
  title: "Decryptica | Independent Crypto, AI, and Automation Analysis",
  description:
    "Independent reporting and analysis on crypto markets, AI tools, and automation systems for operators who need signal over hype.",
};

const sortedArticles = [...articles].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

const featuredArticles = sortedArticles.slice(0, 10).map((article) => ({
  id: article.id,
  category:
    article.category === "crypto"
      ? "Crypto"
      : article.category === "ai"
      ? "AI"
      : "Automation",
  title: article.title,
  excerpt: article.excerpt,
  readTime: article.readTime,
  image: getArticleImage(article),
  date: new Date(article.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  slug: article.slug,
}));

const leadArticle = featuredArticles[0];
const secondaryArticles = featuredArticles.slice(1, 4);
const latestArticles = featuredArticles.slice(4, 7);
const briefingArticles = featuredArticles.slice(7, 10);

const topics = [
  {
    slug: "crypto",
    title: "Crypto Markets",
    deck: "Protocol risk, DeFi mechanics, regulation, and market structure without the pump-cycle fog.",
    count: articles.filter((a) => a.category === "crypto").length,
  },
  {
    slug: "ai",
    title: "AI Tools",
    deck: "Model economics, agent workflows, tool comparisons, and implementation notes for practical teams.",
    count: articles.filter((a) => a.category === "ai").length,
  },
  {
    slug: "automation",
    title: "Automation",
    deck: "Workflow design, no-code limits, API operations, and systems that reduce repetitive work.",
    count: articles.filter((a) => a.category === "automation").length,
  },
];

const toolDeskItems = [
  {
    title: "AI price calculator",
    description: "Compare model costs before a stack decision turns into recurring spend.",
    href: "/tools/ai-price-calculator",
    label: "Calculator",
  },
  {
    title: "Prompt library",
    description: "Reuse automation prompts for monitoring, research, coding, and communication workflows.",
    href: "/prompts",
    label: "Library",
  },
  {
    title: "Search the archive",
    description: "Find the report, prompt, tool, or checklist that matches the question in front of you.",
    href: "/search",
    label: "Utility",
  },
];

const mobilePrimaryChoices = [
  { href: "/articles", label: "Reports" },
  { href: "/tools", label: "Tools" },
  { href: "#downloads", label: "Downloads" },
];

export default function IndexPage() {
  const websitePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Decryptica | Independent Crypto, AI, and Automation Analysis",
    description:
      "Independent reporting and analysis on crypto markets, AI tools, and automation systems for operators who need signal over hype.",
    url: absoluteUrl("/"),
    isPartOf: { "@id": `${absoluteUrl()}/#website` },
    about: ["Crypto", "Artificial Intelligence", "Automation"],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured articles",
    itemListElement: featuredArticles.slice(0, 3).map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/blog/${article.slug}`),
      name: article.title,
    })),
  };

  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", path: "/" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(websitePageSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />

      <div className="min-h-screen overflow-x-hidden bg-white text-stone-950">
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-5 sm:py-6">
            <div className="flex min-w-0 flex-col items-start gap-3 border-y border-stone-900 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-stone-700 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <span>Independent digital economy coverage</span>
              <span>Crypto / AI / Automation</span>
              <span>Updated {leadArticle?.date}</span>
            </div>

            <form
              action="/search"
              className="mt-5 grid gap-3 border border-stone-200 bg-neutral-50 p-4 md:grid-cols-[minmax(0,1fr)_9rem]"
            >
              <label className="sr-only" htmlFor="home-search">
                Search Decryptica
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Search articles, prompts, and tools"
                className="min-h-11 w-full border border-stone-300 bg-white px-4 text-sm text-stone-950 placeholder:text-stone-400 focus:border-red-900 focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-11 border border-stone-950 bg-stone-950 px-4 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-red-900"
              >
                Search
              </button>
            </form>

            <nav
              className="mt-4 grid grid-cols-3 border border-stone-200 bg-white text-center sm:hidden"
              aria-label="Primary homepage choices"
            >
              {mobilePrimaryChoices.map((choice) => (
                <Link
                  key={choice.href}
                  href={choice.href}
                  className="border-r border-stone-200 px-2 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-stone-700 last:border-r-0 hover:bg-neutral-50 hover:text-red-900"
                >
                  {choice.label}
                </Link>
              ))}
            </nav>

            <div className="grid min-w-0 gap-6 py-6 sm:gap-8 sm:py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
              {leadArticle && (
                <TrackedLink
                  href={`/blog/${leadArticle.slug}`}
                  className="group block min-w-0"
                  eventType="article_click"
                  articleSlug={leadArticle.slug}
                  metadata={{ location: "home_lead_story", category: leadArticle.category }}
                >
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-red-800">
                    Lead Analysis
                  </p>
                  <h1 className="max-w-[21rem] break-words font-serif text-[1.75rem] font-black leading-[1.02] text-stone-950 sm:max-w-5xl sm:text-5xl md:text-7xl">
                    {leadArticle.title}
                  </h1>
                  <p className="mt-4 max-w-[20rem] break-words border-l-4 border-red-800 pl-4 text-sm leading-6 text-stone-700 sm:mt-5 sm:max-w-3xl sm:text-lg sm:leading-8">
                    {leadArticle.excerpt}
                  </p>
                  <div className="mt-5 overflow-hidden border border-stone-200 bg-white sm:mt-7">
                    <img
                      src={leadArticle.image.src}
                      alt={leadArticle.image.alt}
                      className="aspect-[5/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:aspect-[16/9]"
                    />
                    <p className="hidden border-t border-stone-200 px-3 py-2 text-xs text-stone-500 sm:block">
                      {leadArticle.image.credit}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600 sm:mt-5 sm:gap-3 sm:text-sm">
                    <span>{leadArticle.category}</span>
                    <span className="h-1 w-1 rounded-full bg-stone-400" />
                    <span>{leadArticle.date}</span>
                    <span className="h-1 w-1 rounded-full bg-stone-400" />
                    <span>{leadArticle.readTime}</span>
                  </div>
                </TrackedLink>
              )}

              <aside className="min-w-0 border-t border-stone-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <h2 className="mb-4 font-serif text-2xl font-black text-stone-950">
                  Editor&apos;s Brief
                </h2>
                <div className="divide-y divide-stone-200">
                  {secondaryArticles.map((article) => (
                    <TrackedLink
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="group block py-4 first:pt-0"
                      eventType="article_click"
                      articleSlug={article.slug}
                      metadata={{ location: "home_editors_brief", category: article.category }}
                    >
                      <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-red-800">
                        {article.category}
                      </p>
                      <h3 className="break-words font-serif text-xl font-bold leading-tight text-stone-950 group-hover:text-red-900">
                        {article.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-stone-600">
                        {article.excerpt}
                      </p>
                    </TrackedLink>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl min-w-0 gap-7 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-stone-900 pb-2">
                <h2 className="font-serif text-2xl font-black text-stone-950 sm:text-3xl">Latest Reports</h2>
                <TrackedLink
                  href="/articles"
                  className="text-sm font-bold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
                  eventType="cta_click"
                  metadata={{ location: "home_latest_reports", cta: "view_all" }}
                >
                  All reports
                </TrackedLink>
              </div>

              <div className="grid divide-y divide-stone-200 border-y border-stone-200 md:grid-cols-3 md:gap-5 md:divide-y-0 md:border-y-0">
                {latestArticles.map((article) => (
                  <TrackedLink
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] gap-3 py-3 transition-colors md:flex md:min-h-[18rem] md:flex-col md:border md:border-stone-300 md:bg-white md:p-5 md:hover:border-red-800 md:hover:bg-neutral-50"
                    eventType="article_click"
                    articleSlug={article.slug}
                    metadata={{ location: "home_latest_reports", category: article.category }}
                  >
                    <div className="overflow-hidden border border-stone-200 md:-mx-5 md:mb-4 md:border-x-0">
                      <img src={article.image.src} alt={article.image.alt} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105 md:aspect-[4/3]" />
                    </div>
                    <div className="min-w-0 md:flex md:flex-1 md:flex-col">
                      <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800 md:mb-3">
                        {article.category}
                      </p>
                      <h3 className="break-words font-serif text-lg font-black leading-tight text-stone-950 group-hover:text-red-900 md:text-2xl">
                        {article.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 break-words text-sm leading-5 text-stone-600 md:mt-3 md:line-clamp-4 md:leading-6">
                        {article.excerpt}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-stone-500 md:mt-auto md:justify-between md:border-t md:border-stone-200 md:pt-4">
                        <span>{article.date}</span>
                        <span className="h-1 w-1 rounded-full bg-stone-300 md:hidden" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </TrackedLink>
                ))}
              </div>
            </div>

            <aside className="border-t border-stone-200 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <h2 className="mb-4 font-serif text-2xl font-black text-stone-950">Newsroom Notes</h2>
              <div className="space-y-5 text-sm leading-6 text-stone-700">
                <p>
                  Decryptica publishes operator-focused analysis for readers making decisions about tools,
                  protocols, and automation systems.
                </p>
                <p>
                  Articles are written to separate durable mechanics from hype cycles, with visible dates,
                  topic context, and source-method cues on article pages.
                </p>
              </div>
              <div className="mt-6 border-y border-stone-200 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Coverage</p>
                <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                  {topics.map((topic) => (
                    <div key={topic.slug}>
                      <dt className="font-serif text-2xl font-black text-stone-950">{topic.count}</dt>
                      <dd className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-stone-500">
                        {topic.slug}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
            <div className="mb-5 flex flex-col gap-3 border-b-2 border-stone-900 pb-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Tools Desk</p>
                <h2 className="mt-2 font-serif text-2xl font-black text-stone-950 sm:text-3xl">Return when the research turns practical</h2>
              </div>
              <TrackedLink
                href="/tools"
                className="text-sm font-bold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
                eventType="cta_click"
                metadata={{ location: "home_tools_desk", cta: "view_tools" }}
              >
                View all tools
              </TrackedLink>
            </div>
            <div className="grid gap-3 md:grid-cols-3 md:gap-4">
              {toolDeskItems.map((item) => (
                <TrackedLink
                  key={item.href}
                  href={item.href}
                  className="news-card group flex min-h-0 flex-col p-4 md:min-h-[13rem] md:p-5"
                  eventType="cta_click"
                  metadata={{ location: "home_tools_desk", cta: item.label.toLowerCase() }}
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                    {item.label}
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-black leading-tight text-stone-950 group-hover:text-red-900 md:mt-3 md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600 md:mt-3">{item.description}</p>
                  <p className="mt-3 border-t border-stone-200 pt-3 text-sm font-bold text-red-800 group-hover:text-red-950 md:mt-auto md:pt-4">
                    Open {'->'}
                  </p>
                </TrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section id="downloads" className="border-b border-stone-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
            <div className="mb-5 flex flex-col gap-3 border-b-2 border-stone-900 pb-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Research Downloads</p>
                <h2 className="mt-2 font-serif text-2xl font-black text-stone-950 sm:text-3xl">Field notes worth saving</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-stone-600">
                Practical worksheets from the reporting desk: pricing sheets, infrastructure checks, and rollout templates.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
              {leadMagnets.slice(0, 3).map((offer) => (
                <LeadMagnetCapture
                  key={offer.slug}
                  offer={offer}
                  location="home_research_downloads"
                  category={offer.category}
                  compact
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
            <div>
              <h2 className="border-b-2 border-stone-900 pb-2 font-serif text-2xl font-black text-stone-950 sm:text-3xl">
                Sections
              </h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
                {topics.map((topic) => (
                  <Link key={topic.slug} href={`/topic/${topic.slug}`} className="news-card group p-4 md:p-5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                      {topic.count} reports
                    </p>
                    <h3 className="mt-2 font-serif text-xl font-black text-stone-950 group-hover:text-red-900 md:mt-3 md:text-2xl">
                      {topic.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600 md:mt-3">{topic.deck}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-8 sm:mt-10">
                <IntentRouter
                  location="home_intent_router"
                  category="all"
                  variant="default"
                  learnHref="/articles"
                />
              </div>
            </div>

            <aside className="space-y-5 sm:space-y-6">
              <div className="border border-stone-200 bg-white p-5">
                <h2 className="font-serif text-2xl font-black text-stone-950">Briefing List</h2>
                <div className="mt-4 divide-y divide-stone-200">
                  {briefingArticles.map((article) => (
                    <TrackedLink
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="group block py-3"
                      eventType="article_click"
                      articleSlug={article.slug}
                      metadata={{ location: "home_briefing_list", category: article.category }}
                    >
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-stone-500">
                        {article.category}
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-bold leading-tight text-stone-950 group-hover:text-red-900">
                        {article.title}
                      </h3>
                    </TrackedLink>
                  ))}
                </div>
              </div>

              <div id="subscribe" className="border border-stone-900 bg-stone-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-300">Dispatch</p>
                <h2 className="mt-2 font-serif text-2xl font-black">Get the weekly brief</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Signal on AI tooling, crypto mechanics, and automation systems. No hype digest.
                </p>
                <div className="mt-5">
                  <SubscribeForm />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
