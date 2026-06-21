import Link from "next/link";

const recoveryLinks = [
  {
    title: "Latest articles",
    description: "Jump back into fresh technical breakdowns and research.",
    href: "/articles",
    cta: "Browse articles",
  },
  {
    title: "AI price calculator",
    description: "Estimate model and usage costs before you ship.",
    href: "/tools/ai-price-calculator",
    cta: "Open calculator",
  },
  {
    title: "Automation consulting",
    description: "Need hands-on help? Start with the implementation offer.",
    href: "/services/ai-automation-consulting",
    cta: "View services",
  },
];

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-zinc-950">
      <section className="relative overflow-hidden border-b border-zinc-800/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.16),_transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 md:flex-row md:items-center md:justify-between md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
              Error 404
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
              Signal lost,
              <span className="text-gradient block">page not found.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              The page you were looking for may have moved, expired, or never existed. Let’s get you back to something useful.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="btn-primary justify-center">
                Return home
              </Link>
              <Link href="/articles" className="btn-secondary justify-center">
                Explore articles
              </Link>
            </div>
          </div>

          <div className="card-elevated max-w-md p-6 md:p-7">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>Recovery options</span>
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
                Decryptica
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              {recoveryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition-colors hover:border-indigo-500/40 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-indigo-300">
                        {link.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{link.description}</p>
                    </div>
                    <span className="mt-1 text-indigo-400 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <div className="mt-4 text-sm font-medium text-indigo-300">{link.cta}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:grid-cols-3 md:p-8">
          {[
            "Technical guides on crypto, AI, and automation",
            "Practical tools, calculators, and implementation paths",
            "Clean navigation back into the highest-intent sections",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 px-4 py-4 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
