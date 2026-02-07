"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { allStatuses } from "@/lib/mockData";
import type { Table, TableStatus } from "@/lib/tableTypes";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type ApiTableRow = {
  id: string;
  status: string;
  title: string;
  goal: string;
  acceptance_criteria?: unknown;
  constraints?: unknown;
  created_at?: string;
  updated_at?: string;
};

function mapApiRow(row: ApiTableRow): Table {
  return {
    id: row.id,
    status: (row.status as TableStatus) ?? "draft",
    title: row.title,
    goal: row.goal,
    acceptanceCriteria: Array.isArray(row.acceptance_criteria) ? (row.acceptance_criteria as string[]) : [],
    constraints: Array.isArray(row.constraints) ? (row.constraints as string[]) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toneForStatus(status: string) {
  if (status === "done") return "success" as const;
  if (status === "running") return "warning" as const;
  if (status === "fix_required") return "danger" as const;
  return "neutral" as const;
}

function labelForStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TablesClient() {
  const [status, setStatus] = useState<(typeof allStatuses)[number]["value"]>("all");
  const [query, setQuery] = useState("");

  const [tables, setTables] = useState<Table[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tables")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load tables");
        const rows = (j?.tables ?? []) as ApiTableRow[];
        setTables(rows.map(mapApiRow));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setTables([]);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tables ?? [];
    return list
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) => (q ? (t.title + " " + t.goal).toLowerCase().includes(q) : true))
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }, [status, query, tables]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tables</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your Single Point Of Truth — goals, tasks, artifacts, and audit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button as="link" href="/tables/new" variant="secondary">
            New Table
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          value={status}
          onChange={setStatus}
          segments={allStatuses.map((s) => ({ value: s.value, label: s.label }))}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tables…"
          className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 sm:w-72"
        />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
          <div className="mt-2 text-xs opacity-80">
            If this is an auth error, sign in at <code>/login</code> and refresh.
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        {tables === null ? (
          <Card>
            <div className="text-sm font-semibold">Loading…</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Fetching your tables from Supabase.
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="text-sm font-semibold">No matching tables</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Try a different status filter or search query.
            </div>
          </Card>
        ) : (
          filtered.map((t) => {
            return (
              <Link key={t.id} href={`/tables/${t.id}`} className="group">
                <Card className="transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold tracking-tight">{t.title}</div>
                      <div className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {t.goal}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={toneForStatus(t.status)}>{labelForStatus(t.status)}</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
        Live mode: data is loaded from Supabase (auth + RLS).
      </div>
    </div>
  );
}
