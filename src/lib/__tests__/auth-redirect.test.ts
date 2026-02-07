import { describe, it, expect } from "vitest";

/**
 * Test the safe redirect logic used in auth/callback/route.ts.
 * We extract the logic here to test it in isolation without needing
 * to spin up the full Next.js server.
 */
function safeRedirectPath(raw: string | null): string {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  try {
    const parsed = new URL(raw, "http://localhost");
    if (parsed.host !== "localhost") return fallback;
  } catch {
    return fallback;
  }
  return raw;
}

describe("safeRedirectPath (open redirect prevention)", () => {
  it("returns /dashboard for null input", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
  });

  it("returns /dashboard for empty string", () => {
    expect(safeRedirectPath("")).toBe("/dashboard");
  });

  it("accepts valid relative path /spots", () => {
    expect(safeRedirectPath("/spots")).toBe("/spots");
  });

  it("accepts valid deep path /spots/abc", () => {
    expect(safeRedirectPath("/spots/abc")).toBe("/spots/abc");
  });

  it("rejects absolute URL https://evil.com", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
  });

  it("rejects protocol-relative URL //evil.com/path", () => {
    expect(safeRedirectPath("//evil.com/path")).toBe("/dashboard");
  });

  it("rejects javascript: protocol", () => {
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("rejects relative URL without leading slash", () => {
    expect(safeRedirectPath("spots")).toBe("/dashboard");
  });

  it("accepts /vault path", () => {
    expect(safeRedirectPath("/vault")).toBe("/vault");
  });

  it("rejects URL with encoded characters that resolve to different host", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
  });
});
