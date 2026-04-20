import { z } from "zod";

export const errorMessageSchema = z.object({
  message: z.string(),
});
