import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const adminAccountRoleSchema = z.enum(["admin", "partner", "user"]);
export const adminAccountStatusSchema = z.enum(["invited", "active", "suspended", "deactivated"]);

export const adminAccountParamsSchema = z.object({
  id: z.uuid("Invalid account id."),
});

export const adminAccountsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  role: adminAccountRoleSchema.optional(),
  status: adminAccountStatusSchema.optional(),
  search: nonEmptyString.optional(),
});

export const createAdminAccountInviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address.")),
  name: nonEmptyString,
  role: adminAccountRoleSchema,
  sendInviteEmail: z.boolean().optional(),
});

export const updateAdminAccountSchema = z
  .object({
    name: nonEmptyString.optional(),
    role: adminAccountRoleSchema.optional(),
    status: adminAccountStatusSchema.optional(),
    organization: z.string().trim().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export type AdminAccountParams = z.infer<typeof adminAccountParamsSchema>;
export type AdminAccountsQuery = z.infer<typeof adminAccountsQuerySchema>;
export type CreateAdminAccountInviteInput = z.infer<typeof createAdminAccountInviteSchema>;
export type UpdateAdminAccountInput = z.infer<typeof updateAdminAccountSchema>;
