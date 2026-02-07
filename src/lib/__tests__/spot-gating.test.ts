import { describe, it, expect } from "vitest";
import {
  checkExecuteGating,
  checkCertificationGating,
  checkToolExecution,
} from "../spotGating";
import type { Spot, SpotParticipant } from "../spotTypes";

function makeSpot(overrides: Partial<Spot> = {}): Spot {
  return {
    id: "1",
    title: "Test SPOT",
    goal: "Test goal",
    mode: "discuss",
    status: "active",
    certificationStatus: "uncertified",
    contract: {
      scope: "Test scope",
      allowedTools: ["web_search"],
      allowedData: ["test_data"],
      acceptanceCriteria: ["Criterion 1"],
      terminationConditions: "Budget exhausted",
      signedAt: new Date().toISOString(),
      signedBy: "user-1",
    },
    ...overrides,
  };
}

const participants: SpotParticipant[] = [
  { id: "p1", spotId: "1", userId: "u1", role: "owner", displayName: "George" },
  { id: "p2", spotId: "1", agentId: "a1", role: "worker", displayName: "Worker AI" },
  { id: "p3", spotId: "1", agentId: "a2", role: "l1_auditor", displayName: "QualityGate AI" },
  { id: "p4", spotId: "1", agentId: "a3", role: "l2_meta_auditor", displayName: "MetaAuditor AI" },
];

describe("checkExecuteGating", () => {
  it("allows switch when all requirements met", () => {
    const spot = makeSpot();
    const result = checkExecuteGating(spot, participants);
    expect(result.canSwitch).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("blocks when SPOT is already in execute mode", () => {
    const spot = makeSpot({ mode: "execute" });
    const result = checkExecuteGating(spot, participants);
    expect(result.canSwitch).toBe(false);
    expect(result.reasons).toContain("SPOT is not in DISCUSS mode.");
  });

  it("blocks when contract scope is empty", () => {
    const spot = makeSpot({
      contract: {
        scope: "",
        allowedTools: ["web_search"],
        allowedData: [],
        acceptanceCriteria: ["C1"],
        terminationConditions: "",
        signedAt: new Date().toISOString(),
        signedBy: "user-1",
      },
    });
    const result = checkExecuteGating(spot, participants);
    expect(result.canSwitch).toBe(false);
    expect(result.reasons).toContain("Contract scope must be defined.");
  });

  it("blocks when no acceptance criteria", () => {
    const spot = makeSpot({
      contract: {
        scope: "Scope",
        allowedTools: ["web_search"],
        allowedData: [],
        acceptanceCriteria: [],
        terminationConditions: "",
        signedAt: new Date().toISOString(),
        signedBy: "user-1",
      },
    });
    const result = checkExecuteGating(spot, participants);
    expect(result.canSwitch).toBe(false);
    expect(result.reasons).toContain(
      "At least one acceptance criterion is required.",
    );
  });

  it("blocks when no L1 auditor assigned", () => {
    const spot = makeSpot();
    const noL1 = participants.filter((p) => p.role !== "l1_auditor");
    const result = checkExecuteGating(spot, noL1);
    expect(result.canSwitch).toBe(false);
    expect(result.reasons).toContain("An L1 Auditor must be assigned.");
  });

  it("blocks when no allowed tools", () => {
    const spot = makeSpot({
      contract: {
        scope: "Scope",
        allowedTools: [],
        allowedData: [],
        acceptanceCriteria: ["C1"],
        terminationConditions: "",
        signedAt: new Date().toISOString(),
        signedBy: "user-1",
      },
    });
    const result = checkExecuteGating(spot, participants);
    expect(result.canSwitch).toBe(false);
    expect(result.reasons).toContain("Allowed tools must be specified.");
  });

  it("blocks when contract is not signed", () => {
    const spot = makeSpot({
      contract: {
        scope: "Scope",
        allowedTools: ["web_search"],
        allowedData: ["data"],
        acceptanceCriteria: ["C1"],
        terminationConditions: "",
        signedAt: null,
        signedBy: null,
      },
    });
    const result = checkExecuteGating(spot, participants);
    expect(result.canSwitch).toBe(false);
    expect(result.reasons).toContain("Contract must be signed before switching to EXECUTE.");
  });
});

describe("checkCertificationGating", () => {
  it("allows certification when all requirements met", () => {
    const spot = makeSpot({ mode: "execute" });
    const result = checkCertificationGating(spot, participants);
    expect(result.canRequestCertification).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("blocks when not in execute mode", () => {
    const spot = makeSpot({ mode: "discuss" });
    const result = checkCertificationGating(spot, participants);
    expect(result.canRequestCertification).toBe(false);
    expect(result.reasons).toContain("SPOT must be in EXECUTE mode.");
  });

  it("blocks when already certified", () => {
    const spot = makeSpot({
      mode: "execute",
      certificationStatus: "certified",
    });
    const result = checkCertificationGating(spot, participants);
    expect(result.canRequestCertification).toBe(false);
  });

  it("blocks when no L2 meta-auditor", () => {
    const spot = makeSpot({ mode: "execute" });
    const noL2 = participants.filter((p) => p.role !== "l2_meta_auditor");
    const result = checkCertificationGating(spot, noL2);
    expect(result.canRequestCertification).toBe(false);
    expect(result.reasons).toContain(
      "An L2 Meta-Auditor must be assigned.",
    );
  });
});

describe("checkToolExecution", () => {
  it("allows tool in execute mode + allowed list", () => {
    const spot = makeSpot({ mode: "execute" });
    const result = checkToolExecution(spot, "web_search");
    expect(result.allowed).toBe(true);
  });

  it("blocks tool not in allowed list", () => {
    const spot = makeSpot({ mode: "execute" });
    const result = checkToolExecution(spot, "delete_database");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not in the allowed tools list");
  });

  it("blocks any tool in discuss mode", () => {
    const spot = makeSpot({ mode: "discuss" });
    const result = checkToolExecution(spot, "web_search");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("only allowed in EXECUTE mode");
  });
});
