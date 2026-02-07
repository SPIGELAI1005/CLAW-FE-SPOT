import type { ParsedArgs } from "./types";

/**
 * Tokenize a raw command string, respecting double-quoted values.
 * "agent create --name \"Archie the Maker\" --role maker"
 * => ["agent", "create", "--name", "Archie the Maker", "--role", "maker"]
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === '"' || ch === "'") {
      inQuote = !inQuote;
      continue;
    }

    if (ch === " " && !inQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) tokens.push(current);
  return tokens;
}

/**
 * Parse a raw command string into structured ParsedArgs.
 *
 * Pattern: <resource> <action> [positional...] [--flag value...]
 */
export function parseCommand(raw: string): ParsedArgs {
  const trimmed = raw.trim();
  const tokens = tokenize(trimmed);

  const resource = (tokens[0] ?? "").toLowerCase();
  const action = (tokens[1] ?? "").toLowerCase();

  const positional: string[] = [];
  const flags: Record<string, string> = {};

  let i = 2;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = tokens[i + 1];
      // If next token exists and is not another flag, use it as the value
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = "true";
        i += 1;
      }
    } else {
      positional.push(token);
      i += 1;
    }
  }

  return { resource, action, positional, flags, raw: trimmed };
}
