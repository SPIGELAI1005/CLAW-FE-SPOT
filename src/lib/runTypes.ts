import { z } from "zod";

export const RunStatusSchema = z.enum([
  "queued",
  "running",
  "needs_review",
  "fix_required",
  "done",
  "canceled",
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunSchema = z.object({
  id: z.string().min(1),
  tableId: z.string().min(1),
  status: RunStatusSchema.default("queued"),
  title: z.string().min(1),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Run = z.infer<typeof RunSchema>;
