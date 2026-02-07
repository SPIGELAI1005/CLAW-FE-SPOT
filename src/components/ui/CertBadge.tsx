import type { CertificationStatus } from "@/lib/spotTypes";

const certConfig: Record<
  CertificationStatus,
  { label: string; className: string }
> = {
  uncertified: {
    label: "Uncertified",
    className: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
  },
  certified: {
    label: "Certified",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  rework: {
    label: "Rework",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  lockdown: {
    label: "Lockdown",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
  human_escalation: {
    label: "Human Escalation",
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
};

export function CertBadge({ status }: { status: CertificationStatus }) {
  const cfg = certConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
