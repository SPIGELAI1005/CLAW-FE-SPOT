import { describe, it, expect, beforeAll } from "vitest";
import { recoverSigner, verifySignature } from "../signer";
import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

// Use a throwaway test key, NOT a real key
const TEST_PRIVATE_KEY: Hex =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

describe("signer", () => {
  let testAccount: ReturnType<typeof privateKeyToAccount>;
  let testSignature: Hex;
  const testFingerprint = "a".repeat(64);

  beforeAll(async () => {
    testAccount = privateKeyToAccount(TEST_PRIVATE_KEY);
    testSignature = await testAccount.signMessage({
      message: testFingerprint,
    });
  });

  describe("recoverSigner", () => {
    it("recovers the correct address from a valid signature", async () => {
      const recovered = await recoverSigner(testFingerprint, testSignature);
      expect(recovered.toLowerCase()).toBe(
        testAccount.address.toLowerCase(),
      );
    });
  });

  describe("verifySignature", () => {
    it("returns true for a valid signature from the expected address", async () => {
      const result = await verifySignature(
        testFingerprint,
        testSignature,
        testAccount.address,
      );
      expect(result).toBe(true);
    });

    it("returns false for a wrong expected address", async () => {
      const wrongAddress = "0x0000000000000000000000000000000000000001";
      const result = await verifySignature(
        testFingerprint,
        testSignature,
        wrongAddress,
      );
      expect(result).toBe(false);
    });

    it("returns false for a tampered fingerprint", async () => {
      const tamperedFingerprint = "b".repeat(64);
      const result = await verifySignature(
        tamperedFingerprint,
        testSignature,
        testAccount.address,
      );
      expect(result).toBe(false);
    });

    it("returns false for an invalid signature", async () => {
      const result = await verifySignature(
        testFingerprint,
        "0x" + "00".repeat(65) as Hex,
        testAccount.address,
      );
      expect(result).toBe(false);
    });
  });
});
