// ── Table ────────────────────────────────────────────────────────────
export interface Table {
  x: number;
  y: number;
  radius: number;
  /** Numeric hue (0–360) for HSL-based coloring */
  hue: number;
  counterTarget: number;
  counterDisplay: number;
  nextIncrement: number;
}

// ── Crab Variety ─────────────────────────────────────────────────────
export type CrabHat = "none" | "tophat" | "chef" | "hardhat" | "crown";
export type CrabExpression = "normal" | "happy" | "sleepy" | "surprised";
export type CrabEyewear = "none" | "glasses" | "monocle";

/** Weighted pool — ~43% none, ~14% each accessory */
export const CRAB_HATS: CrabHat[] = [
  "none", "none", "tophat", "chef", "hardhat", "crown", "none",
];

/** Weighted pool — 40% normal, 20% each other */
export const CRAB_EXPRESSIONS: CrabExpression[] = [
  "normal", "normal", "happy", "sleepy", "surprised",
];

/** Weighted pool — ~67% none, ~17% each */
export const CRAB_EYEWEAR: CrabEyewear[] = [
  "none", "none", "none", "none", "glasses", "monocle",
];

// ── Agent ────────────────────────────────────────────────────────────
export interface Agent {
  type: "crab" | "person";
  color: string;
  tableIndex: number;
  angle: number;
  orbitSpeed: number;
  orbitRadius: number;
  migrating: boolean;
  migrateFrom: { x: number; y: number };
  migrateTo: { x: number; y: number };
  migrateProgress: number;
  migrateDuration: number;
  targetTableIndex: number;
  screenX: number;
  screenY: number;
  /** Crab-only: random size multiplier (0.7–1.3) */
  sizeMultiplier: number;
  /** Crab-only: hat type */
  hat: CrabHat;
  /** Crab-only: permanent baseline expression */
  baseExpression: CrabExpression;
  /** Crab-only: current active expression (can change dynamically via chat) */
  expression: CrabExpression;
  /** Crab-only: eyewear type */
  eyewear: CrabEyewear;
  /** Whether this agent is pinned (auditor crabs) and should never migrate */
  pinned?: boolean;
}

// ── Chat Bubble ──────────────────────────────────────────────────────
export interface ChatBubble {
  agentIndex: number;
  text: string;
  age: number;
  maxAge: number;
}

// ── Audit Verdict ────────────────────────────────────────────────────
export interface AuditVerdict {
  text: string;
  icon: "check" | "warning" | "policy";
  age: number;
  maxAge: number;
  x: number;
  floatY: number;
}

// ── Color Palettes ───────────────────────────────────────────────────
export const CRAB_COLORS = [
  "hsla(10, 65%, 45%, 0.9)",
  "hsla(18, 70%, 42%, 0.9)",
  "hsla(25, 60%, 40%, 0.9)",
  "hsla(5, 55%, 48%, 0.9)",
  "hsla(15, 68%, 38%, 0.9)",
  "hsla(30, 55%, 44%, 0.9)",
];

export const PERSON_COLORS = [
  "hsla(210, 30%, 50%, 0.85)",
  "hsla(280, 25%, 55%, 0.85)",
  "hsla(45, 35%, 48%, 0.85)",
  "hsla(160, 28%, 45%, 0.85)",
  "hsla(350, 30%, 52%, 0.85)",
  "hsla(30, 35%, 50%, 0.85)",
  "hsla(190, 25%, 48%, 0.85)",
  "hsla(100, 22%, 45%, 0.85)",
];

/** Numeric hue values: brown, blue, green, rose, amber, purple, orange, teal, lime */
export const TABLE_HUES: number[] = [28, 200, 150, 340, 45, 270, 15, 180, 100];

// ── Chat Messages (spec: 20 specific messages) ──────────────────────
export const CHAT_MESSAGES = [
  "Let's review this",
  "LGTM 👍",
  "Need more data",
  "Approved!",
  "Check row 4",
  "Interesting…",
  "On it!",
  "What if we…",
  "Agreed",
  "Running audit",
  "Looks good",
  "Hmm 🤔",
  "Next item?",
  "Done ✓",
  "Flagged",
  "Let me check",
  "Updated!",
  "Consensus?",
  "Ready",
  "Noted 📝",
];

// ── Chat Expression Map ──────────────────────────────────────────────
/** Maps specific chat messages to the expression the crab should show */
export const CHAT_EXPRESSION_MAP: Record<string, CrabExpression> = {
  "LGTM 👍": "happy",
  "Approved!": "happy",
  "Looks good": "happy",
  "Done ✓": "happy",
  "Agreed": "happy",
  "Ready": "happy",
  "On it!": "happy",
  "Hmm 🤔": "surprised",
  "Interesting…": "surprised",
  "What if we…": "surprised",
  "Flagged": "surprised",
  "Need more data": "sleepy",
};

// ── Audit Verdicts ───────────────────────────────────────────────────
export const AUDIT_VERDICTS: Array<{ text: string; icon: "check" | "warning" | "policy" }> = [
  { text: "Validated ✓", icon: "check" },
  { text: "Approved", icon: "check" },
  { text: "All clear", icon: "check" },
  { text: "Compliant", icon: "check" },
  { text: "Audit complete", icon: "check" },
  { text: "Issue identified", icon: "warning" },
  { text: "Further review needed", icon: "warning" },
  { text: "Flagged for review", icon: "warning" },
  { text: "Requires attention", icon: "warning" },
  { text: "Write policy", icon: "policy" },
  { text: "Update policy", icon: "policy" },
  { text: "New guideline", icon: "policy" },
];
