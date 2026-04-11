'use client';

export default function SeoDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message?.trim();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="section-heading mb-4">Daily Traffic Dashboard</h1>
      <div className="card-elevated p-8">
        <p className="text-zinc-200 text-lg">Unable to load dashboard metrics.</p>
        <p className="text-zinc-400 mt-2">Take the steps below to recover and reload safely.</p>
        {message ? (
          <p className="mt-3 rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Error details: {message}
          </p>
        ) : null}
        <ul className="mt-4 space-y-2 text-sm text-zinc-300 list-disc list-inside">
          <li>Click Retry to fetch metrics again.</li>
          <li>If retries fail, run the SEO checkpoint/feed jobs and verify KV connectivity.</li>
          <li>Confirm dashboard filters and dates are set to the expected reporting window.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={reset}>
            Retry Dashboard Load
          </button>
          <a href="/" className="btn-secondary">
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
