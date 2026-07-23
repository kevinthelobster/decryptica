import Link from 'next/link';
import { Metadata } from 'next';
import { articles, type Article } from '../data/articles';
import SubscribeForm from '../components/SubscribeForm';
import { getBreadcrumbSchema, getCollectionPageSchema, jsonLdScript, absoluteUrl } from '../lib/schema';

export const metadata: Metadata = {
  title: 'Latest Reports | Decryptica',
  description: 'Independent analysis on crypto markets, AI tools, and automation systems.',
  alternates: {
    canonical: '/articles',
  },
};

const categoryNames: Record<Article['category'], string> = {
  crypto: 'Crypto',
  ai: 'AI',
  automation: 'Automation',
};

export default function ArticlesPage() {
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categories: { name: string; href: string; slug: Article['category']; count: number }[] = [
    { name: 'Crypto Markets', href: '/topic/crypto/defi', slug: 'crypto', count: articles.filter((a) => a.category === 'crypto').length },
    { name: 'AI Tools', href: '/topic/ai/use-cases', slug: 'ai', count: articles.filter((a) => a.category === 'ai').length },
    { name: 'Automation', href: '/topic/automation/workflows', slug: 'automation', count: articles.filter((a) => a.category === 'automation').length },
  ];
  const collectionSchema = getCollectionPageSchema({
    name: 'Latest Reports',
    description: 'Browse Decryptica reports on crypto, AI tools, and automation workflows.',
    path: '/articles',
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
  ]);
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All Decryptica articles',
    numberOfItems: sortedArticles.length,
    itemListElement: sortedArticles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/blog/${article.slug}`),
      name: article.title,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(collectionSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListSchema)} />

      <div className="bg-white text-stone-950">
        <section className="border-b border-stone-200">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-800">Archive</p>
            <div className="mt-3 flex flex-col gap-5 border-y border-stone-900 py-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="font-serif text-5xl font-black leading-none md:text-7xl">Latest Reports</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                  Independent analysis on crypto markets, AI tooling, and automation systems. {articles.length} reports in the archive.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center lg:w-80">
                {categories.map((cat) => (
                  <Link key={cat.slug} href={cat.href} className="border border-stone-200 bg-white px-3 py-4 hover:border-red-800">
                    <span className="block font-serif text-3xl font-black text-stone-950">{cat.count}</span>
                    <span className="mt-1 block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-stone-500">
                      {cat.slug}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {sortedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="group grid gap-4 py-6 md:grid-cols-[9rem_minmax(0,1fr)_7rem]"
                >
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">
                    {categoryNames[article.category]}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-black leading-tight text-stone-950 group-hover:text-red-900 md:text-3xl">
                      {article.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 md:text-base">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm text-stone-500 md:block md:text-right">
                    <p>{article.date}</p>
                    <p className="md:mt-2">{article.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>

            <aside className="space-y-6">
              <div className="border border-stone-200 bg-neutral-50 p-5">
                <h2 className="font-serif text-2xl font-black text-stone-950">Sections</h2>
                <div className="mt-4 grid gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      className="flex items-center justify-between border-b border-stone-200 py-3 text-sm font-bold text-stone-800 hover:text-red-900"
                    >
                      <span>{cat.name}</span>
                      <span>{cat.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border border-stone-950 bg-stone-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-300">Dispatch</p>
                <h2 className="mt-2 font-serif text-2xl font-black">Weekly signal</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  A short brief on tools, protocols, and automation decisions worth knowing about.
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
