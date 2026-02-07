import type { Table, TableStatus, TableTask } from "./tableTypes";

export type MockTable = Table & { tasks: TableTask[] };

function isoNowMinus(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const mockTables: MockTable[] = [
  {
    id: "t-spot-001",
    status: "running",
    title: "Write 20 X posts for CLAW:FE SPOT launch",
    goal: "Generate 20 strong X posts + 20 reply magnets aligned to CLAW:FE SPOT positioning.",
    acceptanceCriteria: [
      "20 posts, <280 chars each (unless thread)",
      "No duplicate hooks",
      "Clear CTA",
      "Trust: mentions audit gate",
    ],
    constraints: ["Tone: practical, punchy", "No over-claiming"],
    createdAt: isoNowMinus(90),
    updatedAt: isoNowMinus(10),
    tasks: [
      {
        id: "task-1",
        tableId: "t-spot-001",
        title: "Draft 20 posts (v1)",
        done: true,
        createdAt: isoNowMinus(85),
      },
      {
        id: "task-2",
        tableId: "t-spot-001",
        title: "Generate 20 reply magnets",
        done: false,
        createdAt: isoNowMinus(70),
      },
      {
        id: "task-3",
        tableId: "t-spot-001",
        title: "Audit: duplicates + claim hygiene",
        done: false,
        createdAt: isoNowMinus(60),
      },
    ],
  },
  {
    id: "t-spot-002",
    status: "draft",
    title: "CLAW:FE SPOT — Supabase schema + RLS",
    goal: "Define initial schema for tables/tasks/artifacts + RLS policies.",
    acceptanceCriteria: [
      "RLS enabled",
      "Owner-only CRUD policies",
      "Updated_at trigger",
    ],
    constraints: ["Auth from day 1"],
    createdAt: isoNowMinus(220),
    updatedAt: isoNowMinus(200),
    tasks: [
      {
        id: "task-4",
        tableId: "t-spot-002",
        title: "Draft schema.sql",
        done: true,
        createdAt: isoNowMinus(215),
      },
      {
        id: "task-5",
        tableId: "t-spot-002",
        title: "Review policies for least privilege",
        done: false,
        createdAt: isoNowMinus(210),
      },
    ],
  },
  {
    id: "t-spot-003",
    status: "needs_review",
    title: "Homepage hero + icons polish",
    goal: "Create a premium iOS-inspired landing and PWA icons.",
    acceptanceCriteria: ["Hero image used", "Icons generated", "Build passes"],
    constraints: ["Keep it calm, Apple-ish"],
    createdAt: isoNowMinus(500),
    updatedAt: isoNowMinus(40),
    tasks: [
      {
        id: "task-6",
        tableId: "t-spot-003",
        title: "Integrate hero image",
        done: true,
        createdAt: isoNowMinus(480),
      },
      {
        id: "task-7",
        tableId: "t-spot-003",
        title: "Generate app icons",
        done: true,
        createdAt: isoNowMinus(470),
      },
      {
        id: "task-8",
        tableId: "t-spot-003",
        title: "Final UI review",
        done: false,
        createdAt: isoNowMinus(60),
      },
    ],
  },
];

export const allStatuses: Array<{ value: TableStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "running", label: "Running" },
  { value: "needs_review", label: "Needs review" },
  { value: "fix_required", label: "Fix required" },
  { value: "done", label: "Done" },
];
