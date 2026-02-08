import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CertificationPackage } from "../types";
import type { QuorumPolicyRow } from "../auditorTypes";

// Mock the auditor registry (must include all imports used by quorum.ts)
vi.mock("../auditorRegistry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auditorRegistry")>();
  return {
    ...actual,
    wasKeyActiveAt: vi.fn(),
  };
});

// Import after mock
const { checkQuorum } = await import("../quorum");
const { wasKeyActiveAt } = await import("../auditorRegistry");
const mockWasKeyActiveAt = vi.mocked(wasKeyActiveAt);

// ── Test fixtures ───────────────────────────────────────────────────

function makePolicy(overrides: Partial<QuorumPolicyRow> = {}): QuorumPolicyRow {
  return {
    id: "policy-1",
    policy_version: "1.0.0",
    min_l1_signatures: 2,
    require_l2_signature: true,
    description: "Test policy",
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makePkg(overrides: Partial<CertificationPackage> = {}): CertificationPackage {
  return {
    $schema: "https://clawfe.io/schemas/certification-package/v1.json",
    version: "1.0.0",
    type: "spot-certification",
    certificate: {
      id: "cert-1",
      spotId: "spot-1",
      issuedAt: "2026-02-01T12:00:00.000Z",
      expiresAt: null,
      supersedes: null,
    },
    subject: {
      spotFingerprint: "a".repeat(64),
      mode: "execute",
      participantCount: 4,
      participantRoles: ["owner", "worker"],
      toolCount: 1,
      constraintCount: 1,
    },
    audit: {
      l1VerdictCount: 3,
      l1ApproveCount: 3,
      l1BlockCount: 0,
      l1AuditorFingerprint: "b".repeat(64),
      l2ReportId: "report-1",
      l2Verdict: "pass",
      l2AuditorFingerprint: "c".repeat(64),
    },
    policy: {
      certVersion: "1.0.0",
      checklistVersion: "1.0.0",
      platformVersion: "0.1.0",
      contractSchemaVersion: "1.0.0",
      auditPolicyVersion: "1.0.0",
      toolchainFingerprint: {
        platform: "claw-fe@0.1.0",
        agentVersions: {},
        modelIdentifiers: {},
        hash: "d".repeat(64),
      },
    },
    signatures: {
      platform: { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xplatform", signatureHex: "0xplatsig" },
      l1Auditors: [
        { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xL1A", signatureHex: "0xL1Asig" },
        { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xL1B", signatureHex: "0xL1Bsig" },
        { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xL1C", signatureHex: "0xL1Csig" },
      ],
      l2Auditor: { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xL2", signatureHex: "0xL2sig" },
    },
    anchor: {
      chainId: 84532,
      contractAddress: "0x" + "0".repeat(40),
      transactionHash: null,
      blockNumber: null,
      fingerprint: "e".repeat(64),
    },
    ...overrides,
  } as CertificationPackage;
}

// ── Tests ───────────────────────────────────────────────────────────

describe("checkQuorum", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("satisfies quorum when all L1 and L2 keys are valid", async () => {
    // All three L1 keys are valid
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex === "0xL2") {
        return { valid: true, auditorId: "aud-l2", role: "l2" };
      }
      // L1 keys
      const auditorMap: Record<string, string> = {
        "0xL1A": "aud-a",
        "0xL1B": "aud-b",
        "0xL1C": "aud-c",
      };
      return { valid: true, auditorId: auditorMap[publicKeyHex] ?? null, role: "l1" };
    });

    const result = await checkQuorum(makePkg(), makePolicy({ min_l1_signatures: 2 }));

    expect(result.satisfied).toBe(true);
    expect(result.l1Count).toBe(3);
    expect(result.l1Required).toBe(2);
    expect(result.l2Present).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("fails quorum when not enough L1 signatures", async () => {
    // Only one L1 key is valid
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex === "0xL2") {
        return { valid: true, auditorId: "aud-l2", role: "l2" };
      }
      if (publicKeyHex === "0xL1A") {
        return { valid: true, auditorId: "aud-a", role: "l1" };
      }
      return { valid: false, auditorId: null, role: null };
    });

    const result = await checkQuorum(makePkg(), makePolicy({ min_l1_signatures: 2 }));

    expect(result.satisfied).toBe(false);
    expect(result.l1Count).toBe(1);
    expect(result.errors.some((e) => e.includes("Quorum not met"))).toBe(true);
  });

  it("fails quorum when L2 is required but missing", async () => {
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex.startsWith("0xL1")) {
        return { valid: true, auditorId: `aud-${publicKeyHex}`, role: "l1" };
      }
      // L2 key is not found
      return { valid: false, auditorId: null, role: null };
    });

    const result = await checkQuorum(
      makePkg(),
      makePolicy({ min_l1_signatures: 1, require_l2_signature: true }),
    );

    expect(result.satisfied).toBe(false);
    expect(result.l2Present).toBe(false);
    expect(result.errors.some((e) => e.includes("L2 auditor"))).toBe(true);
  });

  it("passes when L2 is not required and L1 quorum met", async () => {
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex.startsWith("0xL1")) {
        return { valid: true, auditorId: `aud-${publicKeyHex}`, role: "l1" };
      }
      return { valid: false, auditorId: null, role: null };
    });

    const result = await checkQuorum(
      makePkg(),
      makePolicy({ min_l1_signatures: 1, require_l2_signature: false }),
    );

    expect(result.satisfied).toBe(true);
    expect(result.l2Required).toBe(false);
  });

  it("rejects duplicate L1 signatures from the same auditor", async () => {
    // Two L1 sigs from the same auditor
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex === "0xL2") {
        return { valid: true, auditorId: "aud-l2", role: "l2" };
      }
      // All L1 keys map to the same auditor
      return { valid: true, auditorId: "aud-same", role: "l1" };
    });

    const result = await checkQuorum(makePkg(), makePolicy({ min_l1_signatures: 2 }));

    expect(result.satisfied).toBe(false);
    expect(result.l1Count).toBe(1); // only 1 unique
    expect(result.l1DistinctAuditors).toEqual(["aud-same"]);
    expect(result.errors.some((e) => e.includes("Duplicate"))).toBe(true);
  });

  it("rejects L1 key that belongs to an L2 auditor", async () => {
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex === "0xL2") {
        return { valid: true, auditorId: "aud-l2", role: "l2" };
      }
      // L1 keys are actually L2 role
      return { valid: true, auditorId: `aud-${publicKeyHex}`, role: "l2" };
    });

    const result = await checkQuorum(makePkg(), makePolicy({ min_l1_signatures: 1 }));

    expect(result.satisfied).toBe(false);
    expect(result.errors.some((e) => e.includes("not L1"))).toBe(true);
  });

  it("handles zero L1 requirement (only L2 needed)", async () => {
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex === "0xL2") {
        return { valid: true, auditorId: "aud-l2", role: "l2" };
      }
      return { valid: false, auditorId: null, role: null };
    });

    const result = await checkQuorum(
      makePkg({ signatures: {
        platform: { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xp", signatureHex: "0xps" },
        l1Auditors: [],
        l2Auditor: { algorithm: "ECDSA-secp256k1", publicKeyHex: "0xL2", signatureHex: "0xL2sig" },
      }}),
      makePolicy({ min_l1_signatures: 0, require_l2_signature: true }),
    );

    expect(result.satisfied).toBe(true);
    expect(result.l1Count).toBe(0);
    expect(result.l2Present).toBe(true);
  });

  it("reports expired L1 key at issuance time", async () => {
    mockWasKeyActiveAt.mockImplementation(async (publicKeyHex: string) => {
      if (publicKeyHex === "0xL2") {
        return { valid: true, auditorId: "aud-l2", role: "l2" };
      }
      // L1 keys were expired at issuance
      return { valid: false, auditorId: null, role: null };
    });

    const result = await checkQuorum(makePkg(), makePolicy({ min_l1_signatures: 1 }));

    expect(result.satisfied).toBe(false);
    expect(result.errors.some((e) => e.includes("not active at issuance"))).toBe(true);
  });
});
