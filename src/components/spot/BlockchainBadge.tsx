/**
 * Badge showing on-chain verification status.
 * Matches the existing CertBadge design language.
 */

interface BlockchainBadgeProps {
  status: "valid" | "revoked" | "superseded" | "not_found" | "pending";
}

const config: Record<
  BlockchainBadgeProps["status"],
  { label: string; classes: string }
> = {
  valid: {
    label: "On-Chain Verified",
    classes:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
  },
  revoked: {
    label: "Revoked",
    classes:
      "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800",
  },
  superseded: {
    label: "Superseded",
    classes:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800",
  },
  not_found: {
    label: "Not Anchored",
    classes:
      "bg-stone-100 text-stone-500 ring-1 ring-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700",
  },
  pending: {
    label: "Anchoring...",
    classes:
      "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800",
  },
};

export function BlockchainBadge({ status }: BlockchainBadgeProps) {
  const { label, classes } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${classes}`}
    >
      {/* Chain link icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      {label}
    </span>
  );
}
