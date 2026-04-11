import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildSeoDashboard } from '@/app/lib/seo-dashboard';
import { requireBoardSession } from '@/app/lib/board-auth';

export const metadata: Metadata = {
  title: 'SEO Dashboard | Decryptica',
  description: 'Daily SEO and website traffic KPI dashboard for board review.',
};
export const dynamic = 'force-dynamic';

const DATE_RANGE_OPTIONS = [7, 14, 30] as const;

function parseRange(rawRange: string | undefined): (typeof DATE_RANGE_OPTIONS)[number] {
  const numericRange = Number(rawRange);
  if (DATE_RANGE_OPTIONS.includes(numericRange as (typeof DATE_RANGE_OPTIONS)[number])) {
    return numericRange as (typeof DATE_RANGE_OPTIONS)[number];
  }
  return 14;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatTrend(value: number, suffix = '%'): string {
  if (value > 0) return `+${value.toFixed(1)}${suffix}`;
  if (value < 0) return `${value.toFixed(1)}${suffix}`;
  return `0${suffix}`;
}

function trendColor(value: number, invert = false): string {
  const positive = invert ? value < 0 : value > 0;
  const negative = invert ? value > 0 : value < 0;
  if (positive) return 'text-emerald-400';
  if (negative) return 'text-rose-400';
  return 'text-zinc-400';
}

export default async function SeoDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const isBoardAuth = await requireBoardSession();
  if (!isBoardAuth) {
    redirect('/seo/board-login');
  }

  const params = (await searchParams) ?? {};
  const selectedRange = parseRange(params.range);
  const dashboard = await buildSeoDashboard({ rangeDays: selectedRange });
  const selectedRangeLabel = `${selectedRange} days`;
  const selectedRangePageViews = dashboard.dailyTraffic.reduce((sum, point) => sum + point.pageViews, 0);
  const reportTimeZone = 'UTC';

  const hasData =
    dashboard.current.pageViews30d > 0 ||
    dashboard.current.trackedKeywords > 0 ||
    dashboard.current.indexedPages > 0;

  const maxTraffic = Math.max(...dashboard.dailyTraffic.map((point) => point.pageViews), 1);

  if (!hasData) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="section-heading mb-4">Daily Traffic Dashboard</h1>
        <div className="card-elevated p-8">
          <p className="text-zinc-300 text-lg">No KPI data is available yet.</p>
          <p className="text-zinc-400 mt-2">
            Run the daily SEO checkpoint/feed jobs to populate traffic, ranking, and indexation metrics.
          </p>
          <Link href="/" className="btn-secondary mt-6 inline-flex">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.2em] uppercase text-indigo-300">Board Reporting</p>
        <h1 className="section-heading">Daily Website Traffic Dashboard</h1>
        <p className="text-zinc-400 max-w-3xl">
          Single view of daily traffic viability KPIs: volume, search visibility, technical quality, and index coverage.
        </p>
        <p className="text-sm text-zinc-500">
          Showing last <span className="text-zinc-200 font-medium">{selectedRangeLabel}</span>. Date boundaries and labels use{' '}
          <span className="text-zinc-200 font-medium">{reportTimeZone}</span>.
        </p>
      </header>

      <section className="card-elevated p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-zinc-200 text-sm font-medium">Date range</p>
            <p className="text-zinc-400 text-xs mt-1">Selected: {selectedRangeLabel}</p>
          </div>
          <div className="flex gap-2">
            {DATE_RANGE_OPTIONS.map((rangeOption) => {
              const isActive = rangeOption === selectedRange;
              return (
                <Link
                  key={rangeOption}
                  href={`/seo/dashboard?range=${rangeOption}`}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100'
                      : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  Last {rangeOption}d
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="card-elevated p-5">
          <p className="text-zinc-400 text-sm">30-Day Page Views</p>
          <p className="text-3xl font-semibold text-white mt-2">{formatNumber(dashboard.current.pageViews30d)}</p>
          <p className={`text-sm mt-2 ${trendColor(dashboard.trends.pageViewsTrend)}`}>
            {formatTrend(dashboard.trends.pageViewsTrend)} vs previous 30 days
          </p>
        </article>

        <article className="card-elevated p-5">
          <p className="text-zinc-400 text-sm">Tracked Keywords</p>
          <p className="text-3xl font-semibold text-white mt-2">{formatNumber(dashboard.current.trackedKeywords)}</p>
          <p className={`text-sm mt-2 ${trendColor(dashboard.trends.rankingTrend)}`}>
            {formatTrend(dashboard.trends.rankingTrend, ' positions')} average change
          </p>
        </article>

        <article className="card-elevated p-5">
          <p className="text-zinc-400 text-sm">Average CWV Score</p>
          <p className="text-3xl font-semibold text-white mt-2">{dashboard.current.avgCwvScore.toFixed(1)}</p>
          <p className={`text-sm mt-2 ${trendColor(dashboard.trends.cwvTrend)}`}>
            {formatTrend(dashboard.trends.cwvTrend, ' pts')} vs yesterday
          </p>
        </article>

        <article className="card-elevated p-5">
          <p className="text-zinc-400 text-sm">Indexed Pages</p>
          <p className="text-3xl font-semibold text-white mt-2">{formatNumber(dashboard.current.indexedPages)}</p>
          <p className={`text-sm mt-2 ${trendColor(dashboard.trends.indexationTrend)}`}>
            {formatTrend(dashboard.trends.indexationTrend, ' pp')} index-rate delta
          </p>
        </article>
      </section>

      <section className="card-elevated p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Daily Traffic Trend ({selectedRangeLabel})</h2>
            <p className="text-zinc-400 text-sm mt-1">Daily granularity across crypto, AI, and automation traffic.</p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p>{selectedRangeLabel} total: {formatNumber(selectedRangePageViews)} views</p>
            <p>Latest day: {formatNumber(dashboard.dailyTraffic[dashboard.dailyTraffic.length - 1]?.pageViews ?? 0)} views</p>
            <p>Timezone: {reportTimeZone}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div
            className="grid gap-2 items-end h-52 min-w-[560px]"
            style={{ gridTemplateColumns: `repeat(${dashboard.dailyTraffic.length}, minmax(0, 1fr))` }}
          >
            {dashboard.dailyTraffic.map((point) => {
              const height = Math.max(8, Math.round((point.pageViews / maxTraffic) * 100));
              const shortDate = new Date(`${point.date}T00:00:00Z`).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                timeZone: 'UTC',
              });

              return (
                <div key={point.date} className="flex flex-col items-center justify-end gap-2">
                  <div
                    className="w-full max-w-8 bg-indigo-500/80 hover:bg-indigo-400 transition-colors rounded-t"
                    style={{ height: `${height}%` }}
                    aria-label={`${point.pageViews} page views on ${point.date}`}
                    title={`${point.date}: ${formatNumber(point.pageViews)} page views`}
                  />
                  <span className="text-[10px] text-zinc-500">{shortDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-elevated p-6">
          <h2 className="font-display text-xl font-semibold text-white">Top Keyword Positions</h2>
          <p className="text-zinc-400 text-sm mt-1">Best-performing tracked terms from Google US desktop+mobile snapshots.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="py-2 text-left font-medium">Keyword</th>
                  <th className="py-2 text-left font-medium">Pos</th>
                  <th className="py-2 text-left font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topKeywords.slice(0, 8).map((keyword) => (
                  <tr key={keyword.keyword} className="border-b border-zinc-900/80">
                    <td className="py-2 text-zinc-200">{keyword.keyword}</td>
                    <td className="py-2 text-white">{keyword.position}</td>
                    <td className={`py-2 ${trendColor(keyword.trend, true)}`}>
                      {keyword.trend > 0 ? `+${keyword.trend}` : keyword.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card-elevated p-6">
          <h2 className="font-display text-xl font-semibold text-white">KPI Definitions</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li><span className="text-white font-medium">30-Day Page Views:</span> Total page views over the latest 30 calendar days.</li>
            <li><span className="text-white font-medium">Tracked Keywords:</span> Count of keyword ranking records currently tracked.</li>
            <li><span className="text-white font-medium">Average CWV Score:</span> Composite Core Web Vitals quality score from the latest checkpoint.</li>
            <li><span className="text-white font-medium">Indexed Pages:</span> URLs currently reported as indexed in checkpoint indexation status.</li>
          </ul>
          <div className="mt-6 text-sm text-zinc-400">
            Dashboard path for board review: <code className="text-zinc-200">/seo/dashboard</code>
          </div>
        </article>
      </section>
    </div>
  );
}
