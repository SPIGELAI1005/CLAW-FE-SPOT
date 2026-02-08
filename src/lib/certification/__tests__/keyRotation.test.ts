import { describe, it, expect, vi } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";
import { verifySignature } from "../signer";
import { computeKeyFingerprint } from "../auditorRegistry";
import { hashData } from "../canonicalize";

/**
 * Key rotation verification test suite.
 *
 * Tests that old signatures remain verifiable after key rotation.
 * This is the core invariant: rotating a key must not break verification
 * of certificates signed with the old key.
 */

// Test keys (throwaway, not real)
const OLD_KEY: Hex = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const NEW_KEY: Hex = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

describe("key rotation: historical signature verification", () => {
  const oldAccount = privateKeyToAccount(OLD_KEY);
  const newAccount = privateKeyToAccount(NEW_KEY);
  const testFingerprint = "a1b2c3d4".repeat(8); // 64-char hex

  it("old key signature remains verifiable after rotation", async () => {
    // Sign with old key
    const oldSig = await oldAccount.signMessage({ message: testFingerprint });

    // Verify with old address (simulating historical lookup)
    const valid = await verifySignature(
      testFingerprint,
      oldSig,
      oldAccount.address,
    );
    expect(valid).toBe(true);

    // New key cannot verify old signature
    const invalidWithNew = await verifySignature(
      testFingerprint,
      oldSig,
      newAccount.address,
    );
    expect(invalidWithNew).toBe(false);
  });

  it("new key signature is verifiable with new address", async () => {
    const newSig = await newAccount.signMessage({ message: testFingerprint });

    const valid = await verifySignature(
      testFingerprint,
      newSig,
      newAccount.address,
    );
    expect(valid).toBe(true);
  });

  it("old and new keys produce different fingerprints", async () => {
    const oldFp = await computeKeyFingerprint(oldAccount.address);
    const newFp = await computeKeyFingerprint(newAccount.address);

    expect(oldFp).not.toBe(newFp);
    expect(oldFp).toMatch(/^[0-9a-f]{64}$/);
    expect(newFp).toMatch(/^[0-9a-f]{64}$/);
  });

  it("key fingerprint is deterministic", async () => {
    const fp1 = await computeKeyFingerprint(oldAccount.address);
    const fp2 = await computeKeyFingerprint(oldAccount.address);

    expect(fp1).toBe(fp2);
  });

  it("multiple signatures from different keys are independently verifiable", async () => {
    const certFingerprint = "deadbeef".repeat(8);

    // Both auditors sign the same cert
    const sigOld = await oldAccount.signMessage({ message: certFingerprint });
    const sigNew = await newAccount.signMessage({ message: certFingerprint });

    // Each verifies against their own address
    expect(await verifySignature(certFingerprint, sigOld, oldAccount.address)).toBe(true);
    expect(await verifySignature(certFingerprint, sigNew, newAccount.address)).toBe(true);

    // Cross-verification fails
    expect(await verifySignature(certFingerprint, sigOld, newAccount.address)).toBe(false);
    expect(await verifySignature(certFingerprint, sigNew, oldAccount.address)).toBe(false);
  });

  it("simulates a full rotation scenario", async () => {
    // Phase 1: Auditor signs with old key
    const cert1Fingerprint = "1111".repeat(16);
    const sig1 = await oldAccount.signMessage({ message: cert1Fingerprint });

    // Verify cert1 with old key (works)
    expect(await verifySignature(cert1Fingerprint, sig1, oldAccount.address)).toBe(true);

    // Phase 2: Key is rotated to new key
    // (In production, old key's valid_until is set, new key's valid_from is set)

    // Phase 3: Auditor signs new cert with new key
    const cert2Fingerprint = "2222".repeat(16);
    const sig2 = await newAccount.signMessage({ message: cert2Fingerprint });

    // Verify cert2 with new key (works)
    expect(await verifySignature(cert2Fingerprint, sig2, newAccount.address)).toBe(true);

    // Phase 4: Historical verification of cert1 still works with old key
    expect(await verifySignature(cert1Fingerprint, sig1, oldAccount.address)).toBe(true);

    // Phase 5: Old key cannot verify cert2 (signed with new key)
    expect(await verifySignature(cert2Fingerprint, sig2, oldAccount.address)).toBe(false);
  });
});

describe("key fingerprint backward compatibility", () => {
  it("fingerprint from address matches hashData of lowercased address", async () => {
    const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const fp = await computeKeyFingerprint(address);
    const manual = await hashData(address.toLowerCase());

    expect(fp).toBe(manual);
  });
});
