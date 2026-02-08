/**
 * EIP-191 signing and verification for certification fingerprints.
 *
 * Uses secp256k1 ECDSA (Ethereum-compatible) so that signatures can be
 * verified on-chain via ecrecover if needed in a future phase.
 *
 * The platform key is read from the CERTIFICATION_PRIVATE_KEY env var.
 * It must be a 32-byte hex-encoded private key (with 0x prefix).
 */
import {
  type Hex,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { recoverMessageAddress } from "viem";

// ── Platform Key Management ────────────────────────────────────────

let cachedAccount: PrivateKeyAccount | null = null;

function getPlatformAccount(): PrivateKeyAccount {
  if (cachedAccount) return cachedAccount;

  const key = process.env.CERTIFICATION_PRIVATE_KEY;
  if (!key) {
    throw new Error(
      "CERTIFICATION_PRIVATE_KEY is not set. Cannot sign certificates.",
    );
  }

  cachedAccount = privateKeyToAccount(key as Hex);
  return cachedAccount;
}

/**
 * Get the platform's public address (derived from the private key).
 */
export function getPlatformAddress(): string {
  return getPlatformAccount().address;
}

/**
 * Get the platform's compressed public key hex.
 * This is included in the certification package for independent verification.
 */
export function getPlatformPublicKeyHex(): Hex {
  const account = getPlatformAccount();
  // viem Account has .address but not raw publicKey; we use address as identifier
  return account.address as Hex;
}

// ── Signing ────────────────────────────────────────────────────────

/**
 * Sign a fingerprint (SHA-256 hex string) using the platform key.
 * Uses EIP-191 personal sign for domain separation.
 *
 * @param fingerprint - the 64-char hex string (SHA-256 of canonical package)
 * @returns signature hex string
 */
export async function signFingerprint(fingerprint: string): Promise<Hex> {
  const account = getPlatformAccount();
  // Sign the fingerprint bytes as an EIP-191 personal message
  const signature = await account.signMessage({
    message: fingerprint,
  });
  return signature;
}

// ── Verification ───────────────────────────────────────────────────

/**
 * Recover the signer address from a fingerprint + EIP-191 signature.
 * Used to verify that a specific address signed a given fingerprint.
 *
 * @param fingerprint - the 64-char hex string
 * @param signature - the EIP-191 signature hex
 * @returns the recovered Ethereum address
 */
export async function recoverSigner(
  fingerprint: string,
  signature: Hex,
): Promise<string> {
  const recoveredAddress = await recoverMessageAddress({
    message: fingerprint,
    signature,
  });
  return recoveredAddress;
}

/**
 * Verify that a signature over a fingerprint was produced by the expected address.
 */
export async function verifySignature(
  fingerprint: string,
  signature: Hex,
  expectedAddress: string,
): Promise<boolean> {
  try {
    const recovered = await recoverSigner(fingerprint, signature);
    return recovered.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}
