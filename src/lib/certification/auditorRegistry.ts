/**
 * Auditor Registry: key resolution, rotation, and historical lookup.
 *
 * This module queries the off-chain auditor registry (Supabase) to resolve
 * active keys, validate keys against validity windows, and support key
 * rotation without breaking old certificate verification.
 *
 * DESIGN NOTE: The registry is stored off-chain for simplicity and cost.
 * On-chain anchoring of a Merkle root can be added as a future extension
 * by computing the root of all active auditor key fingerprints and calling
 * a new contract method. This requires no changes to the registry schema.
 */
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { hashData } from "./canonicalize";
import type { AuditorRow, AuditorKeyRow, QuorumPolicyRow } from "./auditorTypes";

// ── Key fingerprint computation ────────────────────────────────────

/**
 * Compute a key fingerprint from a public key hex string.
 * This is the value stored in the cert package, not the raw key.
 */
export async function computeKeyFingerprint(publicKeyHex: string): Promise<string> {
  return hashData(publicKeyHex.toLowerCase());
}

// ── Auditor lookups ────────────────────────────────────────────────

/**
 * Find an auditor record by their Supabase user ID.
 */
export async function findAuditorByUserId(userId: string): Promise<AuditorRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("auditors")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return (data as AuditorRow) ?? null;
}

/**
 * Find an auditor by their registry ID.
 */
export async function findAuditorById(auditorId: string): Promise<AuditorRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("auditors")
    .select("*")
    .eq("id", auditorId)
    .single();

  return (data as AuditorRow) ?? null;
}

// ── Key lookups ────────────────────────────────────────────────────

/**
 * Get the currently active key for an auditor.
 * Returns null if the auditor has no active key.
 */
export async function getActiveKey(auditorId: string): Promise<AuditorKeyRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("auditor_keys")
    .select("*")
    .eq("auditor_id", auditorId)
    .eq("status", "active")
    .is("valid_until", null)
    .order("valid_from", { ascending: false })
    .limit(1)
    .single();

  return (data as AuditorKeyRow) ?? null;
}

/**
 * Get all keys for an auditor (full rotation history).
 * Ordered newest first.
 */
export async function getKeyHistory(auditorId: string): Promise<AuditorKeyRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("auditor_keys")
    .select("*")
    .eq("auditor_id", auditorId)
    .order("valid_from", { ascending: false });

  return (data as AuditorKeyRow[]) ?? [];
}

/**
 * Validate that a given public key was active for a specific auditor
 * at a specific point in time (the cert's issuedAt).
 *
 * This is the core function for historical key verification:
 * it checks that the key was registered, belonged to the right auditor,
 * and its validity window covers the issuance timestamp.
 */
export async function wasKeyActiveAt(
  publicKeyHex: string,
  issuedAt: string,
): Promise<{ valid: boolean; auditorId: string | null; role: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { valid: false, auditorId: null, role: null };

  const keyFingerprint = await computeKeyFingerprint(publicKeyHex);
  const issuedDate = new Date(issuedAt).toISOString();

  // Find the key by fingerprint
  const { data: keyRows } = await supabase
    .from("auditor_keys")
    .select("*, auditors!inner(id, role, status)")
    .eq("key_fingerprint", keyFingerprint)
    .lte("valid_from", issuedDate);

  if (!keyRows || keyRows.length === 0) {
    return { valid: false, auditorId: null, role: null };
  }

  // Check each matching key for validity at the given time
  for (const row of keyRows) {
    const key = row as AuditorKeyRow & { auditors: AuditorRow };
    const validFrom = new Date(key.valid_from);
    const validUntil = key.valid_until ? new Date(key.valid_until) : null;
    const issued = new Date(issuedAt);

    const withinWindow = issued >= validFrom && (!validUntil || issued <= validUntil);

    if (withinWindow) {
      return {
        valid: true,
        auditorId: key.auditor_id,
        role: key.auditors?.role ?? null,
      };
    }
  }

  return { valid: false, auditorId: null, role: null };
}

// ── Key rotation ───────────────────────────────────────────────────

/**
 * Rotate an auditor's key. This:
 *  1. Sets valid_until on the old key (closes its validity window)
 *  2. Creates a new key row with valid_from = now
 *
 * Old certs remain verifiable because the old key's window still covers
 * their issuedAt timestamp.
 */
export async function rotateKey(
  auditorId: string,
  newPublicKeyHex: string,
  reason?: string,
): Promise<AuditorKeyRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const now = new Date().toISOString();
  const newFingerprint = await computeKeyFingerprint(newPublicKeyHex);

  // Close the current active key's validity window
  await supabase
    .from("auditor_keys")
    .update({
      valid_until: now,
      rotation_reason: reason ?? "key rotation",
    })
    .eq("auditor_id", auditorId)
    .eq("status", "active")
    .is("valid_until", null);

  // Insert the new key
  const { data: newKey } = await supabase
    .from("auditor_keys")
    .insert({
      auditor_id: auditorId,
      public_key_hex: newPublicKeyHex,
      key_fingerprint: newFingerprint,
      status: "active",
      valid_from: now,
    })
    .select("*")
    .single();

  return (newKey as AuditorKeyRow) ?? null;
}

/**
 * Revoke a specific key. Sets status to "revoked" and closes the window.
 * Unlike rotation, no replacement key is created.
 */
export async function revokeKey(
  keyId: string,
  reason: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("auditor_keys")
    .update({
      status: "revoked",
      valid_until: new Date().toISOString(),
      rotation_reason: reason,
    })
    .eq("id", keyId);

  return !error;
}

// ── Quorum policy ──────────────────────────────────────────────────

/**
 * Get the active quorum policy for a given audit policy version.
 * Falls back to the default "1.0.0" policy if the specified version
 * is not found.
 */
export async function getQuorumPolicy(
  policyVersion: string,
): Promise<QuorumPolicyRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("quorum_policies")
    .select("*")
    .eq("policy_version", policyVersion)
    .eq("active", true)
    .single();

  if (data) return data as QuorumPolicyRow;

  // Fallback to default
  const { data: fallback } = await supabase
    .from("quorum_policies")
    .select("*")
    .eq("policy_version", "1.0.0")
    .eq("active", true)
    .single();

  return (fallback as QuorumPolicyRow) ?? null;
}

/**
 * Resolve auditor key fingerprints for use in the certification package.
 * Given a list of Supabase user IDs (L1 auditors) and a single user ID
 * (L2 auditor), resolves their active key fingerprints from the registry.
 *
 * If a user is not registered as an auditor or has no active key,
 * falls back to hashing their user ID (backward compatible with Phase A).
 */
export async function resolveAuditorKeyFingerprints(
  l1UserIds: string[],
  l2UserId: string,
): Promise<{
  l1KeyFingerprints: string[];
  l2KeyFingerprint: string;
  l1AuditorIds: string[];
  l2AuditorId: string | null;
}> {
  const l1KeyFingerprints: string[] = [];
  const l1AuditorIds: string[] = [];

  for (const userId of l1UserIds) {
    const auditor = await findAuditorByUserId(userId);
    if (auditor) {
      const key = await getActiveKey(auditor.id);
      if (key) {
        l1KeyFingerprints.push(key.key_fingerprint);
        l1AuditorIds.push(auditor.id);
        continue;
      }
    }
    // Fallback: hash the user ID directly
    l1KeyFingerprints.push(await hashData(userId));
  }

  let l2KeyFingerprint: string;
  let l2AuditorId: string | null = null;
  const l2Auditor = await findAuditorByUserId(l2UserId);
  if (l2Auditor) {
    const l2Key = await getActiveKey(l2Auditor.id);
    if (l2Key) {
      l2KeyFingerprint = l2Key.key_fingerprint;
      l2AuditorId = l2Auditor.id;
    } else {
      l2KeyFingerprint = await hashData(l2UserId);
    }
  } else {
    l2KeyFingerprint = await hashData(l2UserId);
  }

  return { l1KeyFingerprints, l2KeyFingerprint, l1AuditorIds, l2AuditorId };
}
