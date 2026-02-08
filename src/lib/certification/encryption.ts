/**
 * Application-layer encryption for certification package_json at rest.
 *
 * Uses AES-256-GCM for authenticated encryption. The encryption key
 * is read from the CERT_ENCRYPTION_KEY environment variable.
 *
 * When CERT_ENCRYPTION_KEY is not set, encryption is a no-op: data is
 * stored as plain JSON. This allows gradual rollout and backward
 * compatibility with existing unencrypted records.
 *
 * DESIGN NOTES:
 *  - This is defense-in-depth, not a primary control. The package_json
 *    already contains no PII; encryption protects signatures and keys
 *    if the database is compromised.
 *  - A unique random IV is generated for every encryption call.
 *  - The output format is: base64(iv + ciphertext + authTag)
 *  - Decryption auto-detects encrypted vs. plaintext records.
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits, recommended for GCM
const TAG_LENGTH = 128; // bits

// Prefix to identify encrypted blobs vs. plain JSON
const ENCRYPTED_PREFIX = "enc:v1:";

function getEncryptionKey(): string | null {
  return process.env.CERT_ENCRYPTION_KEY ?? null;
}

/**
 * Import a hex-encoded 256-bit key for AES-GCM.
 */
async function importKey(hexKey: string): Promise<CryptoKey> {
  const raw = hexToBuffer(hexKey);
  if (raw.byteLength !== 32) {
    throw new Error("CERT_ENCRYPTION_KEY must be exactly 32 bytes (64 hex chars)");
  }
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
}

function hexToBuffer(hex: string): ArrayBuffer {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

function base64ToBuffer(b64: string): ArrayBuffer {
  return Buffer.from(b64, "base64").buffer;
}

/**
 * Encrypt a JSON-serializable value. Returns a prefixed base64 string
 * if encryption is enabled, or the original value if not.
 */
export async function encryptPackageJson<T>(data: T): Promise<T | string> {
  const keyHex = getEncryptionKey();
  if (!keyHex) return data; // No encryption key; pass through

  const key = await importKey(keyHex);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    plaintext,
  );

  // Concatenate: iv (12 bytes) + ciphertext+tag
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return ENCRYPTED_PREFIX + bufferToBase64(combined.buffer);
}

/**
 * Decrypt a package_json value. Auto-detects encrypted vs. plain records.
 * If the value is a plain object (not encrypted), returns it as-is.
 */
export async function decryptPackageJson<T>(stored: unknown): Promise<T> {
  // If it's already an object, it's not encrypted
  if (typeof stored !== "string") return stored as T;

  // Check for encryption prefix
  if (!stored.startsWith(ENCRYPTED_PREFIX)) {
    // Plain JSON string (shouldn't normally happen, but handle gracefully)
    return JSON.parse(stored) as T;
  }

  const keyHex = getEncryptionKey();
  if (!keyHex) {
    throw new Error(
      "Record is encrypted but CERT_ENCRYPTION_KEY is not set. Cannot decrypt.",
    );
  }

  const key = await importKey(keyHex);
  const combined = new Uint8Array(
    base64ToBuffer(stored.slice(ENCRYPTED_PREFIX.length)),
  );

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    ciphertext,
  );

  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

/**
 * Check if application-layer encryption is enabled.
 */
export function isEncryptionEnabled(): boolean {
  return !!getEncryptionKey();
}
