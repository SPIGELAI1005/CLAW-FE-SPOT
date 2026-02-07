/**
 * Zod schemas for API request body validation.
 * Every POST/PATCH API route must parse its body through one of these schemas.
 */
import { z } from "zod";

// ── SPOTs ────────────────────────────────────────────────────────────
export const CreateSpotBody = z.object({
  title: z.string().min(1, "Title is required").max(500),
  goal: z.string().min(1, "Goal is required").max(5000),
  mode: z.enum(["discuss", "execute"]).default("discuss"),
});

export const PatchSpotBody = z.object({
  title: z.string().min(1).max(500).optional(),
  goal: z.string().min(1).max(5000).optional(),
  mode: z.enum(["discuss", "execute"]).optional(),
  certification_status: z
    .enum(["uncertified", "certified", "rework", "lockdown", "human_escalation"])
    .optional(),
  contract: z
    .object({
      scope: z.string().max(5000).optional(),
      allowed_tools: z.array(z.string().min(1).max(200)).max(50).optional(),
      allowed_data: z.array(z.string().min(1).max(200)).max(50).optional(),
      acceptance_criteria: z.array(z.string().min(1).max(1000)).max(50).optional(),
      termination_conditions: z.string().max(2000).optional(),
    })
    .optional(),
});

// ── Messages ─────────────────────────────────────────────────────────
export const CreateMessageBody = z.object({
  content: z.string().min(1, "Message cannot be empty").max(10000),
  type: z.enum(["human", "agent", "system"]).default("human"),
});

// ── Participants ─────────────────────────────────────────────────────
export const AddParticipantBody = z.object({
  agent_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  role: z.enum(["owner", "worker", "l1_auditor", "l2_meta_auditor"]),
  display_name: z.string().min(1).max(200),
});

// ── Agents ───────────────────────────────────────────────────────────
export const CreateAgentBody = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["worker", "l1_auditor", "l2_meta_auditor"]),
  description: z.string().max(2000).optional(),
  skills: z.array(z.string().min(1).max(200)).max(50).default([]),
  tools: z.array(z.string().min(1).max(200)).max(50).default([]),
});

export const UpdateAgentBody = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  skills: z.array(z.string().min(1).max(200)).max(50).optional(),
  tools: z.array(z.string().min(1).max(200)).max(50).optional(),
});

// ── Inbox ────────────────────────────────────────────────────────────
export const PatchInboxItemBody = z.object({
  status: z.enum(["accepted", "rejected", "expired"]),
});

export const CreateInboxItemBody = z.object({
  owner_id: z.string().uuid(),
  type: z.enum(["spot_invite", "contract_proposal", "l1_approval", "l2_certification"]),
  spot_id: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

// ── L1 Verdicts ──────────────────────────────────────────────────────
export const CreateL1VerdictBody = z.object({
  action_id: z.string().min(1),
  verdict: z.enum(["approve", "block"]),
  rationale: z.string().min(1, "Rationale is required").max(5000),
});

// ── L2 Reports ───────────────────────────────────────────────────────
export const CreateL2ReportBody = z.object({
  verdict: z.enum(["pass", "rework", "lockdown", "human_escalation"]),
  report: z.string().min(1, "Report is required").max(10000),
});

// ── Profile ──────────────────────────────────────────────────────────
export const UpdateProfileBody = z.object({
  display_name: z.string().min(1).max(200).optional(),
  persona: z.enum(["member", "pilot", "agent"]).optional(),
});

// ── Helper: safe JSON parse + validate ──────────────────────────────
interface ParseSuccess<T> {
  success: true;
  data: T;
  error: null;
}
interface ParseFailure {
  success: false;
  data: null;
  error: string;
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { success: false, data: null, error: "Invalid JSON body" };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation failed";
    return { success: false, data: null, error: message };
  }
  return { success: true, data: result.data, error: null };
}
