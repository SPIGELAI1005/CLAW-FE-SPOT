import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CertBadge } from "@/components/ui/CertBadge";
import type { Spot, L2Report } from "@/lib/spotTypes";

interface CertificateViewProps {
  spot: Spot;
  l2Report?: L2Report;
}

export function CertificateView({ spot, l2Report }: CertificateViewProps) {
  const isCertified = spot.certificationStatus === "certified";

  return (
    <Card className={isCertified ? "border-emerald-200 dark:border-emerald-900/50" : ""}>
      {/* Certificate Header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          {isCertified ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold">
          {isCertified ? "Certified Outcome" : "Certification Status"}
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {spot.title}
        </p>
        <div className="mt-3">
          <CertBadge status={spot.certificationStatus} />
        </div>
      </div>

      {/* Certificate Details */}
      {isCertified && (
        <div className="mt-6 space-y-4 border-t border-stone-100 pt-4 dark:border-stone-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Goal
              </div>
              <div className="mt-0.5 text-sm">{spot.goal}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Contract Scope
              </div>
              <div className="mt-0.5 text-sm">
                {spot.contract.scope || "Not specified"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Acceptance Criteria
            </div>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">
              {spot.contract.acceptanceCriteria.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-500"><path d="m9 12 2 2 4-4"/></svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
              L1 Review
            </div>
            <div className="mt-1">
              <Badge tone="success">PASS</Badge>
            </div>
          </div>

          {l2Report && (
            <div>
              <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                L2 Meta-Audit Verdict
              </div>
              <div className="mt-1 text-sm">{l2Report.report}</div>
              <div className="mt-2">
                <Badge tone="certified">
                  {l2Report.verdict.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Non-certified states */}
      {spot.certificationStatus === "rework" && (
        <div className="mt-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
          <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Rework Required
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            The L2 Meta-Auditor has requested changes. Please address the
            findings and resubmit.
          </p>
        </div>
      )}

      {spot.certificationStatus === "lockdown" && (
        <div className="mt-6 rounded-xl bg-rose-50 p-4 dark:bg-rose-950/30">
          <div className="text-sm font-medium text-rose-800 dark:text-rose-300">
            Lockdown
          </div>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            This SPOT has been locked down due to critical audit findings. Human
            intervention is required.
          </p>
        </div>
      )}

      {spot.certificationStatus === "human_escalation" && (
        <div className="mt-6 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
          <div className="text-sm font-medium text-violet-800 dark:text-violet-300">
            Human Escalation Required
          </div>
          <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
            This SPOT requires human review. An escalation has been sent to the
            appropriate reviewer.
          </p>
        </div>
      )}
    </Card>
  );
}
