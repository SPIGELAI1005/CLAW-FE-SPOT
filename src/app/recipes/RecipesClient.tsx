"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type RecipeRow = {
  id: string;
  title: string;
  description?: string | null;
  updated_at?: string;
};

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function RecipesClient() {
  const [recipes, setRecipes] = useState<RecipeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/recipes")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Failed to load recipes");
        setRecipes((j?.recipes ?? []) as RecipeRow[]);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setRecipes([]);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = recipes ?? [];
    return list.filter((r) => (q ? (r.title + " " + (r.description ?? "")).toLowerCase().includes(q) : true));
  }, [recipes, query]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Reusable table blueprints: goal, acceptance criteria, constraints.
          </p>
        </div>
        <Button as="link" href="/recipes/new" variant="secondary">
          New Recipe
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes…"
          className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 sm:w-72"
        />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        {recipes === null ? (
          <Card>
            <div className="text-sm font-semibold">Loading…</div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="text-sm font-semibold">No recipes yet</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create one and reuse it to create consistent tables.
            </div>
          </Card>
        ) : (
          filtered.map((r) => (
            <Link key={r.id} href={`/recipes/${r.id}`} className="group">
              <Card className="transition-colors group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold tracking-tight">{r.title}</div>
                    {r.description ? (
                      <div className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {r.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{fmt(r.updated_at)}</div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
