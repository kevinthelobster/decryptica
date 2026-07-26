import Link from 'next/link';

type ArticleTrustLayerProps = {
  article: {
    author?: string;
    authorRole?: string;
    reviewedBy?: string;
    reviewedByRole?: string;
    reviewSummary?: string;
    date: string;
    lastUpdated?: string;
    sourcesReviewed?: number;
    updateHistory?: Array<{
      date: string;
      label: string;
      note?: string;
    }>;
  };
  methodAnchorId: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDisplayDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return DATE_FORMATTER.format(parsed);
}

function buildUpdateHistory(article: ArticleTrustLayerProps['article']) {
  if (article.updateHistory?.length) {
    return article.updateHistory;
  }

  const history = [
    {
      date: article.date,
      label: 'Published',
      note: 'Initial editorial release.',
    },
  ];

  if (article.lastUpdated && article.lastUpdated !== article.date) {
    history.unshift({
      date: article.lastUpdated,
      label: 'Updated',
      note: 'Reviewed and refreshed after source or market changes.',
    });
  }

  return history;
}

export default function ArticleTrustLayer({
  article,
  methodAnchorId,
}: ArticleTrustLayerProps) {
  const authorName = article.author || 'Decryptica Editorial Desk';
  const authorRole = article.authorRole || 'Staff analysis';
  const reviewerName = article.reviewedBy || 'Decryptica editorial';
  const reviewerRole = article.reviewedByRole || 'Editorial review';
  const reviewSummary =
    article.reviewSummary ||
    'We publish after reviewing source material, checking key claims against primary documentation, and tightening the piece when pricing, product scope, or market conditions shift.';
  const updateHistory = buildUpdateHistory(article);
  const sourcesReviewed =
    typeof article.sourcesReviewed === 'number' && article.sourcesReviewed > 0
      ? `${article.sourcesReviewed} sources reviewed`
      : 'Primary-source review where available';

  return (
    <section className="mt-6 border border-stone-200 bg-white px-4 py-3" aria-label="Editorial trust">
      <details>
        <summary className="cursor-pointer list-none font-display text-sm font-semibold uppercase tracking-wider text-stone-500 marker:hidden">
          Why trust this page
        </summary>
        <div className="mt-3 grid gap-4 text-sm leading-6 text-stone-700 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p>
              Independent analysis from Decryptica, published by Renegade Reels LLC. Written by{' '}
              <span className="font-semibold text-stone-950">{authorName}</span>
              {authorRole ? `, ${authorRole}` : ''}. Reviewed by{' '}
              <span className="font-semibold text-stone-950">{reviewerName}</span>
              {reviewerRole ? `, ${reviewerRole}` : ''}.
            </p>
            <p className="mt-2">
              {reviewSummary}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500">
              <span>{sourcesReviewed}</span>
              <a href={`#${methodAnchorId}`} className="text-red-900 underline underline-offset-4 hover:text-stone-950">
                Method
              </a>
              <Link href="/about" className="text-red-900 underline underline-offset-4 hover:text-stone-950">
                About Decryptica
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Update history</p>
            <ol className="mt-2 space-y-2">
              {updateHistory.map((event) => (
                <li key={`${event.label}-${event.date}`} className="border-l-2 border-red-900/70 pl-3">
                  <p className="font-semibold text-stone-950">
                    {event.label}
                    <span className="ml-2 font-normal text-stone-500">{formatDisplayDate(event.date)}</span>
                  </p>
                  {event.note ? <p className="text-sm leading-6 text-stone-700">{event.note}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </details>
    </section>
  );
}
