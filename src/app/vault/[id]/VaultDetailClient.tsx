"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CertBadge } from "@/components/ui/CertBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useFetch, mapDbSpot } from "@/lib/useFetch";
import { exportJSON, exportPDF } from "@/lib/exportAudit";
import type { CertificationStatus } from "@/lib/spotTypes";

interface VaultDetailResponse {
  spot: Record<string, unknown>;
  l1_verdicts: Record<string, unknown>[];
  l2_reports: Record<string, unknown>[];
  participants: Record<string, unknown>[];
}

export function VaultDetailClient({ spotId }: { spotId: string }) {
  const { data, isLoading } = useFetch<VaultDetailResponse>(`/api/vault/${spotId}`);

  const handleExportJSON = useCallback(() => {
    if (!data) return;
    exportJSON(data, `audit-${spotId}.json`);
  }, [data, spotId]);

  const handleExportPDF = useCallback(() => {
    if (!data) return;
    const spot = mapDbSpot(data.spot);
    const l1 = data.l1_verdicts;
    const l2 = data.l2_reports;

    const sections = [
      {
        heading: "SPOT Details",
        content: `<p><strong>Title:</strong> ${spot.title}</p><p><strong>Goal:</strong> ${spot.goal}</p><p><strong>Mode:</strong> ${spot.mode.toUpperCase()}</p><p><strong>Status:</strong> ${spot.certificationStatus}</p>`,
      },
      {
        heading: "L1 Verdicts",
        content: l1.length > 0
          ? l1.map((v: Record<string, unknown>) =>
              `<div class="verdict"><span class="badge ${v.verdict === "approve" ? "badge-pass" : "badge-fail"}">${(v.verdict as string)?.toUpperCase()}</span> ${v.rationale as string}</div>`,
            ).join("")
          : "<p>No L1 verdicts recorded.</p>",
      },
      {
        heading: "L2 Meta-Audit Reports",
        content: l2.length > 0
          ? l2.map((r: Record<string, unknown>) =>
              `<div class="verdict"><span class="badge ${r.verdict === "pass" ? "badge-pass" : "badge-fail"}">${(r.verdict as string)?.toUpperCase()}</span> ${r.report as string}</div>`,
            ).join("")
          : "<p>No L2 reports recorded.</p>",
      },
    ];

    if (spot.certificationStatus === "certified") {
      sections.push({
        heading: "Certification",
        content: `<div class="certified"><strong>CERTIFIED</strong><p>This outcome has been certified by L2 Meta-Auditor.</p></div>`,
      });
    }

    exportPDF(spot.title, sections);
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
      </div>
    );
  }

  const spot = mapDbSpot(data.spot);
  const l1Verdicts = data.l1_verdicts;
  const l2Reports = data.l2_reports;
  const lastL2 = l2Reports[l2Reports.length - 1];
  const l2Verdict = (lastL2?.verdict as string) ?? null;
  const certStatus = (spot.certificationStatus as CertificationStatus) ?? "uncertified";
  const approvedCount = l1Verdicts.filter((v) => v.verdict === "approve").length;
  const blockedCount = l1Verdicts.filter((v) => v.verdict === "block").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/vault"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Vault
      </Link>

      <PageHeader
        title={`Audit: ${spot.title}`}
        subtitle="Complete audit trail for this SPOT."
      >
        <Button as="button" variant="secondary" onClick={handleExportJSON}>
          Export JSON
        </Button>
        <Button as="button" variant="secondary" onClick={handleExportPDF}>
          Export PDF
        </Button>
      </PageHeader>

      {/* Summary */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Certification Summary
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-stone-500">L1 Verdicts</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone="success">{approvedCount} approved</Badge>
              {blockedCount > 0 && <Badge tone="danger">{blockedCount} blocked</Badge>}
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-500">L2 Status</div>
            <div className="mt-1">
              <CertBadge status={certStatus} />
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-500">Participants</div>
            <div className="mt-1 text-sm font-medium">
              {data.participants.length} member{data.participants.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </Card>

      {/* L1 Verdicts */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          L1 Audit Verdicts
        </div>
        {l1Verdicts.length > 0 ? (
          <div className="space-y-2">
            {l1Verdicts.map((v, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <Badge tone={v.verdict === "approve" ? "success" : "danger"}>
                  {(v.verdict as string)?.toUpperCase()}
                </Badge>
                <div className="flex-1 text-stone-600 dark:text-stone-300">
                  {v.rationale as string}
                </div>
                <span className="shrink-0 text-stone-400">
                  {v.created_at ? new Date(v.created_at as string).toLocaleTimeString() : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-stone-400">No L1 verdicts yet.</p>
        )}
      </Card>

      {/* L2 Reports */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          L2 Meta-Audit Reports
        </div>
        {l2Reports.length > 0 ? (
          <div className="space-y-3">
            {l2Reports.map((r, i) => (
              <div key={i} className="rounded-lg bg-stone-50 p-3 dark:bg-stone-900">
                <div className="mb-1 flex items-center gap-2">
                  <Badge
                    tone={(r.verdict as string) === "pass" ? "success" : "danger"}
                  >
                    {(r.verdict as string)?.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-stone-400">
                    {r.created_at ? new Date(r.created_at as string).toLocaleString() : ""}
                  </span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  {r.report as string}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-stone-400">No L2 reports yet.</p>
        )}

        {l2Verdict === "pass" && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            <div>
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">CERTIFIED</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                This outcome has been certified by L2 Meta-Auditor.
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Immutable Log from messages */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Immutable Log
        </div>
        {Array.isArray(data.spot.log) && (data.spot.log as Record<string, unknown>[]).length > 0 ? (
          <div className="space-y-2">
            {(data.spot.log as Record<string, unknown>[]).map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="w-16 shrink-0 font-mono text-stone-400">
                  {entry.created_at
                    ? new Date(entry.created_at as string).toLocaleTimeString()
                    : "—"}
                </span>
                <span className="flex-1 text-stone-600 dark:text-stone-300">
                  {entry.content as string}
                </span>
                <span className="shrink-0 text-stone-400">
                  {entry.sender_name as string}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-stone-400">No log entries yet.</p>
        )}
      </Card>
    </div>
  );
}
