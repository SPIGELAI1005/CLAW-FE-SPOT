import { describe, it, expect } from "vitest";
import { canonicalizeJSON, sha256Hex, computeFingerprint } from "../canonicalize";

describe("canonicalizeJSON", () => {
  it("produces deterministic output regardless of key order", () => {
    const a = { z: 1, a: 2, m: 3 };
    const b = { a: 2, m: 3, z: 1 };
    expect(canonicalizeJSON(a)).toBe(canonicalizeJSON(b));
  });

  it("strips whitespace and produces compact JSON", () => {
    const obj = { hello: "world", num: 42 };
    const result = canonicalizeJSON(obj);
    expect(result).not.toContain("\n");
    expect(result).not.toContain("  ");
  });

  it("handles nested objects deterministically", () => {
    const obj = {
      b: { z: 1, a: 2 },
      a: { y: 3, x: 4 },
    };
    const result = canonicalizeJSON(obj);
    // Keys should be in sorted order: a before b, and nested keys too
    expect(result.indexOf('"a"')).toBeLessThan(result.indexOf('"b"'));
  });

  it("handles arrays (order preserved)", () => {
    const obj = { items: [3, 1, 2] };
    const result = canonicalizeJSON(obj);
    expect(result).toBe('{"items":[3,1,2]}');
  });

  it("handles null values", () => {
    const obj = { a: null, b: "hello" };
    const result = canonicalizeJSON(obj);
    expect(result).toContain("null");
  });
});

describe("sha256Hex", () => {
  it("produces a 64-char lowercase hex string", async () => {
    const result = await sha256Hex("hello");
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces known SHA-256 for 'hello'", async () => {
    const result = await sha256Hex("hello");
    // Known SHA-256 of "hello"
    expect(result).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  it("produces different hashes for different inputs", async () => {
    const a = await sha256Hex("hello");
    const b = await sha256Hex("world");
    expect(a).not.toBe(b);
  });

  it("produces the same hash for the same input", async () => {
    const a = await sha256Hex("deterministic");
    const b = await sha256Hex("deterministic");
    expect(a).toBe(b);
  });
});

describe("computeFingerprint", () => {
  it("excludes signatures and anchor from the fingerprint", async () => {
    const pkg = {
      version: "1.0.0",
      certificate: { id: "test" },
      signatures: { platform: "should-be-excluded" },
      anchor: { fingerprint: "should-be-excluded" },
    };

    const fingerprint = await computeFingerprint(pkg);
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);

    // Changing signatures should NOT change the fingerprint
    const pkg2 = {
      ...pkg,
      signatures: { platform: "different-sig" },
      anchor: { fingerprint: "different-anchor" },
    };
    const fingerprint2 = await computeFingerprint(pkg2);
    expect(fingerprint).toBe(fingerprint2);
  });

  it("produces different fingerprints for different core content", async () => {
    const pkg1 = { version: "1.0.0", certificate: { id: "a" } };
    const pkg2 = { version: "1.0.0", certificate: { id: "b" } };

    const fp1 = await computeFingerprint(pkg1);
    const fp2 = await computeFingerprint(pkg2);
    expect(fp1).not.toBe(fp2);
  });

  it("is deterministic", async () => {
    const pkg = {
      version: "1.0.0",
      type: "spot-certification",
      certificate: { id: "abc", spotId: "def" },
    };
    const fp1 = await computeFingerprint(pkg);
    const fp2 = await computeFingerprint(pkg);
    expect(fp1).toBe(fp2);
  });
});
