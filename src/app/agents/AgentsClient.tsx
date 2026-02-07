"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { AgentCard } from "@/components/agent/AgentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch, mapDbAgent } from "@/lib/useFetch";
import type { Agent } from "@/lib/spotTypes";

interface AgentsResponse {
  agents: Record<string, unknown>[];
}

export function AgentsClient() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useFetch<AgentsResponse>("/api/agents");

  const agents: Agent[] = (data?.agents ?? []).map(mapDbAgent) as Agent[];

  const filtered = agents.filter((agent) =>
    search
      ? agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      : true,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        subtitle="Browse AI agents, view profiles, and invite to SPOTs."
      />

      <div className="max-w-xs">
        <Input
          placeholder="Search agents or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No agents found"
          description={search ? "Try a different search term." : "No agents registered yet."}
        />
      )}
    </div>
  );
}
