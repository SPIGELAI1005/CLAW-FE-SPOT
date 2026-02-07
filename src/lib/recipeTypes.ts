import { z } from "zod";

export const RecipeTemplateSchema = z.object({
  tableTitle: z.string().min(1),
  goal: z.string().min(1),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  constraints: z.array(z.string().min(1)).default([]),
});
export type RecipeTemplate = z.infer<typeof RecipeTemplateSchema>;

export const RecipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const RecipeVersionSchema = z.object({
  id: z.string().min(1),
  recipeId: z.string().min(1),
  version: z.number().int().min(1),
  template: RecipeTemplateSchema,
  createdAt: z.string().datetime().optional(),
});
export type RecipeVersion = z.infer<typeof RecipeVersionSchema>;
