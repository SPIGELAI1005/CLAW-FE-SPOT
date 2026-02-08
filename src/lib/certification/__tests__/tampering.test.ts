import { describe, it, expect, vi } from "vitest";
import { computeFingerprint } from "../canonicalize";

// Mock the signer module
vi.mock("../signer", () => ({
  getPlatformPublicKeyHex: () => "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  signFingerprint: async (_fp: string) =>
    "0x" + "ab".repeat(65),
}));

const { buildCertificationPackage } = await import("../packageBuilder");

const baseInput = {
  spotId: "00000000-0000-0000-0000-000000000001",
  spotContract: { scope: "test", allowed_tools: ["tool1"], acceptance_criteria: ["c1"] },
  mode: "execute",
  participantCount: 4,
  participantRoles: ["owner", "worker", "l1_auditor", "l2_meta_auditor"],
  toolCount: 1,
  constraintCount: 1,
  l1VerdictCount: 5,
  l1ApproveCount: 4,
  l1BlockCount: 1,
  l1AuditorIds: ["auditor-1", "auditor-2"],
  l2ReportId: "00000000-0000-0000-0000-000000000002",
  l2AuditorId: "00000000-0000-0000-0000-000000000003",
  chainId: 84532,
  contractAddress: "0x1234567890123456789012345678901234567890",
};

describe("tampering detection", () => {
  it("detects modification to the audit verdict count", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    // Clone and tamper: change the L1 approve count
    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.audit.l1ApproveCount = 999;

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
    expect(tamperedFp).not.toBe(tampered.anchor.fingerprint);
  });

  it("detects modification to the subject fingerprint", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.subject.spotFingerprint = "0".repeat(64);

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
  });

  it("detects modification to the certificate ID", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.certificate.id = "ffffffff-ffff-ffff-ffff-ffffffffffff";

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
  });

  it("detects modification to the policy version", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.policy.auditPolicyVersion = "99.0.0";

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
  });

  it("detects modification to the toolchain fingerprint", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.policy.toolchainFingerprint.platform = "evil-fork@6.6.6";

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
  });

  it("is NOT affected by changing signatures (correctly excluded)", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.signatures.platform.signatureHex = "0x" + "ff".repeat(65);

    const tamperedFp = await computeFingerprint(tampered);

    // Signatures are excluded from the fingerprint, so it should match
    expect(tamperedFp).toBe(originalFp);
  });

  it("is NOT affected by changing anchor fields (correctly excluded)", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.anchor.transactionHash = "0x" + "cc".repeat(32);
    tampered.anchor.blockNumber = 9999999;

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).toBe(originalFp);
  });

  it("detects swapped L2 report ID (different audit session)", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.audit.l2ReportId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
  });

  it("detects participant count manipulation", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const originalFp = pkg.anchor.fingerprint;

    const tampered = JSON.parse(JSON.stringify(pkg));
    tampered.subject.participantCount = 100;

    const tamperedFp = await computeFingerprint(tampered);

    expect(tamperedFp).not.toBe(originalFp);
  });
});
