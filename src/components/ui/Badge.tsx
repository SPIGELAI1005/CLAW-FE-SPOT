export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "certified";

const toneClasses: Record<BadgeTone, string> = {
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  danger:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  certified:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
  neutral:
    "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
