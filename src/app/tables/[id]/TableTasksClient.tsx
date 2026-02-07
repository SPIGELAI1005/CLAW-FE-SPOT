"use client";

import { useMemo, useState } from "react";

export type TableTaskRow = {
  id: string;
  title: string;
  done: boolean;
};

export function TableTasksClient({
  tableId,
  initialTasks,
}: {
  tableId: string;
  initialTasks: TableTaskRow[];
}) {
  const [tasks, setTasks] = useState<TableTaskRow[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doneCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);

  async function addTask() {
    setError(null);
    const title = newTitle.trim();
    if (!title) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to add task");

      const t = j?.task as { id: string; title: string; done: boolean };
      setTasks((prev) => [...prev, { id: t.id, title: t.title, done: !!t.done }]);
      setNewTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(taskId: string, nextDone: boolean) {
    setError(null);

    // optimistic
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: nextDone } : t)));

    try {
      const res = await fetch(`/api/tables/${tableId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, done: nextDone }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to update task");

      const updated = j?.task as { id: string; title: string; done: boolean };
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { id: updated.id, title: updated.title, done: !!updated.done } : t
        )
      );
    } catch (e) {
      // revert
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !nextDone } : t)));
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div>
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {doneCount}/{tasks.length} complete
      </div>

      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">No tasks yet.</div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleDone(task.id, !task.done)}
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              aria-label={task.done ? `Mark ${task.title} as open` : `Mark ${task.title} as done`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-md border ${
                    task.done
                      ? "border-emerald-400 bg-emerald-500"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                  }`}
                  aria-hidden
                />
                <div className={`text-sm font-medium ${task.done ? "line-through opacity-70" : ""}`}>{task.title}</div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{task.done ? "Done" : "Open"}</div>
            </button>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="h-10 w-full flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
        />
        <button
          type="button"
          disabled={saving || !newTitle.trim()}
          onClick={addTask}
          className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
        >
          {saving ? "Adding…" : "Add"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Click a task to toggle done.
      </div>
    </div>
  );
}
