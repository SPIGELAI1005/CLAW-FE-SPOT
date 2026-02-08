/**
 * Builds a CertificationPackage from SPOT data, L2 report, and audit metadata.
 *
 * This is the core assembly step: it collects all relevant metadata,
 * computes structural fingerprints, and produces the canonical JSON
 * that will be hashed, signed, and anchored on-chain.
 *
 * PRIVACY: No PII, prompts, chat logs, or user content are included.
 * Only cryptographic fingerprints, counts, and structural metadata.
 */
import { computeFingerprint, hashData, canonicalizeJSON } from "./canonicalize";
import { signFingerprint, getPlatformPublicKeyHex } from "./signer";
import type { CertificationPackage, ToolchainFingerprint } from "./types";

export interface BuildPackageInput {
  spotId: string;
  spotContract: Record<string, unknown>;
  mode: string;
  participantCount: number;
  participantRoles: string[];
  toolCount: number;
  constraintCount: number;
  l1VerdictCount: number;
  l1ApproveCount: number;
  l1BlockCount: number;
  l1AuditorIds: string[];
  l2ReportId: string;
  l2AuditorId: string;
  chainId: number;
  contractAddress: string;
  supersedes?: string | null;
  // Toolchain metadata (optional; defaults applied when absent)
  agentVersions?: Record<string, string>;
  modelIdentifiers?: Record<string, string>;
  checklistVersion?: string;
}

/**
 * Build, sign, and fingerprint a complete CertificationPackage.
 *
 * Returns the package with all fields populated including the fingerprint
 * and platform signature. The anchor.transactionHash and anchor.blockNumber
 * are left null; they are filled in after on-chain anchoring.
 */
export async function buildCertificationPackage(
  input: BuildPackageInput,
): Promise<CertificationPackage> {
  // Compute structural fingerprints (no PII leaks)
  const spotFingerprint = await hashData(canonicalizeJSON(input.spotContract));

  const certId = crypto.randomUUID();

  // PRIVACY: Salt auditor fingerprints with the cert ID so the same set
  // of auditors produces different fingerprints in different certificates.
  // This prevents brute-force correlation when the auditor pool is small.
  const l1AuditorFingerprint = await hashData(
    [...input.l1AuditorIds].sort().join(",") + ":" + certId,
  );
  const l2AuditorFingerprint = await hashData(
    input.l2AuditorId + ":" + certId,
  );
  const issuedAt = new Date().toISOString();

  // Build the toolchain fingerprint
  const platformTag = `claw-fe@${process.env.npm_package_version ?? "0.1.0"}`;
  const agentVersions = input.agentVersions ?? {};
  const modelIdentifiers = input.modelIdentifiers ?? {};
  const toolchainBlob = canonicalizeJSON({
    platform: platformTag,
    agentVersions,
    modelIdentifiers,
  });
  const toolchainHash = await hashData(toolchainBlob);

  const toolchainFingerprint: ToolchainFingerprint = {
    platform: platformTag,
    agentVersions,
    modelIdentifiers,
    hash: toolchainHash,
  };

  // Assemble the package (signatures and anchor fingerprint added below)
  const pkg: CertificationPackage = {
    $schema: "https://clawfe.io/schemas/certification-package/v1.json",
    version: "1.0.0",
    type: "spot-certification",

    certificate: {
      id: certId,
      spotId: input.spotId,
      issuedAt,
      expiresAt: null,
      supersedes: input.supersedes ?? null,
    },

    subject: {
      spotFingerprint,
      mode: "execute",
      participantCount: input.participantCount,
      participantRoles: [...new Set(input.participantRoles)].sort(),
      toolCount: input.toolCount,
      constraintCount: input.constraintCount,
    },

    audit: {
      l1VerdictCount: input.l1VerdictCount,
      l1ApproveCount: input.l1ApproveCount,
      l1BlockCount: input.l1BlockCount,
      l1AuditorFingerprint,
      l2ReportId: input.l2ReportId,
      l2Verdict: "pass",
      l2AuditorFingerprint,
    },

    policy: {
      certVersion: "1.0.0",
      checklistVersion: input.checklistVersion ?? "1.0.0",
      platformVersion: process.env.npm_package_version ?? "0.1.0",
      contractSchemaVersion: "1.0.0",
      auditPolicyVersion: "1.0.0",
      toolchainFingerprint,
    },

    // Placeholder; populated after fingerprint computation
    signatures: {
      platform: {
        algorithm: "ECDSA-secp256k1",
        publicKeyHex: null,
        signatureHex: null,
      },
      l1Auditors: [], // Phase B: filled when L1 auditors co-sign
      l2Auditor: {
        algorithm: "ECDSA-secp256k1",
        publicKeyHex: null,
        signatureHex: null, // Phase B: filled when L2 auditor co-signs
      },
    },

    anchor: {
      chainId: input.chainId,
      contractAddress: input.contractAddress,
      transactionHash: null, // filled after on-chain tx
      blockNumber: null,     // filled after on-chain tx
      fingerprint: "",       // computed below
    },
  };

  // Compute fingerprint (over package minus signatures and anchor)
  const fingerprint = await computeFingerprint(
    pkg as unknown as Record<string, unknown>,
  );
  pkg.anchor.fingerprint = fingerprint;

  // Sign the fingerprint with the platform key
  const platformPubKey = getPlatformPublicKeyHex();
  const platformSig = await signFingerprint(fingerprint);

  pkg.signatures.platform = {
    algorithm: "ECDSA-secp256k1",
    publicKeyHex: platformPubKey,
    signatureHex: platformSig,
  };

  return pkg;
}
