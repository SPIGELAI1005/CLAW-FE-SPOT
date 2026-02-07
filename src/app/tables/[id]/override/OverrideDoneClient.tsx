"use client";

import { useEffect, useState } from "react";

type OverrideRow = {
  id: string;
  run_id?: string | null;
  from_status?: string | null;
  to_status: string;
  reason: string;
  created_at: string;
};

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function OverrideDoneClient({
  tableId,
  tableStatus,
  latestRunId,
}: {
  tableId: string;
  tableStatus: string;
  latestRunId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [overrides, setOverrides] = useState<OverrideRow[] | null>(null);

  const canOverride = tableStatus !== "done";

  useEffect(() => {
    fetch(`/api/tables/${tableId}/override`)
      .then((r) => r.json())
      .then((j) => setOverrides((j?.overrides ?? []) as OverrideRow[]))
      .catch(() => setOverrides([]));
  }, [tableId]);

  async function submit() {
    setError(null);

    const r = reason.trim();
    if (!r) {
      setError("Please provide a reason.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: r, runId: latestRunId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Override failed");

      // simplest refresh mechanism (keeps us dependency-free)
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {canOverride ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Override & mark done
          </button>

          {open ? (
            <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                This bypasses the audit gate. Reason is recorded.
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Why are we overriding?"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
              {error ? (
                <div className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</div>
              ) : null}

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-300 px-3 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={submit}
                  className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {saving ? "Saving…" : "Confirm override"}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Done is locked in by audit (or previous override).
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Override history
        </div>
        {overrides === null ? (
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Loading…</div>
        ) : overrides.length === 0 ? (
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">None.</div>
        ) : (
          <div className="mt-2 space-y-2">
            {overrides.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono opacity-80">{fmt(o.created_at)}</div>
                  <div className="font-semibold">
                    {o.from_status ?? "?"} → {o.to_status}
                  </div>
                </div>
                <div className="mt-1">{o.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
