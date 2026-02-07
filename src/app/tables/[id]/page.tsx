import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableTasksClient } from "./TableTasksClient";
import { TableRunsClient } from "./TableRunsClient";
import { OverrideDoneClient } from "./override/OverrideDoneClient";

function labelForStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toneForStatus(status: string) {
  if (status === "done") return "success" as const;
  if (status === "running") return "warning" as const;
  if (status === "fix_required") return "danger" as const;
  return "neutral" as const;
}

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: table, error: tableErr } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();

  if (tableErr || !table) return notFound();

  const { data: tasks } = await supabase
    .from("table_tasks")
    .select("id, title, done")
    .eq("table_id", id)
    .order("created_at", { ascending: true });

  const { data: runs } = await supabase
    .from("runs")
    .select("id, status, title, log, created_at, updated_at")
    .eq("table_id", id)
    .order("created_at", { ascending: false });

  const acceptance = Array.isArray(table.acceptance_criteria)
    ? (table.acceptance_criteria as string[])
    : [];
  const constraints = Array.isArray(table.constraints)
    ? (table.constraints as string[])
    : [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{table.title}</h1>
            <Badge tone={toneForStatus(String(table.status))}>{labelForStatus(String(table.status))}</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{table.goal}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button as="link" href="/tables" variant="secondary">
            Back
          </Button>
          <button
            disabled
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-200 px-4 text-sm font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            title="Runner integration comes later"
          >
            Run
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold">Runs</div>
          <TableRunsClient
            tableId={id}
            initialRuns={(runs ?? []) as Array<{
              id: string;
              status: string;
              title: string;
              log: Array<{ at: string; type: string; message: string }>;
              created_at?: string;
              updated_at?: string;
            }>}
          />
        </Card>

        <Card>
          <div className="text-sm font-semibold">Acceptance Criteria</div>
          {acceptance.length ? (
            <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {acceptance.map((c, idx) => (
                <li key={idx} className="list-disc pl-5">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">None yet.</div>
          )}

          <div className="mt-6 text-sm font-semibold">Constraints</div>
          {constraints.length ? (
            <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {constraints.map((c, idx) => (
                <li key={idx} className="list-disc pl-5">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">None yet.</div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold">Tasks</div>
          <TableTasksClient
            tableId={id}
            initialTasks={(tasks ?? []) as Array<{ id: string; title: string; done: boolean }>}
          />
        </Card>

        <Card>
          <div className="text-sm font-semibold">Status</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <div>
              Table status: <span className="font-medium">{String(table.status)}</span>
            </div>
            <div className="mt-2 text-xs">
              Phase 3: audit gate + override done.
            </div>

            <div className="mt-4">
              <OverrideDoneClient
                tableId={id}
                tableStatus={String(table.status)}
                latestRunId={(runs ?? [])[0]?.id}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
