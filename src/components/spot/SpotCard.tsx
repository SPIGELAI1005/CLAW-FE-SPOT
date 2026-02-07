import Link from "next/link";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { CertBadge } from "@/components/ui/CertBadge";
import type { Spot } from "@/lib/spotTypes";

interface SpotCardProps {
  spot: Spot;
}

const statusIndicator: Record<string, string> = {
  active: "bg-emerald-400",
  draft: "bg-stone-300",
  needs_review: "bg-amber-400",
  completed: "bg-sky-400",
  archived: "bg-stone-300",
};

export function SpotCard({ spot }: SpotCardProps) {
  return (
    <Link href={`/spots/${spot.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-[var(--card-shadow)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-amber-900/5">
        {/* Top accent bar */}
        <div className={`absolute inset-x-0 top-0 h-1 ${
          spot.mode === "execute"
            ? "bg-gradient-to-r from-amber-400 to-orange-500"
            : "bg-gradient-to-r from-sky-400 to-blue-500"
        }`} />

        <div className="flex items-start gap-3 pt-1">
          {/* Status dot */}
          <div className="mt-1.5 flex shrink-0">
            <span className={`h-2.5 w-2.5 rounded-full ${statusIndicator[spot.status] ?? "bg-stone-300"}`} role="status" aria-label={`Status: ${spot.status}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
              {spot.title}
            </div>
            <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {spot.goal}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <ModeBadge mode={spot.mode} />
          <CertBadge status={spot.certificationStatus} />
        </div>
      </div>
    </Link>
  );
}
