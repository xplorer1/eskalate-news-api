import { z } from "zod/v4";

export const signupSchema = z.object({
  Name: z
    .string({ error: "Name is required" })
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s]+$/, "Name must contain only alphabets and spaces"),

  Email: z
    .string({ error: "Email is required" })
    .email("Email must be a valid email address"),

  Password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),

  Role: z.enum(["author", "reader"], {
    error: "Role must be either 'author' or 'reader'",
  }),
});

export const loginSchema = z.object({
  Email: z
    .string({ error: "Email is required" })
    .email("Email must be a valid email address"),

  Password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
