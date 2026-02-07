import type { Spot, SpotParticipant } from "./spotTypes";

/**
 * Check whether a SPOT can switch from DISCUSS to EXECUTE mode.
 * Requirements:
 *  1. SPOT must currently be in DISCUSS mode
 *  2. Contract must have a non-empty scope
 *  3. Contract must have at least one acceptance criterion
 *  4. An L1 Auditor must be assigned
 *  5. Tools/data scope must be defined
 */
export interface GatingResult {
  canSwitch: boolean;
  reasons: string[];
}

export function checkExecuteGating(
  spot: Spot,
  participants: SpotParticipant[],
): GatingResult {
  const reasons: string[] = [];

  if (spot.mode !== "discuss") {
    reasons.push("SPOT is not in DISCUSS mode.");
  }

  if (!spot.contract.scope || spot.contract.scope.trim().length === 0) {
    reasons.push("Contract scope must be defined.");
  }

  if (spot.contract.acceptanceCriteria.length === 0) {
    reasons.push("At least one acceptance criterion is required.");
  }

  if (spot.contract.allowedTools.length === 0) {
    reasons.push("Allowed tools must be specified.");
  }

  const hasL1 = participants.some((p) => p.role === "l1_auditor");
  if (!hasL1) {
    reasons.push("An L1 Auditor must be assigned.");
  }

  if (!spot.contract.signedAt) {
    reasons.push("Contract must be signed before switching to EXECUTE.");
  }

  return {
    canSwitch: reasons.length === 0,
    reasons,
  };
}

/**
 * Check whether a SPOT can request L2 certification.
 * Requirements:
 *  1. SPOT must be in EXECUTE mode
 *  2. Certification status must be "uncertified"
 *  3. An L2 Meta-Auditor must be assigned
 */
export interface CertificationGatingResult {
  canRequestCertification: boolean;
  reasons: string[];
}

export function checkCertificationGating(
  spot: Spot,
  participants: SpotParticipant[],
): CertificationGatingResult {
  const reasons: string[] = [];

  if (spot.mode !== "execute") {
    reasons.push("SPOT must be in EXECUTE mode.");
  }

  if (spot.certificationStatus !== "uncertified") {
    reasons.push("SPOT has already been submitted for certification.");
  }

  const hasL2 = participants.some((p) => p.role === "l2_meta_auditor");
  if (!hasL2) {
    reasons.push("An L2 Meta-Auditor must be assigned.");
  }

  return {
    canRequestCertification: reasons.length === 0,
    reasons,
  };
}

/**
 * Check whether a tool call can be executed.
 * Requirements:
 *  1. SPOT must be in EXECUTE mode
 *  2. Tool must be in the allowed tools list
 */
export function checkToolExecution(
  spot: Spot,
  toolName: string,
): { allowed: boolean; reason?: string } {
  if (spot.mode !== "execute") {
    return { allowed: false, reason: "Tool execution is only allowed in EXECUTE mode." };
  }

  if (!spot.contract.allowedTools.includes(toolName)) {
    return {
      allowed: false,
      reason: `Tool "${toolName}" is not in the allowed tools list.`,
    };
  }

  return { allowed: true };
}
