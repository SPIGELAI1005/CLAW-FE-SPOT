import type { CommandHandler, CommandResult, ParsedArgs } from "../types";

export const spotCreate: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const title = args.flags.title;
  const goal = args.flags.goal;
  const mode = args.flags.mode ?? "discuss";

  if (!title) return { status: "error", output: "Missing --title flag.\nUsage: spot create --title \"Title\" --goal \"Goal\"" };
  if (!goal) return { status: "error", output: "Missing --goal flag.\nUsage: spot create --title \"Title\" --goal \"Goal\"" };

  if (mode !== "discuss" && mode !== "execute") {
    return { status: "error", output: `Invalid mode "${mode}". Use: discuss or execute` };
  }

  const res = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, goal, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: "error", output: `Failed: ${(err as Record<string, string>).error ?? res.statusText}` };
  }

  const data = await res.json();
  return {
    status: "success",
    output: `SPOT created.\n  ID:    ${data.id}\n  Title: ${title}\n  Mode:  ${mode.toUpperCase()}`,
    data,
  };
};

export const spotList: CommandHandler = async (): Promise<CommandResult> => {
  const res = await fetch("/api/spots");
  if (!res.ok) return { status: "error", output: "Failed to fetch SPOTs." };

  const data = await res.json();
  const spots = (data.spots ?? []) as Record<string, unknown>[];

  if (spots.length === 0) return { status: "info", output: "No SPOTs found. Create one: spot create --title \"Title\" --goal \"Goal\"" };

  const lines = spots.map((s, i) => {
    const mode = String(s.mode ?? "discuss").toUpperCase();
    const status = String(s.status ?? "draft");
    return `  ${i + 1}. ${s.title}  [${mode}] (${status})  id:${String(s.id).slice(0, 8)}…`;
  });

  return {
    status: "success",
    output: `SPOTs (${spots.length}):\n${lines.join("\n")}`,
    data: spots,
  };
};

export const spotShow: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const id = args.positional[0] ?? args.flags.id;
  if (!id) return { status: "error", output: "Missing SPOT ID.\nUsage: spot show <id>" };

  const res = await fetch(`/api/spots/${id}`);
  if (!res.ok) return { status: "error", output: `SPOT not found (${id}).` };

  const data = await res.json();
  const s = data.spot ?? data;

  return {
    status: "success",
    output: [
      `SPOT: ${s.title}`,
      `  ID:            ${s.id}`,
      `  Mode:          ${String(s.mode ?? "discuss").toUpperCase()}`,
      `  Status:        ${s.status ?? "draft"}`,
      `  Certification: ${s.certification_status ?? s.certificationStatus ?? "uncertified"}`,
      `  Goal:          ${s.goal ?? "—"}`,
    ].join("\n"),
    data: s,
  };
};

export const spotSwitchMode: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const id = args.positional[0] ?? args.flags.id;
  const mode = args.flags.mode;

  if (!id) return { status: "error", output: "Missing SPOT ID.\nUsage: spot switch-mode <id> --mode execute" };
  if (!mode || (mode !== "discuss" && mode !== "execute")) {
    return { status: "error", output: "Missing or invalid --mode flag. Use: discuss or execute" };
  }

  const res = await fetch(`/api/spots/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: "error", output: `Failed: ${(err as Record<string, string>).error ?? res.statusText}` };
  }

  return {
    status: "success",
    output: `SPOT ${id.slice(0, 8)}… switched to ${mode.toUpperCase()} mode.`,
  };
};

export const spotMessage: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const id = args.positional[0] ?? args.flags.id;
  const content = args.flags.content ?? args.flags.message;

  if (!id) return { status: "error", output: "Missing SPOT ID.\nUsage: spot message <id> --content \"Hello\"" };
  if (!content) return { status: "error", output: "Missing --content flag.\nUsage: spot message <id> --content \"Hello\"" };

  const res = await fetch(`/api/spots/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, type: "human" }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: "error", output: `Failed: ${(err as Record<string, string>).error ?? res.statusText}` };
  }

  return { status: "success", output: `Message sent to SPOT ${id.slice(0, 8)}….` };
};

export const spotCertify: CommandHandler = async (args: ParsedArgs): Promise<CommandResult> => {
  const id = args.positional[0] ?? args.flags.id;
  const verdict = args.flags.verdict;
  const report = args.flags.report;

  if (!id) return { status: "error", output: "Missing SPOT ID.\nUsage: spot certify <id> --verdict pass --report \"Report\"" };
  if (!verdict) return { status: "error", output: "Missing --verdict flag. Use: pass, rework, lockdown, human_escalation" };
  if (!report) return { status: "error", output: "Missing --report flag." };

  const valid = ["pass", "rework", "lockdown", "human_escalation"];
  if (!valid.includes(verdict)) {
    return { status: "error", output: `Invalid verdict "${verdict}". Use: ${valid.join(", ")}` };
  }

  const res = await fetch(`/api/spots/${id}/certify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verdict, report }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: "error", output: `Failed: ${(err as Record<string, string>).error ?? res.statusText}` };
  }

  return {
    status: "success",
    output: `Certification submitted for SPOT ${id.slice(0, 8)}….\n  Verdict: ${verdict.toUpperCase()}`,
  };
};
