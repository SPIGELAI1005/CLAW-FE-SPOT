import type { CommandHandler, CommandResult, ParsedArgs } from "../types";

const roleMap: Record<string, string> = {
  maker: "worker",
  sentinel: "l1_auditor",
  arbiter: "l2_meta_auditor",
  worker: "worker",
  l1_auditor: "l1_auditor",
  l2_meta_auditor: "l2_meta_auditor",
};

const roleDisplay: Record<string, string> = {
  worker: "Maker",
  l1_auditor: "Sentinel",
  l2_meta_auditor: "Arbiter",
};

export const agentCreate: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const name = args.flags.name;
  const role = args.flags.role;

  if (!name) return { status: "error", output: "Missing --name flag.\nUsage: agent create --name \"Name\" --role maker" };
  if (!role) return { status: "error", output: "Missing --role flag.\nUsage: agent create --name \"Name\" --role maker|sentinel|arbiter" };

  const dbType = roleMap[role.toLowerCase()];
  if (!dbType) return { status: "error", output: `Invalid role "${role}". Use: maker, sentinel, or arbiter` };

  const skills = args.flags.skills?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const tools = args.flags.tools?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  const res = await fetch("/api/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      type: dbType,
      description: args.flags.description,
      skills,
      tools,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: "error", output: `Failed to create agent: ${(err as Record<string, string>).error ?? res.statusText}` };
  }

  const data = await res.json();
  return {
    status: "success",
    output: `Agent created successfully.\n  ID:   ${data.id}\n  Name: ${name}\n  Role: ${roleDisplay[dbType] ?? dbType}`,
    data,
  };
};

export const agentList: CommandHandler = async (): Promise<CommandResult> => {
  const res = await fetch("/api/agents");
  if (!res.ok) return { status: "error", output: "Failed to fetch agents." };

  const data = await res.json();
  const agents = (data.agents ?? []) as Record<string, unknown>[];

  if (agents.length === 0) return { status: "info", output: "No agents found. Create one with: agent create --name \"Name\" --role maker" };

  const lines = agents.map((a, i) => {
    const t = String(a.type ?? "");
    return `  ${i + 1}. ${a.name}  [${roleDisplay[t] ?? t}]  id:${String(a.id).slice(0, 8)}…`;
  });

  return {
    status: "success",
    output: `Agents (${agents.length}):\n${lines.join("\n")}`,
    data: agents,
  };
};

export const agentShow: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const id = args.positional[0] ?? args.flags.id;
  if (!id) return { status: "error", output: "Missing agent ID.\nUsage: agent show <id>" };

  const res = await fetch(`/api/agents/${id}`);
  if (!res.ok) return { status: "error", output: `Agent not found (${id}).` };

  const data = await res.json();
  const a = data.agent ?? data;
  const t = String(a.type ?? "");

  return {
    status: "success",
    output: [
      `Agent: ${a.name}`,
      `  ID:          ${a.id}`,
      `  Role:        ${roleDisplay[t] ?? t}`,
      `  Trust:       ${a.trust_level ?? a.trustLevel ?? 0}%`,
      `  Certified:   ${a.certified_outcomes ?? a.certifiedOutcomes ?? 0}`,
      `  Skills:      ${(a.skills ?? []).join(", ") || "none"}`,
      `  Tools:       ${(a.tools ?? []).join(", ") || "none"}`,
      a.description ? `  Description: ${a.description}` : "",
    ].filter(Boolean).join("\n"),
    data: a,
  };
};

export const agentDeploy: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const agentId = args.positional[0] ?? args.flags.agent;
  const spotId = args.flags.spot;
  const role = args.flags.role ?? "worker";

  if (!agentId) return { status: "error", output: "Missing agent ID.\nUsage: agent deploy <agent-id> --spot <spot-id> --role maker" };
  if (!spotId) return { status: "error", output: "Missing --spot flag.\nUsage: agent deploy <agent-id> --spot <spot-id>" };

  const dbRole = roleMap[role.toLowerCase()] ?? role;

  // Fetch agent name for display
  const agentRes = await fetch(`/api/agents/${agentId}`);
  const agentData = agentRes.ok ? await agentRes.json() : null;
  const displayName = agentData?.agent?.name ?? agentData?.name ?? `Agent ${agentId.slice(0, 8)}`;

  const res = await fetch(`/api/spots/${spotId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: agentId,
      role: dbRole,
      display_name: displayName,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: "error", output: `Deploy failed: ${(err as Record<string, string>).error ?? res.statusText}` };
  }

  return {
    status: "success",
    output: `Deployed "${displayName}" to SPOT ${spotId.slice(0, 8)}… as ${roleDisplay[dbRole] ?? dbRole}.`,
  };
};
