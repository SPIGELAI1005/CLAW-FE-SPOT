"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { L1VerdictRecord, ToolCall } from "@/lib/spotTypes";

interface ActionTimelineProps {
  toolCalls: ToolCall[];
  verdicts: L1VerdictRecord[];
  spotMode: "discuss" | "execute";
  onCreateVerdict?: (verdict: {
    action_id: string;
    verdict: "approve" | "block";
    rationale: string;
  }) => Promise<void>;
}

export function ActionTimeline({
  toolCalls,
  verdicts,
  spotMode,
  onCreateVerdict,
}: ActionTimelineProps) {
  const [showForm, setShowForm] = useState(false);

  const hasContent = toolCalls.length > 0 || verdicts.length > 0;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Action Timeline
        </div>
        {spotMode === "execute" && onCreateVerdict && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            L1 Verdict
          </button>
        )}
      </div>

      {showForm && onCreateVerdict && (
        <VerdictForm
          onSubmit={async (v) => {
            await onCreateVerdict(v);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!hasContent ? (
        <div className="py-6 text-center text-sm text-stone-400">
          {spotMode === "discuss"
            ? "Switch to EXECUTE mode to enable tool calls and L1 verdicts."
            : "No actions yet. Actions and L1 verdicts will appear here."}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Render tool calls */}
          {toolCalls.map((tc) => (
            <ToolCallCard key={tc.id} toolCall={tc} />
          ))}

          {/* Render L1 verdicts */}
          {verdicts.map((v) => (
            <VerdictCard key={v.id} verdict={v} />
          ))}
        </div>
      )}
    </Card>
  );
}

/* ── Tool Call Card ──────────────────────────────────────────────── */
function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const isApproved = toolCall.l1Verdict === "approve";

  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-900/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone="info">{toolCall.toolName}</Badge>
            {toolCall.l1Verdict && (
              <Badge tone={isApproved ? "success" : "danger"}>
                L1: {isApproved ? "Approved" : "Blocked"}
              </Badge>
            )}
          </div>
          <div className="mt-1.5 text-sm font-medium">{toolCall.intent}</div>
        </div>
        {toolCall.createdAt && (
          <div className="shrink-0 text-[10px] text-stone-400">
            {new Date(toolCall.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {Object.keys(toolCall.parameters).length > 0 && (
        <div className="mt-2 rounded-lg bg-stone-100 px-3 py-2 text-xs font-mono dark:bg-stone-800">
          {Object.entries(toolCall.parameters).map(([key, val]) => (
            <div key={key}>
              <span className="text-stone-500">{key}:</span>{" "}
              <span>{String(val)}</span>
            </div>
          ))}
        </div>
      )}

      {toolCall.l1Rationale && (
        <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="font-medium">L1 rationale:</span>{" "}
          {toolCall.l1Rationale}
        </div>
      )}

      {toolCall.outcome && (
        <div className="mt-1.5 text-xs text-stone-600 dark:text-stone-300">
          <span className="font-medium">Outcome:</span> {toolCall.outcome}
        </div>
      )}
    </div>
  );
}

/* ── L1 Verdict Card ─────────────────────────────────────────────── */
function VerdictCard({ verdict }: { verdict: L1VerdictRecord }) {
  const isApproved = verdict.verdict === "approve";

  return (
    <div
      className={`rounded-xl border p-3 ${
        isApproved
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              isApproved
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
            }`}
          >
            {isApproved ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            )}
          </div>
          <Badge tone={isApproved ? "success" : "danger"}>
            L1: {isApproved ? "APPROVE" : "BLOCK"}
          </Badge>
          <span className="text-[10px] font-medium text-stone-400">
            Action: {verdict.actionId}
          </span>
        </div>
        {verdict.createdAt && (
          <div className="shrink-0 text-[10px] text-stone-400">
            {new Date(verdict.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-stone-600 dark:text-stone-300">
        {verdict.rationale}
      </p>
    </div>
  );
}

/* ── Verdict Creation Form ───────────────────────────────────────── */
function VerdictForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: {
    action_id: string;
    verdict: "approve" | "block";
    rationale: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [actionId, setActionId] = useState("");
  const [verdict, setVerdict] = useState<"approve" | "block">("approve");
  const [rationale, setRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actionId.trim() || !rationale.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        action_id: actionId.trim(),
        verdict,
        rationale: rationale.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
    >
      <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
        New L1 Verdict
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium text-stone-600 dark:text-stone-400">
          Action ID
        </label>
        <input
          type="text"
          placeholder="e.g. tool-call-001"
          value={actionId}
          onChange={(e) => setActionId(e.target.value)}
          required
          className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium text-stone-600 dark:text-stone-400">
          Verdict
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVerdict("approve")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              verdict === "approve"
                ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400/50 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
            }`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setVerdict("block")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              verdict === "block"
                ? "bg-rose-100 text-rose-700 ring-2 ring-rose-400/50 dark:bg-rose-900/40 dark:text-rose-300"
                : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
            }`}
          >
            Block
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium text-stone-600 dark:text-stone-400">
          Rationale
        </label>
        <textarea
          placeholder="Explain why this action should be approved or blocked..."
          rows={3}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          required
          className="w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button as="button" variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button
          as="button"
          variant="primary"
          type="submit"
          disabled={isSubmitting || !actionId.trim() || !rationale.trim()}
        >
          {isSubmitting ? "Submitting..." : "Submit Verdict"}
        </Button>
      </div>
    </form>
  );
}
