import { z } from "zod";

export const requiredTrimmedString = (message = "This field is required") =>
  z.string().trim().min(1, message);

export const optionalTrimmedString = (message = "This field is required") =>
  z.string().trim().min(1, message).optional();

export const optionalTrimmedStringToUndefined = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional();

export const trimmedEmailString = (message = "Invalid email") => z.string().trim().email(message);

export const trimmedUrlString = (message = "Invalid URL") => z.string().trim().url(message);
