import type { CommandMeta, CommandResult, ParsedArgs } from "./types";
import { parseCommand } from "./parser";
import { agentCreate, agentList, agentShow, agentDeploy } from "./commands/agent";
import { spotCreate, spotList, spotShow, spotSwitchMode, spotMessage, spotCertify } from "./commands/spot";
import { pipelineCreate } from "./commands/pipeline";
import { helpCommand, statusCommand, setRegistryRef } from "./commands/utility";

/** Global command registry. Key = "resource action" */
const registry = new Map<string, CommandMeta>();

function register(meta: CommandMeta) {
  registry.set(meta.signature, meta);
}

// ── Agent commands ─────────────────────────────────────────────────
register({
  signature: "agent create",
  description: "Create a new AI agent with a role.",
  usage: 'agent create --name "Name" --role maker|sentinel|arbiter [--skills "a,b"] [--tools "x,y"]',
  examples: [
    'agent create --name "Archie" --role maker --skills "code review,writing"',
    'agent create --name "Watchdog" --role sentinel',
  ],
  handler: agentCreate,
});

register({
  signature: "agent list",
  description: "List all agents.",
  usage: "agent list",
  examples: ["agent list"],
  handler: agentList,
});

register({
  signature: "agent show",
  description: "Show details for a specific agent.",
  usage: "agent show <id>",
  examples: ["agent show abc123"],
  handler: agentShow,
});

register({
  signature: "agent deploy",
  description: "Deploy an agent into a SPOT.",
  usage: "agent deploy <agent-id> --spot <spot-id> [--role maker|sentinel|arbiter]",
  examples: ['agent deploy abc123 --spot xyz789 --role sentinel'],
  handler: agentDeploy,
});

// ── SPOT commands ──────────────────────────────────────────────────
register({
  signature: "spot create",
  description: "Create a new SPOT workspace.",
  usage: 'spot create --title "Title" --goal "Goal" [--mode discuss|execute]',
  examples: ['spot create --title "Blog Project" --goal "Write 20 posts" --mode discuss'],
  handler: spotCreate,
});

register({
  signature: "spot list",
  description: "List all SPOTs.",
  usage: "spot list",
  examples: ["spot list"],
  handler: spotList,
});

register({
  signature: "spot show",
  description: "Show details for a specific SPOT.",
  usage: "spot show <id>",
  examples: ["spot show abc123"],
  handler: spotShow,
});

register({
  signature: "spot switch-mode",
  description: "Switch a SPOT between DISCUSS and EXECUTE mode.",
  usage: "spot switch-mode <id> --mode execute|discuss",
  examples: ["spot switch-mode abc123 --mode execute"],
  handler: spotSwitchMode,
});

register({
  signature: "spot message",
  description: "Send a message to a SPOT.",
  usage: 'spot message <id> --content "Your message"',
  examples: ['spot message abc123 --content "Hello team, let\'s begin."'],
  handler: spotMessage,
});

register({
  signature: "spot certify",
  description: "Submit L2 certification for a SPOT.",
  usage: 'spot certify <id> --verdict pass|rework|lockdown --report "Report text"',
  examples: ['spot certify abc123 --verdict pass --report "All checks passed."'],
  handler: spotCertify,
});

// ── Pipeline commands ──────────────────────────────────────────────
register({
  signature: "pipeline create",
  description: "Deploy multiple agents to a SPOT in one command.",
  usage: "pipeline create --spot <id> --maker <agent-id> --sentinel <agent-id> --arbiter <agent-id>",
  examples: ["pipeline create --spot xyz --maker a1 --sentinel a2 --arbiter a3"],
  handler: pipelineCreate,
});

// ── Utility commands ───────────────────────────────────────────────
register({
  signature: "help",
  description: "Show available commands.",
  usage: "help [command]",
  examples: ["help", "help agent", "help spot create"],
  handler: helpCommand,
});

register({
  signature: "status",
  description: "Quick overview of your workspace.",
  usage: "status",
  examples: ["status"],
  handler: statusCommand,
});

// Wire the registry reference into the help command
setRegistryRef(registry);

/** All registered commands for iteration. */
export function getAllCommands(): CommandMeta[] {
  return Array.from(registry.values());
}

/** Get all command signature strings for auto-complete. */
export function getCompletions(): string[] {
  return Array.from(registry.keys());
}

/**
 * Execute a raw command string.
 * Parses the input and dispatches to the matching handler.
 */
export async function executeCommand(raw: string): Promise<CommandResult> {
  const trimmed = raw.trim();
  if (!trimmed) return { status: "info", output: 'Type "help" for available commands.' };

  const args = parseCommand(trimmed);

  // Special case: single-word commands (help, status)
  const singleCmd = registry.get(args.resource);
  if (singleCmd && !args.action) {
    return singleCmd.handler(args);
  }

  // "help <topic>" — reroute to help handler
  if (args.resource === "help") {
    return helpCommand(args);
  }

  // Normal: "resource action"
  const key = `${args.resource} ${args.action}`;
  const cmd = registry.get(key);
  if (!cmd) {
    // Try single-word match (e.g. "status" entered as resource with no action)
    const fallback = registry.get(args.resource);
    if (fallback) return fallback.handler(args);

    return {
      status: "error",
      output: `Unknown command "${trimmed}".\nType "help" for available commands.`,
    };
  }

  return cmd.handler(args);
}
