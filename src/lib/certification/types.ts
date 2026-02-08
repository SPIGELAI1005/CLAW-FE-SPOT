import { z } from "zod";

// ── Certification Status (on-chain + off-chain) ────────────────────
export const CertStatusSchema = z.enum(["valid", "revoked", "superseded"]);
export type CertStatus = z.infer<typeof CertStatusSchema>;

// ── Signature Block ────────────────────────────────────────────────
export const SignatureBlockSchema = z.object({
  algorithm: z.literal("ECDSA-secp256k1"),
  publicKeyHex: z.string().regex(/^0x[0-9a-fA-F]+$/).nullable(),
  signatureHex: z.string().regex(/^0x[0-9a-fA-F]+$/).nullable(),
});
export type SignatureBlock = z.infer<typeof SignatureBlockSchema>;

// ── Toolchain Fingerprint ──────────────────────────────────────────
// Records the exact software stack active during the audited session.
// Enables reproducibility checks and version-pinned trust.
export const ToolchainFingerprintSchema = z.object({
  platform: z.string(),             // e.g. "claw-fe@0.1.0"
  agentVersions: z.record(z.string(), z.string()), // role -> version
  modelIdentifiers: z.record(z.string(), z.string()), // role -> model id
  hash: z.string(),                 // SHA-256 of the canonical toolchain blob
});
export type ToolchainFingerprint = z.infer<typeof ToolchainFingerprintSchema>;

// ── Certification Package (canonical JSON) ─────────────────────────
export const CertificationPackageSchema = z.object({
  $schema: z.literal("https://clawfe.io/schemas/certification-package/v1.json"),
  version: z.literal("1.0.0"),
  type: z.literal("spot-certification"),

  certificate: z.object({
    id: z.string().uuid(),
    spotId: z.string().uuid(),
    issuedAt: z.string().datetime(),
    expiresAt: z.string().datetime().nullable(),
    supersedes: z.string().nullable(), // fingerprint hex of previous cert
  }),

  subject: z.object({
    spotFingerprint: z.string(), // SHA-256 hex of canonical SPOT contract
    mode: z.literal("execute"),
    participantCount: z.number().int().min(1),
    participantRoles: z.array(z.string()),
    toolCount: z.number().int().min(0),
    constraintCount: z.number().int().min(0),
  }),

  audit: z.object({
    l1VerdictCount: z.number().int().min(0),
    l1ApproveCount: z.number().int().min(0),
    l1BlockCount: z.number().int().min(0),
    l1AuditorFingerprint: z.string(), // SHA-256 hex of sorted L1 auditor IDs
    l2ReportId: z.string().uuid(),
    l2Verdict: z.literal("pass"),
    l2AuditorFingerprint: z.string(), // SHA-256 hex of L2 auditor ID
  }),

  policy: z.object({
    certVersion: z.string(),         // schema version of this cert format
    checklistVersion: z.string(),    // version of acceptance criteria template
    platformVersion: z.string(),     // CLAW:FE release tag
    contractSchemaVersion: z.string(),
    auditPolicyVersion: z.string(),
    toolchainFingerprint: ToolchainFingerprintSchema,
  }),

  signatures: z.object({
    platform: SignatureBlockSchema,
    l1Auditors: z.array(SignatureBlockSchema), // one entry per L1 auditor
    l2Auditor: SignatureBlockSchema,
  }),

  anchor: z.object({
    chainId: z.number().int(),
    contractAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
    transactionHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/).nullable(),
    blockNumber: z.number().int().nullable(),
    fingerprint: z.string(), // SHA-256 hex of package (excl. signatures + anchor)
  }),
});
export type CertificationPackage = z.infer<typeof CertificationPackageSchema>;

// ── DB Row (off-chain storage) ─────────────────────────────────────
export interface CertificationRow {
  id: string;
  spot_id: string;
  l2_report_id: string;
  fingerprint: string;
  package_json: CertificationPackage;
  platform_sig: string;
  auditor_sigs: string | null; // JSON array of L1 + L2 sigs
  chain_id: number;
  contract_addr: string;
  tx_hash: string | null;
  block_number: number | null;
  status: CertStatus;
  superseded_by: string | null;
  revocation_reason: string | null;
  created_at: string;
}

// ── Verification Result ────────────────────────────────────────────
export interface VerificationResult {
  verified: boolean;
  fingerprintMatch: boolean;
  onChainStatus: CertStatus | "not_found";
  onChainIssuer: string | null;
  onChainTimestamp: number | null;
  platformSignatureValid: boolean;
  l1AuditorSignaturesValid: boolean | null; // null when no L1 sigs present
  l2AuditorSignatureValid: boolean | null;  // null when no L2 sig present
  quorumSatisfied: boolean | null;          // null when registry unavailable
  errors: string[];
}

// ── Revocation Reason Codes ────────────────────────────────────────
// Only these codes are permitted on-chain. Free-text detail stays off-chain only.
// This prevents accidental PII or sensitive info from being written permanently
// to the blockchain event log.
export const REVOCATION_REASON_CODES = [
  "KEY_COMPROMISE",
  "POLICY_VIOLATION",
  "AUDIT_INVALIDATED",
  "SUPERSEDED",
  "OPERATOR_REQUEST",
  "CONTRACT_BREACH",
  "OTHER",
] as const;

export const RevocationReasonCodeSchema = z.enum(REVOCATION_REASON_CODES);
export type RevocationReasonCode = z.infer<typeof RevocationReasonCodeSchema>;

// ── API Schemas ────────────────────────────────────────────────────
export const RevokeCertificationBody = z.object({
  // On-chain: only the enum code is written to the blockchain event log
  reasonCode: RevocationReasonCodeSchema,
  // Off-chain only: free-text detail stored in the database, never on-chain
  detail: z.string().max(2000).optional(),
});

// ── Create Certification (standalone endpoint) ─────────────────────
export const CreateCertificationBody = z.object({
  spotId: z.string().uuid(),
  l2ReportId: z.string().uuid(),
  // Optional: toolchain metadata the caller can supply
  toolchain: z.object({
    agentVersions: z.record(z.string(), z.string()).optional(),
    modelIdentifiers: z.record(z.string(), z.string()).optional(),
  }).optional(),
});
