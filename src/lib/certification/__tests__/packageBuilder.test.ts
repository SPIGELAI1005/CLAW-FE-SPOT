import { describe, it, expect, vi } from "vitest";
import { computeFingerprint } from "../canonicalize";

// Mock the signer module since it requires env vars
vi.mock("../signer", () => ({
  getPlatformPublicKeyHex: () => "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  signFingerprint: async (_fp: string) =>
    "0x" + "ab".repeat(65),
}));

// Import after mocking
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

describe("buildCertificationPackage", () => {
  it("produces a valid CertificationPackage", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.$schema).toBe("https://clawfe.io/schemas/certification-package/v1.json");
    expect(pkg.version).toBe("1.0.0");
    expect(pkg.type).toBe("spot-certification");
  });

  it("populates certificate metadata", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.certificate.spotId).toBe(baseInput.spotId);
    expect(pkg.certificate.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(pkg.certificate.issuedAt).toBeTruthy();
    expect(pkg.certificate.expiresAt).toBeNull();
    expect(pkg.certificate.supersedes).toBeNull();
  });

  it("includes hashed subject fingerprints (not raw data)", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    // spotFingerprint should be a 64-char hex hash, not the raw contract
    expect(pkg.subject.spotFingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(pkg.subject.mode).toBe("execute");
    expect(pkg.subject.participantCount).toBe(4);
    expect(pkg.subject.toolCount).toBe(1);
  });

  it("sorts participant roles and deduplicates", async () => {
    const input = {
      ...baseInput,
      participantRoles: ["worker", "owner", "worker", "l1_auditor"],
    };
    const pkg = await buildCertificationPackage(input);

    expect(pkg.subject.participantRoles).toEqual(
      [...new Set(input.participantRoles)].sort(),
    );
  });

  it("includes audit metadata", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.audit.l1VerdictCount).toBe(5);
    expect(pkg.audit.l1ApproveCount).toBe(4);
    expect(pkg.audit.l1BlockCount).toBe(1);
    expect(pkg.audit.l2Verdict).toBe("pass");
    expect(pkg.audit.l2ReportId).toBe(baseInput.l2ReportId);
    // Auditor fingerprints are hashes, not raw IDs
    expect(pkg.audit.l1AuditorFingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(pkg.audit.l2AuditorFingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it("computes a valid fingerprint", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.anchor.fingerprint).toMatch(/^[0-9a-f]{64}$/);

    // Re-computing should give the same result
    const recomputed = await computeFingerprint(
      pkg as unknown as Record<string, unknown>,
    );
    expect(recomputed).toBe(pkg.anchor.fingerprint);
  });

  it("includes platform signature", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.signatures.platform.algorithm).toBe("ECDSA-secp256k1");
    expect(pkg.signatures.platform.publicKeyHex).toBeTruthy();
    expect(pkg.signatures.platform.signatureHex).toBeTruthy();
  });

  it("leaves L1 auditor signatures as empty array (Phase A)", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.signatures.l1Auditors).toEqual([]);
  });

  it("leaves L2 auditor signature null (Phase A)", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.signatures.l2Auditor.signatureHex).toBeNull();
    expect(pkg.signatures.l2Auditor.publicKeyHex).toBeNull();
  });

  it("leaves tx_hash and block_number null (pre-anchoring)", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.anchor.transactionHash).toBeNull();
    expect(pkg.anchor.blockNumber).toBeNull();
  });

  it("sets chain metadata", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.anchor.chainId).toBe(84532);
    expect(pkg.anchor.contractAddress).toBe(baseInput.contractAddress);
  });

  // -- Policy and toolchain fingerprint tests --

  it("includes certVersion and checklistVersion in policy", async () => {
    const pkg = await buildCertificationPackage(baseInput);

    expect(pkg.policy.certVersion).toBe("1.0.0");
    expect(pkg.policy.checklistVersion).toBe("1.0.0");
    expect(pkg.policy.auditPolicyVersion).toBe("1.0.0");
  });

  it("accepts a custom checklistVersion", async () => {
    const input = { ...baseInput, checklistVersion: "2.3.0" };
    const pkg = await buildCertificationPackage(input);

    expect(pkg.policy.checklistVersion).toBe("2.3.0");
  });

  it("includes toolchainFingerprint with hash", async () => {
    const pkg = await buildCertificationPackage(baseInput);
    const tc = pkg.policy.toolchainFingerprint;

    expect(tc.platform).toMatch(/^claw-fe@/);
    expect(tc.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(tc.agentVersions).toEqual({});
    expect(tc.modelIdentifiers).toEqual({});
  });

  it("includes supplied agentVersions and modelIdentifiers", async () => {
    const input = {
      ...baseInput,
      agentVersions: { worker: "maker-v2.1", l1_auditor: "sentinel-v1.4" },
      modelIdentifiers: { worker: "gpt-4o-2025-06", l1_auditor: "claude-3.5-sonnet" },
    };
    const pkg = await buildCertificationPackage(input);
    const tc = pkg.policy.toolchainFingerprint;

    expect(tc.agentVersions).toEqual(input.agentVersions);
    expect(tc.modelIdentifiers).toEqual(input.modelIdentifiers);
  });

  it("produces a different toolchain hash when models differ", async () => {
    const pkg1 = await buildCertificationPackage(baseInput);
    const pkg2 = await buildCertificationPackage({
      ...baseInput,
      modelIdentifiers: { worker: "gpt-4o" },
    });

    expect(pkg1.policy.toolchainFingerprint.hash).not.toBe(
      pkg2.policy.toolchainFingerprint.hash,
    );
  });
});
