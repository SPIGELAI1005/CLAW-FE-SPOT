"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useFetch, mapDbAgent } from "@/lib/useFetch";
import { agentRoleDisplayNames } from "@/lib/spotTypes";
import { CliHint } from "@/components/cli/CliHint";
import type { Agent } from "@/lib/spotTypes";

interface AgentResponse {
  agent: Record<string, unknown>;
}

export function AgentProfileClient({ agentId }: { agentId: string }) {
  const router = useRouter();
  const { data, isLoading, refetch } = useFetch<AgentResponse>(`/api/agents/${agentId}`);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const agent: Agent | null = data?.agent
    ? (mapDbAgent(data.agent) as Agent)
    : null;

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/agents");
      }
    } finally {
      setIsDeleting(false);
    }
  }, [agentId, router]);

  if (isLoading || !agent) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Agents
      </Link>

      {isEditing ? (
        <EditAgentForm
          agent={agent}
          agentId={agentId}
          onSave={() => { setIsEditing(false); refetch(); }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <Card>
            <div className="flex items-start gap-4">
              <Avatar name={agent.name} size="lg" />
              <div className="flex-1">
                <PageHeader title={agent.name} subtitle={agent.description}>
                  <div className="flex gap-2">
                    <Button as="link" href={`/spots/new?agent=${agentId}`} variant="primary">
                      Invite to SPOT
                    </Button>
                    <Button as="button" variant="secondary" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                    <Button as="button" variant="ghost" onClick={() => setShowDeleteConfirm(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </Button>
                  </div>
                </PageHeader>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Type</div>
                <div className="mt-1 text-sm font-medium">{agentRoleDisplayNames[agent.type] ?? agent.type}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Trust Level</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800" role="progressbar" aria-valuenow={agent.trustLevel} aria-valuemin={0} aria-valuemax={100} aria-label={`Trust level: ${agent.trustLevel}%`}>
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${agent.trustLevel}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{agent.trustLevel}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400">Certified Outcomes</div>
                <div className="mt-1 text-sm font-medium">{agent.certifiedOutcomes}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Skills</div>
            <div className="flex flex-wrap gap-2">
              {agent.skills.length > 0 ? (
                agent.skills.map((s) => <Badge key={s} tone="info">{s}</Badge>)
              ) : (
                <span className="text-xs italic text-stone-400">No skills listed</span>
              )}
            </div>
          </Card>

          <Card>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Available Tools</div>
            <div className="flex flex-wrap gap-2">
              {agent.tools.length > 0 ? (
                agent.tools.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)
              ) : (
                <span className="text-xs italic text-stone-400">No tools listed</span>
              )}
            </div>
          </Card>

          <CliHint
            commands={[
              { label: "Show this agent", command: `agent show ${agentId}` },
              { label: "Deploy to a SPOT", command: `agent deploy ${agentId} --spot <spot-id> --role ${agent.type === "l1_auditor" ? "sentinel" : agent.type === "l2_meta_auditor" ? "arbiter" : "maker"}` },
            ]}
          />
        </>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-700 dark:bg-stone-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Delete Agent</h3>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button as="button" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Edit Agent Form ──────────────────────────────────────────────── */
function EditAgentForm({
  agent,
  agentId,
  onSave,
  onCancel,
}: {
  agent: Agent;
  agentId: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description ?? "");
  const [skills, setSkills] = useState(agent.skills.join(", "));
  const [tools, setTools] = useState(agent.tools.join(", "));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          tools: tools.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) onSave();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Edit Agent
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Agent Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <Input
          label="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        <Input
          label="Tools (comma separated)"
          value={tools}
          onChange={(e) => setTools(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button as="button" variant="ghost" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button
            as="button"
            variant="primary"
            type="submit"
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
