"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, type Tab } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch, mapDbInboxItem } from "@/lib/useFetch";
import type { InboxItem } from "@/lib/spotTypes";

type InboxFilter = "all" | "spot_invite" | "contract_proposal" | "l1_approval" | "l2_certification";

const typeLabels: Record<string, string> = {
  spot_invite: "Invite",
  contract_proposal: "Contract",
  l1_approval: "L1 Approval",
  l2_certification: "L2 Certification",
};

const typeBadgeTone: Record<string, "info" | "warning" | "success" | "neutral"> = {
  spot_invite: "info",
  contract_proposal: "neutral",
  l1_approval: "warning",
  l2_certification: "success",
};

interface InboxResponse {
  items: Record<string, unknown>[];
}

export function InboxClient() {
  const [filter, setFilter] = useState<InboxFilter>("all");
  const { data, isLoading, refetch } = useFetch<InboxResponse>("/api/inbox");

  const items: InboxItem[] = (data?.items ?? []).map(mapDbInboxItem) as InboxItem[];
  const pendingCount = items.filter((i) => i.status === "pending").length;

  const filterTabs: Tab<InboxFilter>[] = [
    { value: "all", label: "All", count: items.length },
    { value: "spot_invite", label: "Invites", count: items.filter((i) => i.type === "spot_invite").length },
    { value: "contract_proposal", label: "Contracts", count: items.filter((i) => i.type === "contract_proposal").length },
    { value: "l1_approval", label: "Approvals", count: items.filter((i) => i.type === "l1_approval").length },
  ];

  const filtered = items.filter(
    (item) => filter === "all" || item.type === filter,
  );

  const handleAction = useCallback(
    async (itemId: string, status: "accepted" | "rejected") => {
      await fetch(`/api/inbox/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      refetch();
    },
    [refetch],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        subtitle={`Invites, contract proposals, and approval tasks.${pendingCount > 0 ? ` ${pendingCount} pending.` : ""}`}
      />

      <Tabs value={filter} onChange={setFilter} tabs={filterTabs} />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <InboxRow key={item.id} item={item} onAction={handleAction} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="All clear"
          description="No items match this filter."
        />
      )}
    </div>
  );
}

function InboxRow({
  item,
  onAction,
}: {
  item: InboxItem;
  onAction: (id: string, status: "accepted" | "rejected") => void;
}) {
  const isActionable = item.status === "pending";

  return (
    <Card className={isActionable ? "" : "opacity-60"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone={typeBadgeTone[item.type] ?? "neutral"}>
              {typeLabels[item.type] ?? item.type}
            </Badge>
            {item.status !== "pending" && (
              <Badge tone={item.status === "accepted" ? "success" : "danger"}>
                {item.status}
              </Badge>
            )}
          </div>
          <div className="mt-1.5 text-sm font-medium">{item.title}</div>
          {item.description && (
            <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {item.description}
            </div>
          )}
          {item.createdAt && (
            <div className="mt-1 text-[10px] text-stone-400">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {isActionable && (
          <div className="flex gap-2">
            {item.type === "l1_approval" ? (
              <>
                <button
                  onClick={() => onAction(item.id, "accepted")}
                  className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => onAction(item.id, "rejected")}
                  className="rounded-lg bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  Block
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAction(item.id, "accepted")}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
                >
                  Accept
                </button>
                <button
                  onClick={() => onAction(item.id, "rejected")}
                  className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-medium transition-colors hover:bg-stone-50 dark:border-stone-800"
                >
                  Decline
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
