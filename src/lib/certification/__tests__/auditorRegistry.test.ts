import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeKeyFingerprint } from "../auditorRegistry";
import { hashData } from "../canonicalize";

// ── Unit tests for pure functions (no DB dependency) ────────────────
// The registry functions that hit Supabase are tested via integration tests
// or mocked. Here we test the pure cryptographic functions.

describe("computeKeyFingerprint", () => {
  it("returns a SHA-256 hex string", async () => {
    const publicKey = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const fingerprint = await computeKeyFingerprint(publicKey);

    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is case-insensitive (lowercases before hashing)", async () => {
    const upper = "0xF39FD6E51AAD88F6F4CE6AB8827279CFFFB92266";
    const lower = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    const fp1 = await computeKeyFingerprint(upper);
    const fp2 = await computeKeyFingerprint(lower);

    expect(fp1).toBe(fp2);
  });

  it("produces different fingerprints for different keys", async () => {
    const key1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const key2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const fp1 = await computeKeyFingerprint(key1);
    const fp2 = await computeKeyFingerprint(key2);

    expect(fp1).not.toBe(fp2);
  });

  it("matches hashData of the lowercased key", async () => {
    const publicKey = "0xABCdef1234567890abcdef1234567890ABCDEF12";
    const fingerprint = await computeKeyFingerprint(publicKey);
    const expected = await hashData(publicKey.toLowerCase());

    expect(fingerprint).toBe(expected);
  });
});

// ── Mock-based tests for DB-dependent functions ────────────────────

// Mock the Supabase client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = vi.fn((): any => ({}));

vi.mock("@/lib/supabaseServer", () => ({
  createSupabaseServerClient: async () => ({
    from: mockFrom,
  }),
}));

// Import after mocks
const {
  findAuditorById,
  getActiveKey,
  getKeyHistory,
  rotateKey,
  revokeKey,
} = await import("../auditorRegistry");

describe("findAuditorById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an auditor row when found", async () => {
    const mockAuditor = {
      id: "aud-1",
      display_alias: "Auditor One",
      role: "l1",
      status: "active",
    };

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockAuditor }),
        }),
      }),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await findAuditorById("aud-1");
    expect(result).toEqual(mockAuditor);
  });

  it("returns null when not found", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await findAuditorById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("getActiveKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the active key for an auditor", async () => {
    const mockKey = {
      id: "key-1",
      auditor_id: "aud-1",
      public_key_hex: "0xabc",
      key_fingerprint: "abc123",
      status: "active",
    };

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockKey }),
                }),
              }),
            }),
          }),
        }),
      }),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await getActiveKey("aud-1");
    expect(result).toEqual(mockKey);
  });
});

describe("getKeyHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all keys ordered by validity", async () => {
    const mockKeys = [
      { id: "key-2", status: "active", valid_from: "2026-02-01" },
      { id: "key-1", status: "revoked", valid_from: "2025-01-01", valid_until: "2026-02-01" },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockKeys }),
        }),
      }),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await getKeyHistory("aud-1");
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("key-2");
  });
});

describe("revokeKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true on success", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await revokeKey("key-1", "compromised");
    expect(result).toBe(true);
  });

  it("returns false on error", async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
      }),
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await revokeKey("key-1", "compromised");
    expect(result).toBe(false);
  });
});

describe("rotateKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("closes old key and creates new one", async () => {
    const newKeyRow = {
      id: "key-new",
      auditor_id: "aud-1",
      public_key_hex: "0xnewkey",
      status: "active",
    };

    // First call: update (close old key)
    // Second call: insert (new key)
    let callCount = 0;
    mockFrom.mockImplementation((): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
      callCount++;
      if (callCount === 1) {
        // update call for closing old key
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          }),
        };
      }
      // insert call for new key
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: newKeyRow }),
          }),
        }),
      };
    });

    const result = await rotateKey("aud-1", "0xnewkey", "scheduled rotation");
    expect(result).toEqual(newKeyRow);
  });
});
