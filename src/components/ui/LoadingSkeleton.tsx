export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-stone-200/60 dark:bg-stone-800/60" />
        <div className="h-4 w-72 rounded-lg bg-stone-200/40 dark:bg-stone-800/40" />
      </div>
      {/* Content skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-stone-200/50 dark:bg-stone-800/50"
          />
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-20 rounded bg-stone-200/40 dark:bg-stone-800/40" />
      {/* Title */}
      <div className="h-8 w-64 rounded-xl bg-stone-200/60 dark:bg-stone-800/60" />
      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 rounded-2xl bg-stone-200/50 dark:bg-stone-800/50" />
          <div className="h-32 rounded-2xl bg-stone-200/50 dark:bg-stone-800/50" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-stone-200/50 dark:bg-stone-800/50" />
          <div className="h-32 rounded-2xl bg-stone-200/50 dark:bg-stone-800/50" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-xl bg-stone-200/60 dark:bg-stone-800/60" />
        <div className="h-4 w-64 rounded-lg bg-stone-200/40 dark:bg-stone-800/40" />
      </div>
      <div className="h-10 w-64 rounded-xl bg-stone-200/40 dark:bg-stone-800/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-stone-200/50 dark:bg-stone-800/50"
          />
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
      <div className="h-4 w-20 rounded bg-stone-200/40 dark:bg-stone-800/40" />
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-stone-200/60 dark:bg-stone-800/60" />
        <div className="h-4 w-72 rounded-lg bg-stone-200/40 dark:bg-stone-800/40" />
      </div>
      <div className="rounded-2xl border border-stone-200/60 bg-white/80 p-6 space-y-5 dark:border-stone-800 dark:bg-stone-900/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-stone-200/40 dark:bg-stone-800/40" />
            <div className="h-10 rounded-xl bg-stone-200/50 dark:bg-stone-800/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
