import { describe, it, expect } from "vitest";
import {
  CreateSpotBody,
  PatchSpotBody,
  CreateMessageBody,
  AddParticipantBody,
  CreateAgentBody,
  PatchInboxItemBody,
  CreateL1VerdictBody,
  CreateL2ReportBody,
  UpdateProfileBody,
  parseBody,
} from "../validations";

// ── CreateSpotBody ──────────────────────────────────────────────────
describe("CreateSpotBody", () => {
  it("accepts valid input", () => {
    const result = CreateSpotBody.safeParse({
      title: "Write 20 posts",
      goal: "Generate launch content",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe("discuss");
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

  it("rejects empty title", () => {
    const result = CreateSpotBody.safeParse({ title: "", goal: "G" });
    expect(result.success).toBe(false);
  });
});

// ── PatchSpotBody ───────────────────────────────────────────────────
describe("PatchSpotBody", () => {
  it("accepts partial update", () => {
    const result = PatchSpotBody.safeParse({ title: "New" });
    expect(result.success).toBe(true);
  });

  it("accepts certification status", () => {
    const result = PatchSpotBody.safeParse({ certification_status: "certified" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid certification status", () => {
    const result = PatchSpotBody.safeParse({ certification_status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts contract update", () => {
    const result = PatchSpotBody.safeParse({
      contract: { scope: "Content creation", allowed_tools: ["web_search"] },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty body", () => {
    const result = PatchSpotBody.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ── CreateMessageBody ───────────────────────────────────────────────
describe("CreateMessageBody", () => {
  it("accepts valid message", () => {
    const result = CreateMessageBody.safeParse({ content: "Hello" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("human");
    }
  });

  it("rejects empty content", () => {
    const result = CreateMessageBody.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });
});

// ── AddParticipantBody ──────────────────────────────────────────────
describe("AddParticipantBody", () => {
  it("accepts valid participant", () => {
    const result = AddParticipantBody.safeParse({
      role: "worker",
      display_name: "Worker AI",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = AddParticipantBody.safeParse({
      role: "boss",
      display_name: "Test",
    });
    expect(result.success).toBe(false);
  });
});

// ── CreateAgentBody ─────────────────────────────────────────────────
describe("CreateAgentBody", () => {
  it("accepts valid agent", () => {
    const result = CreateAgentBody.safeParse({
      name: "ContentWriter",
      type: "worker",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual([]);
      expect(result.data.tools).toEqual([]);
    }
  });

  it("rejects missing name", () => {
    const result = CreateAgentBody.safeParse({ type: "worker" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = CreateAgentBody.safeParse({ name: "Test", type: "boss" });
    expect(result.success).toBe(false);
  });
});

// ── PatchInboxItemBody ──────────────────────────────────────────────
describe("PatchInboxItemBody", () => {
  it("accepts valid status", () => {
    const result = PatchInboxItemBody.safeParse({ status: "accepted" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = PatchInboxItemBody.safeParse({ status: "pending" });
    expect(result.success).toBe(false);
  });
});

// ── CreateL1VerdictBody ─────────────────────────────────────────────
describe("CreateL1VerdictBody", () => {
  it("accepts approve verdict", () => {
    const result = CreateL1VerdictBody.safeParse({
      action_id: "action-1",
      verdict: "approve",
      rationale: "Looks safe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing rationale", () => {
    const result = CreateL1VerdictBody.safeParse({
      action_id: "action-1",
      verdict: "approve",
      rationale: "",
    });
    expect(result.success).toBe(false);
  });
});

// ── CreateL2ReportBody ──────────────────────────────────────────────
describe("CreateL2ReportBody", () => {
  it("accepts pass verdict", () => {
    const result = CreateL2ReportBody.safeParse({
      verdict: "pass",
      report: "All checks passed.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid verdict", () => {
    const result = CreateL2ReportBody.safeParse({
      verdict: "invalid",
      report: "Test",
    });
    expect(result.success).toBe(false);
  });
});

// ── UpdateProfileBody ───────────────────────────────────────────────
describe("UpdateProfileBody", () => {
  it("accepts display name", () => {
    const result = UpdateProfileBody.safeParse({ display_name: "George" });
    expect(result.success).toBe(true);
  });

  it("accepts empty body", () => {
    const result = UpdateProfileBody.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ── parseBody helper ────────────────────────────────────────────────
describe("parseBody", () => {
  it("returns error for invalid JSON", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: "not json",
    });
    const result = await parseBody(request, CreateSpotBody);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid JSON body");
    expect(result.data).toBeNull();
  });

  it("returns validation error for invalid body", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    const result = await parseBody(request, CreateSpotBody);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
  });

  it("returns data for valid body", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "T", goal: "G" }),
    });
    const result = await parseBody(request, CreateSpotBody);
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    if (result.success) {
      expect(result.data.title).toBe("T");
    }
  });
});
