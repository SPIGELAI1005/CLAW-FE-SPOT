import { describe, it, expect } from "vitest";
import {
  mapDbSpot,
  mapDbParticipant,
  mapDbAgent,
  mapDbInboxItem,
  mapDbMessage,
} from "../useFetch";

describe("mapDbSpot", () => {
  it("maps snake_case to camelCase", () => {
    const row = {
      id: "abc",
      title: "Test SPOT",
      goal: "Test goal",
      mode: "execute",
      status: "active",
      certification_status: "certified",
      contract: {
        scope: "Test scope",
        allowed_tools: ["web_search"],
        allowed_data: ["test_db"],
        acceptance_criteria: ["Criterion 1"],
        termination_conditions: "Budget exhausted",
        signed_at: "2026-01-01T00:00:00Z",
      },
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-02-01T00:00:00Z",
    };

    const spot = mapDbSpot(row);
    expect(spot.id).toBe("abc");
    expect(spot.certificationStatus).toBe("certified");
    expect(spot.contract.allowedTools).toEqual(["web_search"]);
    expect(spot.contract.allowedData).toEqual(["test_db"]);
    expect(spot.contract.acceptanceCriteria).toEqual(["Criterion 1"]);
    expect(spot.contract.signedAt).toBe("2026-01-01T00:00:00Z");
    expect(spot.createdAt).toBe("2026-01-01T00:00:00Z");
  });

  it("handles missing contract", () => {
    const row = {
      id: "abc",
      title: "Test",
      goal: "Goal",
      mode: "discuss",
      status: "draft",
    };

    const spot = mapDbSpot(row);
    expect(spot.contract.scope).toBe("");
    expect(spot.contract.allowedTools).toEqual([]);
    expect(spot.certificationStatus).toBe("uncertified");
  });
});

describe("mapDbParticipant", () => {
  it("maps snake_case fields", () => {
    const row = {
      id: "p1",
      spot_id: "s1",
      user_id: "u1",
      role: "owner",
      display_name: "George",
    };

    const p = mapDbParticipant(row);
    expect(p.spotId).toBe("s1");
    expect(p.userId).toBe("u1");
    expect(p.displayName).toBe("George");
  });
});

describe("mapDbAgent", () => {
  it("maps agent fields", () => {
    const row = {
      id: "a1",
      name: "ContentWriter",
      type: "worker",
      description: "Writes content",
      skills: ["copywriting"],
      tools: ["text_gen"],
      trust_level: 85,
      certified_outcomes: 12,
    };

    const agent = mapDbAgent(row);
    expect(agent.trustLevel).toBe(85);
    expect(agent.certifiedOutcomes).toBe(12);
    expect(agent.skills).toEqual(["copywriting"]);
  });

  it("handles missing fields", () => {
    const row = { id: "a1" };
    const agent = mapDbAgent(row);
    expect(agent.name).toBe("");
    expect(agent.trustLevel).toBe(0);
    expect(agent.skills).toEqual([]);
  });
});

describe("mapDbInboxItem", () => {
  it("maps inbox item fields", () => {
    const row = {
      id: "i1",
      type: "spot_invite",
      spot_id: "s1",
      title: "Invitation",
      description: "Join the SPOT",
      status: "pending",
      created_at: "2026-02-01T00:00:00Z",
    };

    const item = mapDbInboxItem(row);
    expect(item.spotId).toBe("s1");
    expect(item.createdAt).toBe("2026-02-01T00:00:00Z");
  });
});

describe("mapDbMessage", () => {
  it("maps message fields", () => {
    const row = {
      id: "m1",
      spot_id: "s1",
      type: "human",
      sender_name: "George",
      content: "Hello",
      created_at: "2026-02-01T00:00:00Z",
    };

    const msg = mapDbMessage(row);
    expect(msg.spotId).toBe("s1");
    expect(msg.senderName).toBe("George");
    expect(msg.content).toBe("Hello");
  });
});
