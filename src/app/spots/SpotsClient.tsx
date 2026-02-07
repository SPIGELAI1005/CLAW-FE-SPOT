"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { SpotCard } from "@/components/spot/SpotCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch, mapDbSpot } from "@/lib/useFetch";
import type { Spot, SpotFilterValue } from "@/lib/spotTypes";
import { spotFilters } from "@/lib/spotTypes";

interface SpotsResponse {
  spots: Record<string, unknown>[];
}

export function SpotsClient() {
  const [filter, setFilter] = useState<SpotFilterValue>("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useFetch<SpotsResponse>("/api/spots");

  const spots: Spot[] = (data?.spots ?? []).map(mapDbSpot) as Spot[];

  const filtered = spots.filter((spot) => {
    if (search && !spot.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "all") return true;
    if (filter === "discuss") return spot.mode === "discuss";
    if (filter === "execute") return spot.mode === "execute";
    if (filter === "certified") return spot.certificationStatus === "certified";
    if (filter === "needs_action")
      return spot.certificationStatus === "rework" || spot.status === "needs_review";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="SPOTs" subtitle="Your collaboration workspaces.">
        <Button as="link" href="/spots/new" variant="primary">
          + Create SPOT
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-950">
          {spotFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 sm:max-w-xs">
          <Input
            placeholder="Search SPOTs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No SPOTs found"
          description={search ? "Try a different search term." : "Create your first SPOT to get started."}
          actionLabel="New SPOT"
          actionHref="/spots/new"
        />
      )}
    </div>
  );
}
