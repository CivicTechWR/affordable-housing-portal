import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const listingStatusSchema = z.enum(["draft", "published", "archived"]);

export const listingIdParamSchema = z.uuid("Invalid listing id.");
export const listingRouteParamsSchema = z.object({
  id: listingIdParamSchema,
});

export const listingSearchQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  status: listingStatusSchema.optional(),
  neighborhood: nonEmptyString.optional(),
  bedrooms: z.string().regex(/^\d+$/).optional(),
  maxRent: z.string().regex(/^\d+$/).optional(),
  accessibility: z.enum(["true", "false"]).optional(),
  search: nonEmptyString.optional(),
});

export const listingFeatureSchema = z.object({
  name: nonEmptyString,
  description: nonEmptyString,
});

export const listingFeatureCategorySchema = z.object({
  categoryName: nonEmptyString,
  features: z.array(listingFeatureSchema),
});

export const listingImageSchema = z.object({
  url: z.url("Invalid listing image URL."),
  caption: nonEmptyString,
});

export const listingDetailsSchema = z.object({
  id: listingIdParamSchema,
  price: z.number().min(0),
  address: nonEmptyString,
  city: nonEmptyString,
  beds: z.number().int().min(0),
  baths: z.number().min(0),
  sqft: z.number().int().min(0),
  images: z.array(listingImageSchema),
  timeAgo: nonEmptyString,
  features: z.array(listingFeatureCategorySchema),
});

const listingAddressSchema = z.object({
  street: nonEmptyString,
  city: nonEmptyString,
  province: nonEmptyString,
  postalCode: nonEmptyString,
});

const listingUnitSchema = z.object({
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  sqft: z.number().int().min(0),
  rent: z.number().int().min(0),
  availableDate: z.iso.date(),
});

const listingEligibilityCriteriaSchema = z.object({
  maxIncome: z.number().int().min(0).optional(),
  minAge: z.number().int().min(0).optional(),
  housingType: nonEmptyString.optional(),
});

const listingContactSchema = z.object({
  name: nonEmptyString,
  email: z.email("Invalid contact email."),
  phone: nonEmptyString,
});

const listingApplicationMethodSchema = z.enum(["internal", "external_link", "paper"]);

const listingPayloadSchema = z.object({
  name: nonEmptyString,
  description: nonEmptyString,
  address: listingAddressSchema,
  units: z.array(listingUnitSchema).min(1, "At least one unit is required."),
  amenities: z.array(nonEmptyString),
  accessibilityFeatures: z.array(nonEmptyString),
  applicationMethod: listingApplicationMethodSchema,
  externalApplicationUrl: z.string().trim().url("Invalid external application URL.").optional(),
  eligibilityCriteria: listingEligibilityCriteriaSchema,
  images: z.array(z.string().trim().url("Invalid image URL.")),
  contact: listingContactSchema,
  status: listingStatusSchema,
});

export const createListingSchema = listingPayloadSchema.superRefine((value, context) => {
  if (value.applicationMethod === "external_link" && !value.externalApplicationUrl) {
    context.addIssue({
      code: "custom",
      message: "External application URL is required when applicationMethod is external_link.",
      path: ["externalApplicationUrl"],
    });
  }
});

export const updateListingSchema = listingPayloadSchema.partial().superRefine((value, context) => {
  if (Object.keys(value).length === 0) {
    context.addIssue({
      code: "custom",
      message: "At least one field is required.",
    });
  }

  if (value.applicationMethod === "external_link" && !value.externalApplicationUrl) {
    context.addIssue({
      code: "custom",
      message: "External application URL is required when applicationMethod is external_link.",
      path: ["externalApplicationUrl"],
    });
  }
});

export type ListingIdParam = z.infer<typeof listingIdParamSchema>;
export type ListingRouteParams = z.infer<typeof listingRouteParamsSchema>;
export type ListingSearchQuery = z.infer<typeof listingSearchQuerySchema>;
export type ListingDetails = z.infer<typeof listingDetailsSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
