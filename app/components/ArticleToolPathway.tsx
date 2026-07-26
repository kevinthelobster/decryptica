import Link from 'next/link';
import LeadMagnetCapture from './LeadMagnetCapture';
import type { Article } from '../data/articles';
import { getLeadMagnetBySlug } from '../data/lead-magnets';
import { getRecommendedTool } from '../data/tools';

type ArticleToolPathwayProps = {
  article: Article;
};

function pathwayCopy(article: Article, toolTitle: string) {
  const lower = `${article.title} ${article.slug} ${(article.tags || []).join(' ')}`.toLowerCase();

  if (lower.includes('solana') && lower.includes('rpc')) {
    return {
      eyebrow: 'Reader tool',
      title: 'Benchmark the RPC provider before you buy',
      body: 'Turn the comparison into a vendor scorecard for latency, websocket stability, failover, support, and cost predictability.',
    };
  }

  if (lower.includes('risk') || lower.includes('agent') || lower.includes('security')) {
    return {
      eyebrow: 'Launch gate',
      title: 'Run the workflow risk check before rollout',
      body: 'Flag prompt injection, private data, external actions, approval gaps, logging, rollback, and ownership issues before the workflow ships.',
    };
  }

  if (article.category === 'automation') {
    return {
      eyebrow: 'Operator calculator',
      title: 'Estimate whether the workflow is worth automating',
      body: 'Use the ROI estimator to pressure-test time savings, payback, maintenance cost, and whether the scope should be narrowed.',
    };
  }

  return {
    eyebrow: 'Next step',
    title: `Use the ${toolTitle}`,
    body: 'Move from reading into a practical calculation, checklist, or packet matched to the decision this article raises.',
  };
}

export default function ArticleToolPathway({ article }: ArticleToolPathwayProps) {
  const tool = getRecommendedTool({
    category: article.category,
    title: article.title,
    slug: article.slug,
    tags: article.tags,
    primaryConversionHref: article.primaryConversionHref,
  });
  const offer = getLeadMagnetBySlug(tool.leadMagnetSlug);
  const copy = pathwayCopy(article, tool.shortTitle);

  return (
    <section className="mb-8 border border-stone-900 bg-white p-5 md:p-6" aria-label="Practical next step">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-800">{copy.eyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl font-black leading-tight text-stone-950">{copy.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-700">{copy.body}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={tool.href}
              className="inline-flex min-h-11 items-center justify-center bg-red-900 px-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-red-950"
            >
              Open {tool.shortTitle}
            </Link>
            <Link
              href="/tools"
              className="inline-flex min-h-11 items-center justify-center border border-stone-950 px-4 text-sm font-bold uppercase tracking-[0.1em] text-stone-950 hover:bg-stone-950 hover:text-white"
            >
              Tools Desk
            </Link>
          </div>
        </div>
        <LeadMagnetCapture
          offer={offer}
          location="article_tool_pathway"
          articleSlug={article.slug}
          category={article.category}
          compact
        />
      </div>
    </section>
  );
}
