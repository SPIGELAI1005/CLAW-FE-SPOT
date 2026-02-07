import type { SpotMode } from "@/lib/spotTypes";

const modeConfig: Record<SpotMode, { label: string; className: string }> = {
  discuss: {
    label: "DISCUSS",
    className:
      "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  execute: {
    label: "EXECUTE",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
};

export function ModeBadge({ mode }: { mode: SpotMode }) {
  const cfg = modeConfig[mode];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
