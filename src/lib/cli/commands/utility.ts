import type { CommandHandler, CommandResult, ParsedArgs } from "../types";
import type { CommandMeta } from "../types";

/** Will be set by the registry after initialization. */
let registryRef: Map<string, CommandMeta> = new Map();

export function setRegistryRef(registry: Map<string, CommandMeta>) {
  registryRef = registry;
}

export const helpCommand: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const topic = args.positional[0] ?? args.action;

  // If help is called as "help agent" or "help spot create"
  if (topic && topic !== "help") {
    const fullKey = args.positional.length > 1
      ? `${topic} ${args.positional[1]}`
      : args.positional.length === 1 && args.action !== "help"
        ? `${args.action} ${topic}`
        : topic;

    // Try exact match
    const cmd = registryRef.get(fullKey);
    if (cmd) {
      return {
        status: "info",
        output: [
          `${cmd.signature}`,
          `  ${cmd.description}`,
          "",
          `  Usage:    ${cmd.usage}`,
          "",
          `  Examples:`,
          ...cmd.examples.map((e) => `    ${e}`),
        ].join("\n"),
      };
    }

    // Try prefix match for resource-level help
    const matches = Array.from(registryRef.values()).filter((c) => c.signature.startsWith(fullKey));
    if (matches.length > 0) {
      const lines = matches.map((c) => `  ${c.signature.padEnd(22)} ${c.description}`);
      return {
        status: "info",
        output: `Commands for "${fullKey}":\n${lines.join("\n")}`,
      };
    }

    return { status: "error", output: `Unknown command "${fullKey}". Type "help" for a list.` };
  }

  // General help
  const groups = new Map<string, CommandMeta[]>();
  for (const cmd of registryRef.values()) {
    const group = cmd.signature.split(" ")[0];
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(cmd);
  }

  const sections = Array.from(groups.entries()).map(([group, cmds]) => {
    const lines = cmds.map((c) => `  ${c.signature.padEnd(24)} ${c.description}`);
    return `${group}:\n${lines.join("\n")}`;
  });

  return {
    status: "info",
    output: [
      "CLAW:FE SPOT CLI — Available Commands",
      "═".repeat(40),
      "",
      ...sections,
      "",
      "Type \"help <command>\" for details. Press ↑/↓ for history.",
    ].join("\n"),
  };
};

export const statusCommand: CommandHandler = async (): Promise<CommandResult> => {
  const [spotsRes, agentsRes, inboxRes] = await Promise.all([
    fetch("/api/spots"),
    fetch("/api/agents"),
    fetch("/api/inbox"),
  ]);

  const spots = spotsRes.ok ? ((await spotsRes.json()).spots ?? []) as Record<string, unknown>[] : [];
  const agents = agentsRes.ok ? ((await agentsRes.json()).agents ?? []) as Record<string, unknown>[] : [];
  const inbox = inboxRes.ok ? ((await inboxRes.json()).items ?? []) as Record<string, unknown>[] : [];

  const activeSpots = spots.filter((s) => s.status === "active" || s.status === "draft");
  const executeSpots = spots.filter((s) => s.mode === "execute");
  const certified = spots.filter((s) => s.certification_status === "certified" || s.certificationStatus === "certified");
  const pending = inbox.filter((i) => i.status === "pending");

  return {
    status: "success",
    output: [
      "Status Overview",
      "─".repeat(30),
      `  SPOTs:     ${spots.length} total, ${activeSpots.length} active, ${executeSpots.length} executing`,
      `  Certified: ${certified.length}`,
      `  Agents:    ${agents.length}`,
      `  Inbox:     ${pending.length} pending`,
    ].join("\n"),
  };
};
