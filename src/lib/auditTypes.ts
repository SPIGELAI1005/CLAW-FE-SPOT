import { z } from "zod";

export const AuditSeveritySchema = z.enum(["info", "warning", "error"]);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

export const AuditIssueSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  severity: AuditSeveritySchema.default("error"),
  details: z.string().optional(),
  fix: z.string().optional(),
});
export type AuditIssue = z.infer<typeof AuditIssueSchema>;

export const AuditReportSchema = z.object({
  id: z.string().min(1),
  tableId: z.string().min(1),
  runId: z.string().min(1),
  passed: z.boolean(),
  summary: z.string().optional(),
  issues: z.array(AuditIssueSchema).default([]),
  createdAt: z.string().datetime().optional(),
});
export type AuditReport = z.infer<typeof AuditReportSchema>;
