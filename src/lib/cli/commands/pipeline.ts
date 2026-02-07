import type { CommandHandler, CommandResult, ParsedArgs } from "../types";

const roleMap: Record<string, string> = {
  maker: "worker",
  sentinel: "l1_auditor",
  arbiter: "l2_meta_auditor",
};

const roleDisplay: Record<string, string> = {
  worker: "Maker",
  l1_auditor: "Sentinel",
  l2_meta_auditor: "Arbiter",
};

async function deployAgent(spotId: string, agentId: string, role: string): Promise<{ ok: boolean; name: string; error?: string }> {
  // Fetch agent name
  const agentRes = await fetch(`/api/agents/${agentId}`);
  const agentData = agentRes.ok ? await agentRes.json() : null;
  const name = agentData?.agent?.name ?? agentData?.name ?? `Agent ${agentId.slice(0, 8)}`;

  const res = await fetch(`/api/spots/${spotId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: agentId,
      role,
      display_name: name,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, name, error: (err as Record<string, string>).error ?? res.statusText };
  }

  return { ok: true, name };
}

export const pipelineCreate: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const spotId = args.flags.spot;
  if (!spotId) return { status: "error", output: "Missing --spot flag.\nUsage: pipeline create --spot <id> --maker <agent-id> --sentinel <agent-id> --arbiter <agent-id>" };

  const assignments: { flag: string; dbRole: string }[] = [
    { flag: "maker", dbRole: "worker" },
    { flag: "sentinel", dbRole: "l1_auditor" },
    { flag: "arbiter", dbRole: "l2_meta_auditor" },
  ];

  const toDeploy = assignments
    .filter(({ flag }) => args.flags[flag])
    .map(({ flag, dbRole }) => ({ agentId: args.flags[flag], dbRole }));

  if (toDeploy.length === 0) {
    return { status: "error", output: "Provide at least one agent: --maker <id>, --sentinel <id>, or --arbiter <id>" };
  }

  const results: string[] = [];
  let hasError = false;

  for (const { agentId, dbRole } of toDeploy) {
    const r = await deployAgent(spotId, agentId, dbRole);
    if (r.ok) {
      results.push(`  ✓ ${r.name} deployed as ${roleDisplay[dbRole] ?? dbRole}`);
    } else {
      results.push(`  ✗ ${r.name} failed: ${r.error}`);
      hasError = true;
    }
  }

  return {
    status: hasError ? "error" : "success",
    output: `Pipeline for SPOT ${spotId.slice(0, 8)}…:\n${results.join("\n")}`,
  };
};
