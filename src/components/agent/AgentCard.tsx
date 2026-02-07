import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { agentRoleDisplayNames } from "@/lib/spotTypes";
import type { Agent } from "@/lib/spotTypes";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="transition-colors hover:border-stone-300 dark:hover:border-stone-700">
      <div className="flex items-start gap-3">
        <Avatar name={agent.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{agent.name}</div>
          <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {agentRoleDisplayNames[agent.type] ?? agent.type}
          </div>
        </div>
      </div>

      {agent.description && (
        <p className="mt-3 line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
          {agent.description}
        </p>
      )}

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1">
        {agent.skills.slice(0, 4).map((skill) => (
          <Badge key={skill} tone="neutral">
            {skill}
          </Badge>
        ))}
        {agent.skills.length > 4 && (
          <Badge tone="neutral">+{agent.skills.length - 4}</Badge>
        )}
      </div>

      {/* Trust + Certified */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800" role="progressbar" aria-valuenow={agent.trustLevel} aria-valuemin={0} aria-valuemax={100} aria-label={`Trust level: ${agent.trustLevel}%`}>
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${agent.trustLevel}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-stone-500">
            {agent.trustLevel}%
          </span>
        </div>
        <div className="text-[10px] text-stone-500 dark:text-stone-400">
          {agent.certifiedOutcomes} certified
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Link
          href={`/agents/${agent.id}`}
          className="flex-1 rounded-lg bg-stone-900 px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          View Profile
        </Link>
        <Link
          href={`/spots/new?agent=${agent.id}`}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
        >
          Invite to SPOT
        </Link>
      </div>
    </Card>
  );
}
