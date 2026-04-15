import { z } from "zod";

export const emailSchema = z.email().transform((value) => value.trim().toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[a-z]/i, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
