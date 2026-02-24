import { z } from "zod/v4";

export const createArticleSchema = z.object({
  Title: z
    .string({ error: "Title is required" })
    .min(1, "Title must be at least 1 character")
    .max(150, "Title must not exceed 150 characters"),

  Content: z
    .string({ error: "Content is required" })
    .min(50, "Content must be at least 50 characters"),

  Category: z
    .string({ error: "Category is required" })
    .min(1, "Category is required"),

  Status: z
    .enum(["Draft", "Published"], {
      error: "Status must be either 'Draft' or 'Published'",
    })
    .optional()
    .default("Draft"),
});

export const updateArticleSchema = z.object({
  Title: z
    .string()
    .min(1, "Title must be at least 1 character")
    .max(150, "Title must not exceed 150 characters")
    .optional(),

  Content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .optional(),

  Category: z
    .string()
    .min(1, "Category is required")
    .optional(),

  Status: z
    .enum(["Draft", "Published"], {
      error: "Status must be either 'Draft' or 'Published'",
    })
    .optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
