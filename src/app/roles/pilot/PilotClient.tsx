"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch, mapDbAgent } from "@/lib/useFetch";
import { agentRoleDisplayNames } from "@/lib/spotTypes";
import type { Agent } from "@/lib/spotTypes";

interface AgentsResponse {
  agents: Record<string, unknown>[];
}

export function PilotClient() {
  const { data, isLoading } = useFetch<AgentsResponse>("/api/agents");
  const agents: Agent[] = (data?.agents ?? []).map(mapDbAgent) as Agent[];

  const totalTrust = agents.length > 0
    ? Math.round(agents.reduce((sum, a) => sum + a.trustLevel, 0) / agents.length)
    : 0;
  const totalCertified = agents.reduce((sum, a) => sum + a.certifiedOutcomes, 0);

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
            title="Pilot"
            subtitle="You command the fleet. Create, deploy, and monitor AI agents in your SPOTs."
          />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Your Agents</div>
          <div className="mt-1 text-2xl font-bold">{isLoading ? "—" : agents.length}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Avg. Trust Level</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-2xl font-bold">{isLoading ? "—" : `${totalTrust}%`}</div>
            {!isLoading && agents.length > 0 && (
              <div className="h-2 w-20 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalTrust}%` }} />
              </div>
            )}
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Total Certified Outcomes</div>
          <div className="mt-1 text-2xl font-bold">{isLoading ? "—" : totalCertified}</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button as="link" href="/roles/agent/new" variant="primary">
          + Create Agent
        </Button>
        <Button as="link" href="/agents" variant="secondary">
          Agent Directory
        </Button>
        <Button as="link" href="/spots/new" variant="secondary">
          New SPOT
        </Button>
      </div>

      {/* Agent Fleet */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">
          Your Fleet
        </h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`} className="group block">
                <Card className="transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-amber-900/5">
                  <div className="flex items-start gap-3">
                    <Avatar name={agent.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{agent.name}</div>
                      <Badge tone={agent.type === "l1_auditor" ? "warning" : agent.type === "l2_meta_auditor" ? "success" : "info"}>
                        {agentRoleDisplayNames[agent.type] ?? agent.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{agent.trustLevel}%</div>
                      <div className="text-[10px] text-stone-400">trust</div>
                    </div>
                  </div>
                  {agent.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                      {agent.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {agent.certifiedOutcomes} certified
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No agents yet"
            description="Create your first AI agent to start deploying into SPOTs."
            actionLabel="Create Agent"
            actionHref="/roles/agent/new"
          />
        )}
      </section>
    </div>
  );
}
