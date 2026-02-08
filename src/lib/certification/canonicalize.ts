/**
 * Canonicalization and fingerprinting for certification packages.
 *
 * Uses RFC 8785 (JSON Canonicalization Scheme) for deterministic serialization,
 * and SHA-256 for content addressing. This ensures the same logical package
 * always produces the same fingerprint regardless of key ordering or whitespace.
 */
import canonicalize from "canonicalize";

/**
 * Canonicalize a JS object to a deterministic JSON string (RFC 8785 / JCS).
 * Returns the canonical UTF-8 string.
 */
export function canonicalizeJSON(obj: unknown): string {
  const result = canonicalize(obj);
  if (!result) throw new Error("Canonicalization failed: input produced empty output");
  return result;
}

/**
 * Compute SHA-256 hash of a UTF-8 string, returned as lowercase hex.
 * Works in both Node.js (via Web Crypto API) and browsers.
 */
export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compute the fingerprint of a certification package.
 *
 * The fingerprint is the SHA-256 hash of the JCS-canonical form of the package
 * with the `signatures` and `anchor` fields stripped. This means the fingerprint
 * is stable: it does not change when signatures or on-chain anchoring data are added.
 */
export async function computeFingerprint(
  packageData: Record<string, unknown>,
): Promise<string> {
  // Strip signatures and anchor: these are not part of the fingerprint
  const { signatures: _s, anchor: _a, ...core } = packageData;
  const canonical = canonicalizeJSON(core);
  return sha256Hex(canonical);
}

/**
 * Compute SHA-256 of arbitrary data for subject/auditor fingerprints.
 */
export async function hashData(data: string): Promise<string> {
  return sha256Hex(data);
}
