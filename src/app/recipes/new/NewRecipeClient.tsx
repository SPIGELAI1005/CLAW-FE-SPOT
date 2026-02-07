"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function linesToList(s: string): string[] {
  return s
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*]\s+/, ""));
}

export function NewRecipeClient() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [tableTitle, setTableTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [acceptanceCriteriaText, setAcceptanceCriteriaText] = useState("");
  const [constraintsText, setConstraintsText] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => title.trim() && tableTitle.trim() && goal.trim(), [title, tableTitle, goal]);

  async function create() {
    setError(null);
    if (!canCreate) {
      setError("Please fill in Recipe title, Table title, and Goal.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          template: {
            tableTitle: tableTitle.trim(),
            goal: goal.trim(),
            acceptanceCriteria: linesToList(acceptanceCriteriaText),
            constraints: linesToList(constraintsText),
          },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to create recipe");

      const id = j?.recipe?.id as string | undefined;
      if (!id) throw new Error("Create succeeded but no id returned");

      router.push(`/recipes/${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Recipe</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Recipes are reusable templates for creating consistent tables.
          </p>
        </div>
        <Button as="link" href="/recipes" variant="secondary">
          Back
        </Button>
      </div>

      <div className="mt-8 grid gap-4">
        <Card>
          <div className="grid gap-3">
            <div>
              <div className="text-sm font-semibold">Recipe title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Write 20 X posts"
                className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div>
              <div className="text-sm font-semibold">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional: what this recipe is for"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid gap-3">
            <div>
              <div className="text-sm font-semibold">Table title (template)</div>
              <input
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                placeholder="e.g. Write 20 X posts for launch"
                className="mt-2 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>

            <div>
              <div className="text-sm font-semibold">Goal (template)</div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                placeholder="What outcome do we want?"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Acceptance Criteria (template)</div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">One per line.</p>
          <textarea
            value={acceptanceCriteriaText}
            onChange={(e) => setAcceptanceCriteriaText(e.target.value)}
            rows={6}
            placeholder={`- 20 posts\n- No duplicate hooks\n- Clear CTA`}
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </Card>

        <Card>
          <div className="text-sm font-semibold">Constraints (template)</div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">One per line.</p>
          <textarea
            value={constraintsText}
            onChange={(e) => setConstraintsText(e.target.value)}
            rows={6}
            placeholder={`- Tone: practical, punchy\n- No over-claiming`}
            className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </Card>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button as="button" variant="secondary" onClick={() => router.push("/recipes")}>Cancel</Button>
          <Button as="button" onClick={create} disabled={!canCreate || saving}>
            {saving ? "Creating…" : "Create Recipe"}
          </Button>
        </div>
      </div>
    </div>
  );
}
