/** Parsed result from a raw command string. */
export interface ParsedArgs {
  /** Top-level resource: "agent", "spot", "pipeline", etc. */
  resource: string;
  /** Action within the resource: "create", "list", "show", etc. */
  action: string;
  /** Positional arguments (non-flag values after resource + action). */
  positional: string[];
  /** Named flags: --name "Archie" => { name: "Archie" } */
  flags: Record<string, string>;
  /** The original raw input string. */
  raw: string;
}

/** Result returned by every command handler. */
export interface CommandResult {
  status: "success" | "error" | "info";
  /** Human-readable formatted output. */
  output: string;
  /** Optional structured data for programmatic use. */
  data?: unknown;
}

/** Handler function signature for a single command. */
export type CommandHandler = (args: ParsedArgs) => Promise<CommandResult>;

/** Metadata for a registered command (used by help). */
export interface CommandMeta {
  /** e.g. "agent create" */
  signature: string;
  /** Short one-line description. */
  description: string;
  /** Usage string with flags. */
  usage: string;
  /** Example invocation(s). */
  examples: string[];
  /** The handler function. */
  handler: CommandHandler;
}
