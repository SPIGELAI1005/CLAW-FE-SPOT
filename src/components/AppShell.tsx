import Link from "next/link";

const navItems = [
  { href: "/tables", label: "Tables" },
  { href: "/recipes", label: "Recipes" },
  { href: "/devices", label: "Devices" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-4 sm:px-6">
        <aside className="hidden w-60 shrink-0 flex-col gap-4 md:flex">
          <div className="rounded-3xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
              CLAW:FE
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight">
              SPOT
            </div>
            <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              One table. One truth. Audited outcomes.
            </div>
          </div>

          <nav className="rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-baseline gap-3">
              <div className="text-sm font-semibold tracking-tight">
                CLAW:FE <span className="text-zinc-500">SPOT</span>
              </div>
              <div className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
                Single Point Of Truth • Spotlight
              </div>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Local-first agents • Cloud SPOT
            </div>
          </header>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
