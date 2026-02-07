"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";

export type RunLogEvent = {
  at: string;
  type: string;
  message: string;
};

export type AuditIssue = {
  title: string;
  severity?: string;
  details?: string;
  fix?: string;
};

export type AuditReport = {
  id: string;
  passed: boolean;
  summary?: string | null;
  issues?: AuditIssue[];
  created_at?: string;
};

export type RunRow = {
  id: string;
  status: string;
  title: string;
  log?: RunLogEvent[];
  created_at?: string;
  updated_at?: string;
};

function toneForStatus(status: string) {
  if (status === "done") return "success" as const;
  if (status === "running") return "warning" as const;
  if (status === "fix_required") return "danger" as const;
  if (status === "needs_review") return "warning" as const;
  return "neutral" as const;
}

function labelForStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function TableRunsClient({
  tableId,
  initialRuns,
}: {
  tableId: string;
  initialRuns: RunRow[];
}) {
  const [runs, setRuns] = useState<RunRow[]>(initialRuns);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [auditByRunId, setAuditByRunId] = useState<Record<string, AuditReport | null>>({});
  const [auditOpenRunId, setAuditOpenRunId] = useState<string | null>(null);
  const [auditPassed, setAuditPassed] = useState(true);
  const [auditSummary, setAuditSummary] = useState("");
  const [auditIssuesText, setAuditIssuesText] = useState("");

  const hasRuns = runs.length > 0;

  const newestLabel = useMemo(() => {
    if (!runs.length) return null;
    return fmt(runs[0].created_at || runs[0].updated_at);
  }, [runs]);

  async function createRun() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Run ${runs.length + 1}` }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to create run");
      const r = j?.run as RunRow;
      if (!r?.id) throw new Error("Run created but no id returned");
      setRuns((prev) => [r, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function simulateRun(runId: string) {
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/tables/${tableId}/runs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, action: "simulate" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to simulate run");
      const updated = j?.run as RunRow;
      setRuns((prev) => prev.map((r) => (r.id === runId ? updated : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function loadAudit(runId: string) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/runs/${runId}/audit`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to load audit");
      setAuditByRunId((prev) => ({ ...prev, [runId]: (j?.report ?? null) as AuditReport | null }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function openAudit(runId: string) {
    setAuditOpenRunId(runId);
    setAuditPassed(true);
    setAuditSummary("");
    setAuditIssuesText("");
  }

  async function submitAudit(runId: string) {
    setError(null);
    setSaving(true);

    const issues: AuditIssue[] = auditIssuesText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((title) => ({ title, severity: "error" }));

    try {
      const res = await fetch(`/api/tables/${tableId}/runs/${runId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passed: auditPassed,
          summary: auditSummary.trim() || undefined,
          issues,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to submit audit");

      const report = j?.report as AuditReport;
      setAuditByRunId((prev) => ({ ...prev, [runId]: report }));

      // Update local run status based on audit outcome.
      const nextStatus = (j?.nextStatus as string) || (auditPassed ? "done" : "fix_required");
      setRuns((prev) => prev.map((r) => (r.id === runId ? { ...r, status: nextStatus } : r)));

      setAuditOpenRunId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {hasRuns ? (
            <>
              {runs.length} runs • latest {newestLabel}
            </>
          ) : (
            <>No runs yet.</>
          )}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={createRun}
          className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
        >
          {saving ? "Creating…" : "+ New Run"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {runs.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Create a run to start execution (runner integration comes later).
          </div>
        ) : (
          runs.map((r) => {
            const audit = auditByRunId[r.id];
            const isAuditOpen = auditOpenRunId === r.id;

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{fmt(r.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.status === "queued" ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => simulateRun(r.id)}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        Simulate
                      </button>
                    ) : null}

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => loadAudit(r.id)}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      title="Load latest audit report"
                    >
                      Load audit
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => openAudit(r.id)}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      Audit
                    </button>

                    <Badge tone={toneForStatus(r.status)}>{labelForStatus(r.status)}</Badge>
                  </div>
                </div>

                {audit ? (
                  <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">
                        Audit: {audit.passed ? "PASS" : "FAIL"}
                      </div>
                      <div className="opacity-80">{fmt(audit.created_at)}</div>
                    </div>
                    {audit.summary ? <div className="mt-1">{audit.summary}</div> : null}
                    {Array.isArray(audit.issues) && audit.issues.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {audit.issues.map((i, idx) => (
                          <li key={idx}>{i.title}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                {isAuditOpen ? (
                  <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`audit-${r.id}`}
                          checked={auditPassed}
                          onChange={() => setAuditPassed(true)}
                        />
                        PASS
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`audit-${r.id}`}
                          checked={!auditPassed}
                          onChange={() => setAuditPassed(false)}
                        />
                        FAIL
                      </label>
                    </div>

                    <textarea
                      value={auditSummary}
                      onChange={(e) => setAuditSummary(e.target.value)}
                      placeholder="Audit summary (optional)"
                      rows={2}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                    />

                    <textarea
                      value={auditIssuesText}
                      onChange={(e) => setAuditIssuesText(e.target.value)}
                      placeholder={
                        auditPassed
                          ? "Issues (optional) — one per line"
                          : "Issues (required for FAIL) — one per line"
                      }
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                    />

                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAuditOpenRunId(null)}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={saving || (!auditPassed && auditIssuesText.trim().length === 0)}
                        onClick={() => submitAudit(r.id)}
                        className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
                      >
                        {saving ? "Saving…" : "Submit audit"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {Array.isArray(r.log) && r.log.length ? (
                  <div className="mt-3 space-y-1">
                    {r.log.map((e, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="w-[160px] shrink-0 font-mono opacity-80">{fmt(e.at)}</span>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                          {e.type}
                        </span>
                        <span className="min-w-0">{e.message}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Phase 3 (Audit gate): “Audit” creates PASS/FAIL reports and updates run/table status.
      </div>
    </div>
  );
}
