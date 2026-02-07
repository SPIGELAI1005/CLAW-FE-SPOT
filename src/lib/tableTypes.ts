import { z } from "zod";

export const TableStatusSchema = z.enum([
  "draft",
  "running",
  "needs_review",
  "fix_required",
  "done",
  "archived",
]);
export type TableStatus = z.infer<typeof TableStatusSchema>;

export const TableTaskSchema = z.object({
  id: z.string().min(1),
  tableId: z.string().min(1),
  title: z.string().min(1),
  done: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});
export type TableTask = z.infer<typeof TableTaskSchema>;

export const TableSchema = z.object({
  id: z.string().min(1),
  status: TableStatusSchema.default("draft"),
  title: z.string().min(1),
  goal: z.string().min(1),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  constraints: z.array(z.string().min(1)).default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Table = z.infer<typeof TableSchema>;

export const ArtifactTypeSchema = z.enum([
  "text",
  "markdown",
  "file",
  "link",
  "image",
]);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

export const ArtifactSchema = z.object({
  id: z.string().min(1),
  tableId: z.string().min(1),
  runId: z.string().min(1).optional(),
  type: ArtifactTypeSchema,
  title: z.string().min(1),
  uri: z.string().min(1).optional(),
  content: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});
export type Artifact = z.infer<typeof ArtifactSchema>;
