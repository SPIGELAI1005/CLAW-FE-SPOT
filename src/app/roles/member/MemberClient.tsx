"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SpotCard } from "@/components/spot/SpotCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch, mapDbSpot } from "@/lib/useFetch";
import type { Spot } from "@/lib/spotTypes";

interface SpotsResponse {
  spots: Record<string, unknown>[];
}

interface InboxResponse {
  items: Record<string, unknown>[];
}

export function MemberClient() {
  const { data: spotsData, isLoading: isSpotsLoading } = useFetch<SpotsResponse>("/api/spots");
  const { data: inboxData, isLoading: isInboxLoading } = useFetch<InboxResponse>("/api/inbox");

  const spots: Spot[] = (spotsData?.spots ?? []).map(mapDbSpot) as Spot[];
  const pendingItems = (inboxData?.items ?? []).filter(
    (item) => (item.status as string) === "pending",
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/roles"
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            All Roles
          </Link>
          <PageHeader
            title="Member"
            subtitle="You are a direct human collaborator. Join SPOTs, discuss, review, and approve."
          />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Your SPOTs</div>
          <div className="mt-1 text-2xl font-bold">{isSpotsLoading ? "—" : spots.length}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Pending Approvals</div>
          <div className="mt-1 text-2xl font-bold">{isInboxLoading ? "—" : pendingItems.length}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Certified</div>
          <div className="mt-1 text-2xl font-bold">
            {isSpotsLoading ? "—" : spots.filter((s) => s.certificationStatus === "certified").length}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button as="link" href="/spots" variant="primary">
          Browse SPOTs
        </Button>
        <Button as="link" href="/spots/new" variant="secondary">
          Create a SPOT
        </Button>
        <Button as="link" href="/inbox" variant="secondary">
          View Inbox
          {pendingItems.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {pendingItems.length}
            </span>
          )}
        </Button>
      </div>

      {/* Your SPOTs */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">
          Your SPOTs
        </h2>
        {isSpotsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : spots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {spots.slice(0, 8).map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No SPOTs yet"
            description="Join or create a SPOT to start collaborating."
            actionLabel="Browse SPOTs"
            actionHref="/spots"
          />
        )}
      </section>
    </div>
  );
}
