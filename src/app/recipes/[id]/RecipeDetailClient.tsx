"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type RecipeRow = {
  id: string;
  title: string;
  description?: string | null;
  updated_at?: string;
};

type VersionRow = {
  id: string;
  version: number;
  template: any;
  created_at: string;
};

function linesFromList(list: any): string {
  if (!Array.isArray(list)) return "";
  return list.map((x) => String(x)).join("\n");
}

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function RecipeDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // edit fields
  const latest = versions[0];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [acceptanceCriteriaText, setAcceptanceCriteriaText] = useState("");
  const [constraintsText, setConstraintsText] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recipes/${id}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load recipe");
        setRecipe(j.recipe as RecipeRow);
        setVersions((j.versions ?? []) as VersionRow[]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  useEffect(() => {
    if (!recipe || versions.length === 0) return;
    const t = versions[0].template || {};
    setTitle(recipe.title ?? "");
    setDescription(recipe.description ?? "");
    setTableTitle(String(t.tableTitle ?? ""));
    setGoal(String(t.goal ?? ""));
    setAcceptanceCriteriaText(linesFromList(t.acceptanceCriteria));
    setConstraintsText(linesFromList(t.constraints));
  }, [recipe, versions]);

  const canSave = useMemo(() => title.trim() && tableTitle.trim() && goal.trim(), [title, tableTitle, goal]);

  async function saveNewVersion() {
    if (!id) return;
    setError(null);
    if (!canSave) {
      setError("Please fill in title, table title, and goal.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          template: {
            tableTitle: tableTitle.trim(),
            goal: goal.trim(),
            acceptanceCriteria: acceptanceCriteriaText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
            constraints: constraintsText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to save recipe version");
      // reload
      router.refresh();
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function createTableFromRecipe() {
    if (!id) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${id}/apply`, { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to create table from recipe");
      const tableId = j?.tableId as string;
      if (!tableId) throw new Error("No tableId returned");
      router.push(`/tables/${tableId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
        {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{recipe.title}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Versioned template. Latest: v{latest?.version ?? "?"} ({fmt(latest?.created_at)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button as="link" href="/recipes" variant="secondary">Back</Button>
          <Button as="button" onClick={createTableFromRecipe} disabled={saving}>
            {saving ? "Working…" : "Create table"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold">Recipe</div>
          <div className="mt-3 grid gap-3">
            <div>
              <div className="text-sm font-semibold">Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Template (latest)</div>
          <div className="mt-3 grid gap-3">
            <div>
              <div className="text-sm font-semibold">Table title</div>
              <input
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">Goal</div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Acceptance Criteria</div>
          <textarea
            value={acceptanceCriteriaText}
            onChange={(e) => setAcceptanceCriteriaText(e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </Card>

        <Card>
          <div className="text-sm font-semibold">Constraints</div>
          <textarea
            value={constraintsText}
            onChange={(e) => setConstraintsText(e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Save new version</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Saving creates a new immutable version entry.
              </div>
            </div>
            <Button as="button" onClick={saveNewVersion} disabled={!canSave || saving}>
              {saving ? "Saving…" : "Save version"}
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-10">
        <div className="text-sm font-semibold">Versions</div>
        <div className="mt-3 grid gap-2">
          {versions.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">v{v.version}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{fmt(v.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
