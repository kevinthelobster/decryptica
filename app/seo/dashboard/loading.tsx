export default function LoadingSeoDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="card-elevated p-5 border border-indigo-500/20 bg-indigo-500/5">
        <p className="text-sm text-zinc-200">Loading dashboard data...</p>
        <p className="text-xs text-zinc-400 mt-1">
          Pulling SEO KPIs and traffic history from telemetry storage. If this takes over 10 seconds, refresh and retry.
        </p>
      </div>
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-80 bg-zinc-800 rounded" />
        <div className="h-4 w-full max-w-2xl bg-zinc-900 rounded" />
        <div className="h-16 w-full max-w-md bg-zinc-900 rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          <div className="card-elevated p-5 h-28" />
          <div className="card-elevated p-5 h-28" />
          <div className="card-elevated p-5 h-28" />
          <div className="card-elevated p-5 h-28" />
        </div>
        <div className="card-elevated h-72 mt-6" />
      </div>
    </div>
  );
}
