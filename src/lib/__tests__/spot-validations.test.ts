import { describe, it, expect } from "vitest";
import { CreateSpotBody, PatchSpotBody } from "../validations";

describe("CreateSpotBody", () => {
  it("accepts valid input", () => {
    const result = CreateSpotBody.safeParse({
      title: "Write 20 posts",
      goal: "Generate launch content",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("discuss"); // default
    }
  });

  it("accepts explicit mode", () => {
    const result = CreateSpotBody.safeParse({
      title: "Audit",
      goal: "Security review",
      mode: "execute",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("execute");
    }
  });

  it("rejects missing title", () => {
    const result = CreateSpotBody.safeParse({ goal: "Something" });
    expect(result.success).toBe(false);
  });

  it("rejects missing goal", () => {
    const result = CreateSpotBody.safeParse({ title: "Something" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid mode", () => {
    const result = CreateSpotBody.safeParse({
      title: "T",
      goal: "G",
      mode: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title string", () => {
    const result = CreateSpotBody.safeParse({ title: "", goal: "G" });
    expect(result.success).toBe(false);
  });
});

describe("PatchSpotBody", () => {
  it("accepts partial update with title only", () => {
    const result = PatchSpotBody.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  it("accepts certification status", () => {
    const result = PatchSpotBody.safeParse({
      certification_status: "certified",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid certification status", () => {
    const result = PatchSpotBody.safeParse({
      certification_status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts contract update", () => {
    const result = PatchSpotBody.safeParse({
      contract: {
        scope: "Content creation",
        allowed_tools: ["web_search"],
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty body", () => {
    const result = PatchSpotBody.safeParse({});
    expect(result.success).toBe(true);
  });
});
