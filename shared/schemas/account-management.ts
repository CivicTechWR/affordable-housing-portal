import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const accountIdSchema = z.uuid("Invalid account id.");
const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const accountRoleSchema = z.enum(["admin", "partner", "user"]);
export const accountStatusSchema = z.enum(["invited", "active", "suspended", "deactivated"]);
const updateAccountFieldsSchema = z.object({
  name: nonEmptyString.optional(),
  role: accountRoleSchema.optional(),
  status: accountStatusSchema.optional(),
  organization: z.string().trim().nullable().optional(),
});

export const accountParamsSchema = z.object({
  id: accountIdSchema,
});

export const accountsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  role: accountRoleSchema.optional(),
  status: accountStatusSchema.optional(),
  search: nonEmptyString.optional(),
});

export const createAccountInviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address.")),
  name: nonEmptyString,
  role: accountRoleSchema,
  sendInviteEmail: z.boolean().optional(),
});

export const updateAccountSchema = z
  .object(updateAccountFieldsSchema.shape)
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export const accountsListResponseSchema = z.object({
  data: z.array(z.unknown()),
  pagination: paginationSchema,
});

export const accountByIdResponseSchema = z.object({
  data: z.object({
    id: accountIdSchema,
    email: z.email().nullable(),
    name: z.string().nullable(),
    role: accountRoleSchema.nullable(),
    organization: z.string().nullable(),
    status: accountStatusSchema.nullable(),
    listingsCount: z.number().int().min(0),
    lastLoginAt: z.string().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
  }),
});

export const createAccountResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: accountIdSchema,
    email: z.email(),
    name: nonEmptyString,
    role: accountRoleSchema,
    inviteUrl: z.url(),
  }),
});

export const updateAccountResponseSchema = z.object({
  message: z.string(),
  data: z.object({ id: accountIdSchema }).and(updateAccountFieldsSchema),
});

export const deactivateAccountResponseSchema = z.object({
  message: z.string(),
  data: z.object({ id: accountIdSchema }),
});

export type AccountParams = z.infer<typeof accountParamsSchema>;
export type AccountsQuery = z.infer<typeof accountsQuerySchema>;
export type CreateAccountInviteInput = z.infer<typeof createAccountInviteSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
