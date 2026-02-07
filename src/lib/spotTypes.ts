import { z } from "zod";

// ── SPOT Mode ───────────────────────────────────────────────────────
export const SpotModeSchema = z.enum(["discuss", "execute"]);
export type SpotMode = z.infer<typeof SpotModeSchema>;

// ── Certification Status ────────────────────────────────────────────
export const CertificationStatusSchema = z.enum([
  "uncertified",
  "certified",
  "rework",
  "lockdown",
  "human_escalation",
]);
export type CertificationStatus = z.infer<typeof CertificationStatusSchema>;

// ── SPOT Status (lifecycle) ─────────────────────────────────────────
export const SpotStatusSchema = z.enum([
  "draft",
  "active",
  "needs_review",
  "completed",
  "archived",
]);
export type SpotStatus = z.infer<typeof SpotStatusSchema>;

// ── Participant Role ────────────────────────────────────────────────
export const ParticipantRoleSchema = z.enum([
  "owner",
  "worker",
  "l1_auditor",
  "l2_meta_auditor",
]);
export type ParticipantRole = z.infer<typeof ParticipantRoleSchema>;

// ── SPOT Contract ───────────────────────────────────────────────────
export const SpotContractSchema = z.object({
  scope: z.string().max(5000).default(""),
  allowedTools: z.array(z.string().min(1).max(200)).max(50).default([]),
  allowedData: z.array(z.string().min(1).max(200)).max(50).default([]),
  acceptanceCriteria: z.array(z.string().min(1).max(1000)).max(50).default([]),
  terminationConditions: z.string().max(2000).default(""),
  signedAt: z.string().datetime().nullable().default(null),
  signedBy: z.string().nullable().default(null),
});
export type SpotContract = z.infer<typeof SpotContractSchema>;

// ── SPOT (main entity) ──────────────────────────────────────────────
export const SpotSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),
  mode: SpotModeSchema.default("discuss"),
  status: SpotStatusSchema.default("draft"),
  certificationStatus: CertificationStatusSchema.default("uncertified"),
  contract: SpotContractSchema.default({
    scope: "",
    allowedTools: [],
    allowedData: [],
    acceptanceCriteria: [],
    terminationConditions: "",
    signedAt: null,
    signedBy: null,
  }),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Spot = z.infer<typeof SpotSchema>;

// ── Participant ─────────────────────────────────────────────────────
export const SpotParticipantSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  userId: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  role: ParticipantRoleSchema,
  displayName: z.string().min(1),
  avatarUrl: z.string().optional(),
  invitedAt: z.string().datetime().optional(),
  acceptedAt: z.string().datetime().optional(),
});
export type SpotParticipant = z.infer<typeof SpotParticipantSchema>;

// ── Message ─────────────────────────────────────────────────────────
export const MessageTypeSchema = z.enum(["human", "agent", "system"]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const SpotMessageSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  type: MessageTypeSchema,
  senderName: z.string().min(1),
  content: z.string().min(1),
  createdAt: z.string().datetime().optional(),
});
export type SpotMessage = z.infer<typeof SpotMessageSchema>;

// ── L1 Verdict ──────────────────────────────────────────────────────
export const L1VerdictSchema = z.enum(["approve", "block"]);
export type L1Verdict = z.infer<typeof L1VerdictSchema>;

export const L1VerdictRecordSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  actionId: z.string().min(1),
  verdict: L1VerdictSchema,
  rationale: z.string().min(1),
  auditorId: z.string().min(1),
  createdAt: z.string().datetime().optional(),
});
export type L1VerdictRecord = z.infer<typeof L1VerdictRecordSchema>;

// ── L2 Report ───────────────────────────────────────────────────────
export const L2VerdictSchema = z.enum([
  "pass",
  "rework",
  "lockdown",
  "human_escalation",
]);
export type L2Verdict = z.infer<typeof L2VerdictSchema>;

export const L2ReportSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  verdict: L2VerdictSchema,
  report: z.string().min(1),
  auditorId: z.string().min(1),
  createdAt: z.string().datetime().optional(),
});
export type L2Report = z.infer<typeof L2ReportSchema>;

// ── Tool Call (for timeline) ────────────────────────────────────────
export const ToolCallSchema = z.object({
  id: z.string().min(1),
  spotId: z.string().min(1),
  intent: z.string().min(1),
  toolName: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
  l1Verdict: L1VerdictSchema.optional(),
  l1Rationale: z.string().optional(),
  outcome: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

// ── Agent ───────────────────────────────────────────────────────────
export const AgentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
  skills: z.array(z.string().min(1)).default([]),
  tools: z.array(z.string().min(1)).default([]),
  trustLevel: z.number().min(0).max(100).default(0),
  certifiedOutcomes: z.number().int().min(0).default(0),
  avatarUrl: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});
export type Agent = z.infer<typeof AgentSchema>;

// ── Inbox Item ──────────────────────────────────────────────────────
export const InboxItemTypeSchema = z.enum([
  "spot_invite",
  "contract_proposal",
  "l1_approval",
  "l2_certification",
]);
export type InboxItemType = z.infer<typeof InboxItemTypeSchema>;

export const InboxItemSchema = z.object({
  id: z.string().min(1),
  type: InboxItemTypeSchema,
  spotId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "accepted", "rejected", "expired"]).default("pending"),
  createdAt: z.string().datetime().optional(),
});
export type InboxItem = z.infer<typeof InboxItemSchema>;

// ── Persona (user type) ────────────────────────────────────────────
export const PersonaSchema = z.enum(["member", "pilot", "agent"]);
export type Persona = z.infer<typeof PersonaSchema>;

// ── Display-name maps (DB values → user-facing labels) ─────────────
export const agentRoleDisplayNames: Record<string, string> = {
  worker: "Maker",
  l1_auditor: "Sentinel",
  l2_meta_auditor: "Arbiter",
};

export const participantRoleDisplayNames: Record<string, string> = {
  owner: "Owner",
  worker: "Maker",
  l1_auditor: "Sentinel",
  l2_meta_auditor: "Arbiter",
};

export const personaConfig = {
  member: { label: "Member", description: "Human participant. Join SPOTs, discuss, review, approve.", color: "sky" as const },
  pilot: { label: "Pilot", description: "Human operator. Create, own, and deploy AI agents into SPOTs.", color: "amber" as const },
} as const;

export const agentRoleConfig = {
  worker: { label: "Maker", description: "Executes tasks, proposes plans, recruits specialists.", color: "sky" as const },
  l1_auditor: { label: "Sentinel", description: "Gates every tool call in real-time. Detects threats.", color: "amber" as const },
  l2_meta_auditor: { label: "Arbiter", description: "Reviews the full log. Issues final certification.", color: "emerald" as const },
} as const;

// ── Filter helpers ──────────────────────────────────────────────────
export const spotFilters = [
  { value: "all" as const, label: "All" },
  { value: "discuss" as const, label: "Discuss" },
  { value: "execute" as const, label: "Execute" },
  { value: "certified" as const, label: "Certified" },
  { value: "needs_action" as const, label: "Needs Action" },
];

export type SpotFilterValue = (typeof spotFilters)[number]["value"];
