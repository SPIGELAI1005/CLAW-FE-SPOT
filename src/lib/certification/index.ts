/**
 * Certification subsystem: barrel export.
 *
 * Provides package building, canonicalization, signing, on-chain
 * interaction, auditor registry, quorum enforcement, and the full
 * verification pipeline.
 */
export { canonicalizeJSON, sha256Hex, computeFingerprint, hashData } from "./canonicalize";
export { signFingerprint, recoverSigner, verifySignature, getPlatformAddress, getPlatformPublicKeyHex } from "./signer";
export { buildCertificationPackage } from "./packageBuilder";
export type { BuildPackageInput } from "./packageBuilder";
export { verifyOnChain, isValidOnChain, anchorOnChain, revokeOnChain, supersedeOnChain, CERTIFICATION_REGISTRY_ABI } from "./contractClient";
export { verifyCertification } from "./verifier";

// Auditor registry
export {
  computeKeyFingerprint,
  findAuditorByUserId,
  findAuditorById,
  getActiveKey,
  getKeyHistory,
  wasKeyActiveAt,
  rotateKey,
  revokeKey,
  getQuorumPolicy,
  resolveAuditorKeyFingerprints,
} from "./auditorRegistry";

// Quorum
export { checkQuorum } from "./quorum";
export type { QuorumResult } from "./quorum";

// Types
export type {
  CertificationPackage,
  CertificationRow,
  CertStatus,
  VerificationResult,
  SignatureBlock,
  ToolchainFingerprint,
} from "./types";
export {
  CertificationPackageSchema,
  CertStatusSchema,
  RevokeCertificationBody,
  RevocationReasonCodeSchema,
  REVOCATION_REASON_CODES,
  CreateCertificationBody,
  ToolchainFingerprintSchema,
} from "./types";
export type { RevocationReasonCode } from "./types";

// Encryption
export { encryptPackageJson, decryptPackageJson, isEncryptionEnabled } from "./encryption";

// Auditor types
export type {
  AuditorRow,
  AuditorKeyRow,
  AuditorRole,
  AuditorStatus,
  KeyStatus,
  QuorumPolicyRow,
} from "./auditorTypes";
export {
  AuditorRoleSchema,
  AuditorStatusSchema,
  KeyStatusSchema,
  CreateAuditorBody,
  UpdateAuditorBody,
  AddAuditorKeyBody,
  RotateKeyBody,
  RevokeKeyBody,
  CreateQuorumPolicyBody,
} from "./auditorTypes";
