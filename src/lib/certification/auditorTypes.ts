import { z } from "zod";

// ── Auditor role ───────────────────────────────────────────────────
export const AuditorRoleSchema = z.enum(["l1", "l2"]);
export type AuditorRole = z.infer<typeof AuditorRoleSchema>;

// ── Auditor status ─────────────────────────────────────────────────
export const AuditorStatusSchema = z.enum(["active", "suspended", "revoked"]);
export type AuditorStatus = z.infer<typeof AuditorStatusSchema>;

// ── Key status ─────────────────────────────────────────────────────
export const KeyStatusSchema = z.enum(["active", "revoked"]);
export type KeyStatus = z.infer<typeof KeyStatusSchema>;

// ── DB row types ───────────────────────────────────────────────────
export interface AuditorRow {
  id: string;
  user_id: string | null;
  display_alias: string;
  role: AuditorRole;
  status: AuditorStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditorKeyRow {
  id: string;
  auditor_id: string;
  public_key_hex: string;
  key_fingerprint: string;
  algorithm: string;
  status: KeyStatus;
  valid_from: string;
  valid_until: string | null;
  rotation_reason: string | null;
  created_at: string;
}

export interface QuorumPolicyRow {
  id: string;
  policy_version: string;
  min_l1_signatures: number;
  require_l2_signature: boolean;
  description: string | null;
  active: boolean;
  created_at: string;
}

// ── API request schemas ────────────────────────────────────────────

export const CreateAuditorBody = z.object({
  displayAlias: z.string().min(1).max(200),
  role: AuditorRoleSchema,
  userId: z.string().uuid().optional(),
});

export const UpdateAuditorBody = z.object({
  displayAlias: z.string().min(1).max(200).optional(),
  status: AuditorStatusSchema.optional(),
});

export const AddAuditorKeyBody = z.object({
  publicKeyHex: z.string().regex(/^0x[0-9a-fA-F]+$/, "Must be a hex string with 0x prefix"),
});

export const RotateKeyBody = z.object({
  newPublicKeyHex: z.string().regex(/^0x[0-9a-fA-F]+$/, "Must be a hex string with 0x prefix"),
  reason: z.string().min(1).max(500).optional(),
});

export const RevokeKeyBody = z.object({
  reason: z.string().min(1).max(500),
});

export const CreateQuorumPolicyBody = z.object({
  policyVersion: z.string().min(1).max(20),
  minL1Signatures: z.number().int().min(0),
  requireL2Signature: z.boolean(),
  description: z.string().max(500).optional(),
});
