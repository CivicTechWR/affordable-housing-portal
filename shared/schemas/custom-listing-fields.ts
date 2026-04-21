import { z } from "zod";

export const customListingFieldTypeSchema = z.enum([
  "boolean",
  "number",
  "text",
  "select",
  "multi_select",
  "date",
]);

export const customListingFieldQuerySchema = z.object({
  publicOnly: z.enum(["true", "false"]).optional(),
  filterableOnly: z.enum(["true", "false"]).optional(),
  category: z.string().trim().optional(),
  type: customListingFieldTypeSchema.optional(),
});

export const customListingFieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: customListingFieldTypeSchema,
  description: z.string().optional(),
  helpText: z.string().optional(),
});

export const customListingFieldGroupSchema = z.object({
  groupId: z.string(),
  groupLabel: z.string(),
  options: z.array(customListingFieldOptionSchema),
});

export const customListingFieldListResponseSchema = z.object({
  data: z.array(customListingFieldGroupSchema),
});

export type CustomListingFieldQuery = z.infer<typeof customListingFieldQuerySchema>;
export type CustomListingFieldType = z.infer<typeof customListingFieldTypeSchema>;
export type CustomListingFieldOption = z.infer<typeof customListingFieldOptionSchema>;
export type CustomListingFieldGroup = z.infer<typeof customListingFieldGroupSchema>;
export type CustomListingFieldListResponse = z.infer<typeof customListingFieldListResponseSchema>;
