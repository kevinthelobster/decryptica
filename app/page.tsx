import Link from "next/link";
import { Metadata } from "next";
import SubscribeForm from "./components/SubscribeForm";
import TrackedLink from "./components/TrackedLink";
import IntentRouter from "./components/IntentRouter";
import { articles } from "./data/articles";
import { absoluteUrl, getBreadcrumbSchema, jsonLdScript } from "./lib/schema";

export const metadata: Metadata = {
  title: "Decryptica | Independent Crypto, AI, and Automation Analysis",
  description:
    "Independent reporting and analysis on crypto markets, AI tools, and automation systems for operators who need signal over hype.",
};

const sortedArticles = [...articles].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

const featuredArticles = sortedArticles.slice(0, 7).map((article) => ({
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
  date: new Date(article.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  slug: article.slug,
}));

const leadArticle = featuredArticles[0];
const secondaryArticles = featuredArticles.slice(1, 4);
const briefingArticles = featuredArticles.slice(4, 7);

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
          <div className="mx-auto max-w-7xl px-5 py-6">
            <div className="flex min-w-0 flex-col items-start gap-3 border-y border-stone-900 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-stone-700 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <span>Independent digital economy coverage</span>
              <span>Crypto / AI / Automation</span>
              <span>Updated {leadArticle?.date}</span>
            </div>

            <div className="grid min-w-0 gap-8 py-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
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
                  <h1 className="max-w-5xl break-words font-serif text-4xl font-black leading-[0.98] text-stone-950 sm:text-5xl md:text-7xl">
                    {leadArticle.title}
                  </h1>
                  <p className="mt-5 max-w-3xl break-words border-l-4 border-red-800 pl-4 text-base leading-7 text-stone-700 sm:text-lg sm:leading-8">
                    {leadArticle.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-stone-600">
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
          <div className="mx-auto grid max-w-7xl min-w-0 gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-stone-900 pb-2">
                <h2 className="font-serif text-3xl font-black text-stone-950">Latest Reports</h2>
                <TrackedLink
                  href="/articles"
                  className="text-sm font-bold uppercase tracking-[0.12em] text-red-800 hover:text-red-950"
                  eventType="cta_click"
                  metadata={{ location: "home_latest_reports", cta: "view_all" }}
                >
                  All reports
                </TrackedLink>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {secondaryArticles.map((article) => (
                  <TrackedLink
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="news-card group flex min-h-[18rem] flex-col p-5"
                    eventType="article_click"
                    articleSlug={article.slug}
                    metadata={{ location: "home_latest_reports", category: article.category }}
                  >
                    <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                      {article.category}
                    </p>
                    <h3 className="break-words font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900">
                      {article.title}
                    </h3>
                    <p className="mt-3 line-clamp-4 break-words text-sm leading-6 text-stone-600">
                      {article.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
                      <span>{article.date}</span>
                      <span>{article.readTime}</span>
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

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
            <div>
              <h2 className="border-b-2 border-stone-900 pb-2 font-serif text-3xl font-black text-stone-950">
                Sections
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {topics.map((topic) => (
                  <Link key={topic.slug} href={`/topic/${topic.slug}`} className="news-card group p-5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-800">
                      {topic.count} reports
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-black text-stone-950 group-hover:text-red-900">
                      {topic.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{topic.deck}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-10">
                <IntentRouter
                  location="home_intent_router"
                  category="all"
                  variant="default"
                  learnHref="/articles"
                />
              </div>
            </div>

            <aside className="space-y-6">
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
