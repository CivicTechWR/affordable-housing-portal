import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const listingStatusSchema = z.enum(["draft", "published", "archived"]);
const hasAtLeastOneField = (value: Record<string, unknown>) => Object.keys(value).length > 0;

export const listingIdParamSchema = z.uuid("Invalid listing id.");
export const listingParamsSchema = z.object({
  id: listingIdParamSchema,
});

export const listingQuerySchema = z.object({
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

const listingImageUrlSchema = z.url("Invalid image URL.");
const listingDetailsAddressSchema = z.object({
  street1: nonEmptyString,
  street2: nonEmptyString.optional(),
  city: nonEmptyString,
  province: nonEmptyString,
  postalCode: nonEmptyString,
});
const listingContactSchema = z.object({
  name: nonEmptyString,
  email: z.email("Invalid contact email."),
  phone: nonEmptyString,
});

export const listingDetailsSchema = z.object({
  id: listingIdParamSchema,
  title: nonEmptyString.optional(),
  unitNumber: nonEmptyString.optional(),
  price: z.number().min(0),
  address: listingDetailsAddressSchema,
  beds: z.number().int().min(0),
  baths: z.number().min(0),
  sqft: z.number().int().min(0),
  accessibilityFeatures: z.array(listingFeatureSchema).optional(),
  images: z.array(listingImageSchema),
  timeAgo: nonEmptyString,
  features: z.array(listingFeatureCategorySchema),
  contact: listingContactSchema.optional(),
});

export const listingSummarySchema = z.object({
  id: listingIdParamSchema,
  title: nonEmptyString.optional(),
  price: z.number().min(0),
  address: nonEmptyString,
  city: nonEmptyString,
  beds: z.number().int().min(0),
  baths: z.number().min(0),
  sqft: z.number().int().min(0),
  accessibilityFeatures: z.array(listingFeatureSchema).optional(),
  lat: z.number(),
  lng: z.number(),
  imageUrl: listingImageUrlSchema.optional(),
  timeAgo: nonEmptyString,
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

const listingApplicationMethodSchema = z.enum(["internal", "external_link", "paper"]);
const listingExternalApplicationUrlSchema = z
  .string()
  .trim()
  .url("Invalid external application URL.");
const listingPaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
const listingAddressPatchSchema = listingAddressSchema.partial().refine(hasAtLeastOneField, {
  message: "Address update must include at least one field.",
});
const listingEligibilityCriteriaPatchSchema = listingEligibilityCriteriaSchema
  .partial()
  .refine(hasAtLeastOneField, {
    message: "Eligibility criteria update must include at least one field.",
  });
const listingContactPatchSchema = listingContactSchema.partial().refine(hasAtLeastOneField, {
  message: "Contact update must include at least one field.",
});
const listingUnitPatchSchema = listingUnitSchema.partial().refine(hasAtLeastOneField, {
  message: "Each unit update must include at least one field.",
});

const updateListingBasePayloadSchema = z.object({
  name: nonEmptyString.optional(),
  description: nonEmptyString.optional(),
  address: listingAddressPatchSchema.optional(),
  units: z.array(listingUnitPatchSchema).min(1, "At least one unit is required.").optional(),
  amenities: z.array(nonEmptyString).optional(),
  accessibilityFeatures: z.array(listingFeatureSchema).optional(),
  eligibilityCriteria: listingEligibilityCriteriaPatchSchema.optional(),
  images: z.array(listingImageUrlSchema).optional(),
  contact: listingContactPatchSchema.optional(),
  status: listingStatusSchema.optional(),
});
const updateListingApplicationPayloadSchema = z
  .object({
    applicationMethod: listingApplicationMethodSchema.optional(),
    externalApplicationUrl: listingExternalApplicationUrlSchema.optional(),
  })
  .refine(
    (value) => value.applicationMethod !== "external_link" || !!value.externalApplicationUrl,
    {
      message: "External application URL is required when applicationMethod is external_link.",
      path: ["externalApplicationUrl"],
    },
  );
const updateListingPayloadSchema = updateListingBasePayloadSchema
  .and(updateListingApplicationPayloadSchema)
  .refine((value) => hasAtLeastOneField(value), {
    message: "At least one field is required.",
  });
const listingIdDataSchema = z.object({
  id: listingIdParamSchema,
});

const listingPayloadSchema = z.object({
  name: nonEmptyString,
  description: nonEmptyString,
  address: listingAddressSchema,
  units: z.array(listingUnitSchema).min(1, "At least one unit is required."),
  amenities: z.array(nonEmptyString),
  accessibilityFeatures: z.array(listingFeatureSchema),
  applicationMethod: listingApplicationMethodSchema,
  externalApplicationUrl: listingExternalApplicationUrlSchema.optional(),
  eligibilityCriteria: listingEligibilityCriteriaSchema,
  images: z.array(listingImageUrlSchema),
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

export const updateListingSchema = updateListingPayloadSchema;

export const listingListResponseSchema = z.object({
  data: z.array(listingSummarySchema),
  pagination: listingPaginationSchema,
});

export const listingByIdResponseSchema = z.object({
  data: listingDetailsSchema,
});

export const createListingResponseSchema = z.object({
  message: z.string(),
  data: listingPayloadSchema.extend({
    id: listingIdParamSchema,
  }),
});

export const updateListingResponseSchema = z.object({
  message: z.string(),
  data: listingIdDataSchema.and(updateListingPayloadSchema),
});

export const deleteListingResponseSchema = z.object({
  message: z.string(),
  data: listingIdDataSchema,
});

export type ListingIdParam = z.infer<typeof listingIdParamSchema>;
export type ListingParams = z.infer<typeof listingParamsSchema>;
export type ListingQuery = z.infer<typeof listingQuerySchema>;
export type ListingDetails = z.infer<typeof listingDetailsSchema>;
export type ListingSummary = z.infer<typeof listingSummarySchema>;
export type ListingListResponse = z.infer<typeof listingListResponseSchema>;
export type ListingByIdResponse = z.infer<typeof listingByIdResponseSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type CreateListingResponse = z.infer<typeof createListingResponseSchema>;
export type UpdateListingResponse = z.infer<typeof updateListingResponseSchema>;
export type DeleteListingResponse = z.infer<typeof deleteListingResponseSchema>;
