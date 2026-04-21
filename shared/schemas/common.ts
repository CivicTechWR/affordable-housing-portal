import { z } from "zod";

export const errorMessageSchema = z.object({
  message: z.string(),
});

export const positiveIntegerQueryParamSchema = z.string().regex(/^[1-9]\d*$/);

export function positiveIntegerQueryParamWithMaxSchema(max: number) {
  return positiveIntegerQueryParamSchema.refine((value) => Number(value) <= max, {
    message: `Must be less than or equal to ${max}.`,
  });
}
