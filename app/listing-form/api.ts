import { errorMessageSchema } from "@/shared/schemas/common";
import {
  createListingResponseSchema,
  type CreateListingInput,
  type CreateListingResponse,
} from "@/shared/schemas/listings";
import type { ListingFormData } from "./types";

export function mapListingFormToCreateListingInput(data: ListingFormData): CreateListingInput {
  return {
    title: data.title,
    name: data.name,
    description: normalizeOptionalString(data.description),
    address: {
      street: data.street1,
      street2: normalizeOptionalString(data.street2),
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
    },
    units: [
      {
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sqft: data.squareFeet,
        rent: Math.round(data.monthlyRentCents / 100),
        availableDate: data.availableOn,
      },
    ],
    amenities: [],
    accessibilityFeatures: (data.customFeatures ?? []).map((feature) => ({
      name: feature.name,
      description: feature.description,
    })),
    applicationMethod: "internal",
    eligibilityCriteria: {},
    images: (data.images ?? []).map((image) => image.url),
    contact: {
      name: data.contactName,
      email: data.contactEmail,
      phone: data.contactPhone,
    },
    status: data.status,
    unitNumber: normalizeOptionalString(data.unitNumber),
    propertyType: data.propertyType,
    buildingType: data.buildingType,
    unitStory: data.unitStory,
    leaseTerm: data.leaseTerm,
    utilitiesIncluded: data.utilitiesIncluded,
  };
}

export async function parseCreateListingResponse(
  response: Response,
): Promise<CreateListingResponse["data"]> {
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  const payload = createListingResponseSchema.parse(await response.json());
  return payload.data;
}

async function getApiErrorMessage(response: Response) {
  try {
    const payload = errorMessageSchema.parse(await response.json());
    return payload.message;
  } catch {
    return "Unable to save listing. Please try again.";
  }
}

function normalizeOptionalString(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
