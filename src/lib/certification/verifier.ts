/**
 * Full verification pipeline for certification packages.
 *
 * Combines off-chain checks (canonicalization, fingerprint recomputation,
 * signature recovery, quorum enforcement) with on-chain verification
 * (contract state read).
 *
 * Used by both the authenticated verify API route and the public endpoint.
 */
import { computeFingerprint } from "./canonicalize";
import { verifySignature } from "./signer";
import { verifyOnChain } from "./contractClient";
import { getQuorumPolicy } from "./auditorRegistry";
import { checkQuorum } from "./quorum";
import type { CertificationPackage, VerificationResult } from "./types";
import type { Hex } from "viem";

/**
 * Run the full verification pipeline on a certification package.
 *
 * Steps:
 *  1. Recompute fingerprint from the package core (excl. signatures + anchor)
 *  2. Compare with the stored anchor.fingerprint
 *  3. Verify platform signature over the fingerprint
 *  4. Verify L1 auditor signatures when present
 *  5. Verify L2 auditor signature when present
 *  6. Enforce quorum policy (M-of-N L1 + optional L2)
 *  7. Check on-chain status via contract.getCertificate()
 */
export async function verifyCertification(
  pkg: CertificationPackage,
): Promise<VerificationResult> {
  const errors: string[] = [];

  // 1. Recompute fingerprint
  let computedFingerprint: string;
  try {
    computedFingerprint = await computeFingerprint(
      pkg as unknown as Record<string, unknown>,
    );
  } catch (err) {
    return {
      verified: false,
      fingerprintMatch: false,
      onChainStatus: "not_found",
      onChainIssuer: null,
      onChainTimestamp: null,
      platformSignatureValid: false,
      l1AuditorSignaturesValid: null,
      l2AuditorSignatureValid: null,
      quorumSatisfied: null,
      errors: [`Fingerprint computation failed: ${err instanceof Error ? err.message : "unknown"}`],
    };
  }

  // 2. Compare fingerprints
  const fingerprintMatch = computedFingerprint === pkg.anchor.fingerprint;
  if (!fingerprintMatch) {
    errors.push(
      `Fingerprint mismatch: computed ${computedFingerprint}, stored ${pkg.anchor.fingerprint}`,
    );
  }

  // 3. Verify platform signature
  let platformSignatureValid = false;
  if (
    pkg.signatures.platform.signatureHex &&
    pkg.signatures.platform.publicKeyHex
  ) {
    platformSignatureValid = await verifySignature(
      pkg.anchor.fingerprint,
      pkg.signatures.platform.signatureHex as Hex,
      pkg.signatures.platform.publicKeyHex,
    );
    if (!platformSignatureValid) {
      errors.push("Platform signature verification failed");
    }
  } else {
    errors.push("Platform signature is missing");
  }

  // 4. Verify L1 auditor signatures (optional, array)
  let l1AuditorSignaturesValid: boolean | null = null;
  const l1Sigs = pkg.signatures.l1Auditors ?? [];
  if (l1Sigs.length > 0) {
    const results = await Promise.all(
      l1Sigs.map(async (sig) => {
        if (!sig.signatureHex || !sig.publicKeyHex) return false;
        return verifySignature(
          pkg.anchor.fingerprint,
          sig.signatureHex as Hex,
          sig.publicKeyHex,
        );
      }),
    );
    l1AuditorSignaturesValid = results.every(Boolean);
    if (!l1AuditorSignaturesValid) {
      errors.push("One or more L1 auditor signatures failed verification");
    }
  }

  // 5. Verify L2 auditor signature (optional, single)
  let l2AuditorSignatureValid: boolean | null = null;
  if (
    pkg.signatures.l2Auditor?.signatureHex &&
    pkg.signatures.l2Auditor?.publicKeyHex
  ) {
    l2AuditorSignatureValid = await verifySignature(
      pkg.anchor.fingerprint,
      pkg.signatures.l2Auditor.signatureHex as Hex,
      pkg.signatures.l2Auditor.publicKeyHex,
    );
    if (!l2AuditorSignatureValid) {
      errors.push("L2 auditor signature verification failed");
    }
  }

  // 6. Quorum enforcement (best-effort; skipped if registry unavailable)
  let quorumSatisfied: boolean | null = null;
  try {
    const policyVersion = pkg.policy?.auditPolicyVersion ?? "1.0.0";
    const policy = await getQuorumPolicy(policyVersion);
    if (policy) {
      const quorumResult = await checkQuorum(pkg, policy);
      quorumSatisfied = quorumResult.satisfied;
      if (!quorumResult.satisfied) {
        for (const e of quorumResult.errors) {
          errors.push(`Quorum: ${e}`);
        }
      }
    }
  } catch {
    // Registry unavailable; quorum check is best-effort
    quorumSatisfied = null;
  }

  // 7. On-chain verification
  let onChainStatus: VerificationResult["onChainStatus"] = "not_found";
  let onChainIssuer: string | null = null;
  let onChainTimestamp: number | null = null;

  try {
    const record = await verifyOnChain(pkg.anchor.fingerprint);
    onChainStatus = record.status;
    onChainIssuer = record.issuer;
    onChainTimestamp = record.timestamp;

    if (record.status === "not_found") {
      errors.push("Certificate not found on-chain");
    } else if (record.status === "revoked") {
      errors.push("Certificate has been revoked on-chain");
    } else if (record.status === "superseded") {
      errors.push("Certificate has been superseded on-chain");
    }
  } catch (err) {
    errors.push(
      `On-chain verification failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }

  // Final verdict
  const verified =
    fingerprintMatch &&
    platformSignatureValid &&
    onChainStatus === "valid" &&
    errors.length === 0;

  return {
    verified,
    fingerprintMatch,
    onChainStatus,
    onChainIssuer,
    onChainTimestamp,
    platformSignatureValid,
    l1AuditorSignaturesValid,
    l2AuditorSignatureValid,
    quorumSatisfied,
    errors,
  };
}
