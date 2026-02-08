/**
 * Quorum enforcement for certification verification.
 *
 * Implements M-of-N signature requirements:
 *  - At least M valid L1 auditor signatures from distinct registered auditors
 *  - Optionally: a valid L2 auditor signature
 *
 * The required counts are driven by the quorum policy (stored in the DB).
 * This is an off-chain verification module. An on-chain quorum check
 * could be added as a future contract upgrade by requiring the platform
 * to submit a proof of quorum satisfaction alongside the cert hash.
 *
 * Current approach (off-chain first) is preferred because:
 *  - Zero gas overhead for quorum checks
 *  - Policy can be updated without contract migration
 *  - Full flexibility for complex rules (role-weighted quorum, etc.)
 *  - External verifiers can still independently check by running this logic
 */
import type { CertificationPackage } from "./types";
import type { QuorumPolicyRow } from "./auditorTypes";
import { wasKeyActiveAt, computeKeyFingerprint } from "./auditorRegistry";

export interface QuorumResult {
  satisfied: boolean;
  l1Count: number;
  l1Required: number;
  l1DistinctAuditors: string[];
  l2Present: boolean;
  l2Required: boolean;
  l2AuditorId: string | null;
  errors: string[];
}

/**
 * Check whether a certification package satisfies the quorum policy.
 *
 * For each L1 signature, we verify:
 *  1. The key was active at the cert's issuedAt timestamp
 *  2. The key belongs to a registered L1 auditor
 *  3. Each L1 signature comes from a distinct auditor
 *
 * For the L2 signature (when required):
 *  1. The key was active at issuedAt
 *  2. The key belongs to a registered L2 auditor
 */
export async function checkQuorum(
  pkg: CertificationPackage,
  policy: QuorumPolicyRow,
): Promise<QuorumResult> {
  const errors: string[] = [];
  const issuedAt = pkg.certificate.issuedAt;
  const l1DistinctAuditors: string[] = [];

  // Check L1 signatures
  const l1Sigs = pkg.signatures.l1Auditors ?? [];
  let validL1Count = 0;

  for (const sig of l1Sigs) {
    if (!sig.publicKeyHex || !sig.signatureHex) continue;

    // Use key fingerprint in error messages, never partial raw keys
    const keyFp = await computeKeyFingerprint(sig.publicKeyHex);
    const keyFpShort = keyFp.slice(0, 12);

    const keyCheck = await wasKeyActiveAt(sig.publicKeyHex, issuedAt);
    if (!keyCheck.valid) {
      errors.push(`L1 key [fp:${keyFpShort}...] was not active at issuance time`);
      continue;
    }

    if (keyCheck.role !== "l1") {
      errors.push(`Key [fp:${keyFpShort}...] belongs to a ${keyCheck.role} auditor, not L1`);
      continue;
    }

    // Check for distinct auditors (no double-counting)
    if (keyCheck.auditorId && l1DistinctAuditors.includes(keyCheck.auditorId)) {
      errors.push(`Duplicate L1 signature from auditor ${keyCheck.auditorId.slice(0, 8)}`);
      continue;
    }

    if (keyCheck.auditorId) {
      l1DistinctAuditors.push(keyCheck.auditorId);
    }
    validL1Count++;
  }

  if (validL1Count < policy.min_l1_signatures) {
    errors.push(
      `Quorum not met: ${validL1Count} valid L1 signatures, ` +
      `${policy.min_l1_signatures} required`,
    );
  }

  // Check L2 signature
  let l2Present = false;
  let l2AuditorId: string | null = null;

  if (pkg.signatures.l2Auditor?.publicKeyHex && pkg.signatures.l2Auditor?.signatureHex) {
    const l2Check = await wasKeyActiveAt(pkg.signatures.l2Auditor.publicKeyHex, issuedAt);
    if (l2Check.valid && l2Check.role === "l2") {
      l2Present = true;
      l2AuditorId = l2Check.auditorId;
    } else if (policy.require_l2_signature) {
      // Only report L2 errors when L2 is actually required by the policy.
      // When L2 is optional, a missing or invalid L2 key is not an error.
      if (l2Check.valid && l2Check.role !== "l2") {
        errors.push(`L2 signature key belongs to a ${l2Check.role} auditor, not L2`);
      } else {
        errors.push("L2 auditor key was not active at issuance time");
      }
    }
  }

  if (policy.require_l2_signature && !l2Present) {
    errors.push("Quorum requires L2 auditor signature, but none is present or valid");
  }

  const satisfied =
    validL1Count >= policy.min_l1_signatures &&
    (!policy.require_l2_signature || l2Present) &&
    errors.length === 0;

  return {
    satisfied,
    l1Count: validL1Count,
    l1Required: policy.min_l1_signatures,
    l1DistinctAuditors,
    l2Present,
    l2Required: policy.require_l2_signature,
    l2AuditorId,
    errors,
  };
}
