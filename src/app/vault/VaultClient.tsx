"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CertBadge } from "@/components/ui/CertBadge";
import { BlockchainBadge } from "@/components/spot/BlockchainBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch } from "@/lib/useFetch";
import type { CertificationStatus } from "@/lib/spotTypes";

interface VaultEntry {
  spot_id: string;
  spot_title: string;
  mode: string;
  certification_status: string;
  l1_verdict_count: number;
  l2_verdict: string | null;
  updated_at: string;
}

interface VaultResponse {
  entries: VaultEntry[];
}

export function VaultClient() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useFetch<VaultResponse>("/api/vault");

  const entries = data?.entries ?? [];

  const filtered = entries.filter((e) =>
    search ? e.spot_title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const handleExportJSON = useCallback(async (spotId: string) => {
    const res = await fetch(`/api/vault/${spotId}`);
    if (!res.ok) return;
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${spotId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Vault"
        subtitle="Browse immutable logs, export reports, and view L1 + L2 findings."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="w-full flex-1 sm:max-w-xs">
          <Input
            placeholder="Search by SPOT name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <AuditRow key={entry.spot_id} entry={entry} onExportJSON={handleExportJSON} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No audit entries found"
          description={
            search
              ? "Try a different search term."
              : "Audit logs will appear here once SPOTs complete execution."
          }
        />
      )}
    </div>
  );
}

function AuditRow({
  entry,
  onExportJSON,
}: {
  entry: VaultEntry;
  onExportJSON: (spotId: string) => void;
}) {
  const l1Status = entry.l1_verdict_count > 0 ? "pass" : "pending";

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{entry.spot_title}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge
              tone={
                l1Status === "pass" ? "success" : "warning"
              }
            >
              L1: {entry.l1_verdict_count} verdict{entry.l1_verdict_count !== 1 ? "s" : ""}
            </Badge>
            <CertBadge status={entry.certification_status as CertificationStatus} />
            {entry.certification_status === "certified" && (
              <BlockchainBadge status="valid" />
            )}
          </div>
          <div className="mt-1 text-[10px] text-stone-400">
            Updated {new Date(entry.updated_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/vault/${entry.spot_id}`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            View Details
          </Link>
          <button
            onClick={() => onExportJSON(entry.spot_id)}
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
          >
            Export JSON
          </button>
        </div>
      </div>
    </Card>
  );
}
