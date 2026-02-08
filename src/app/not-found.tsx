import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        {/* Animated 404 badge */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg shadow-amber-200/40 dark:from-amber-900/30 dark:to-orange-900/30 dark:shadow-amber-900/20">
          <span className="gradient-text-animated bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-4xl font-extrabold text-transparent">
            404
          </span>
        </div>

        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
          Page not found
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Check the URL or navigate back to a known page.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="glass-btn glass-btn-orange inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-6 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30"
          >
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/"
            className="glass-btn inline-flex h-11 items-center justify-center rounded-xl border border-stone-200 bg-white/80 px-6 text-sm font-semibold text-stone-700 transition-all hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-stone-600"
          >
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-10 rounded-2xl border border-stone-200/60 bg-white/50 p-5 dark:border-stone-700/40 dark:bg-stone-900/50">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Quick navigation
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "SPOTs", href: "/spots" },
              { label: "Agents", href: "/agents" },
              { label: "Inbox", href: "/inbox" },
              { label: "Vault", href: "/vault" },
              { label: "Settings", href: "/settings" },
              { label: "Help & FAQ", href: "/faq" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
