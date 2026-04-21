import "server-only";

import { formatDistanceToNow } from "date-fns";

import type { ListingCustomFields, ListingCustomFieldValue, ListingStatus } from "@/db/schema";
import { sortCustomListingFieldsForDisplay } from "@/lib/custom-listing-fields/custom-listing-field-ordering";
import type {
  CreateListingInput,
  ListingDetails,
  UpdateListingInput,
} from "@/shared/schemas/listings";

export const DEFAULT_PROPERTY_COUNTRY = "Canada";

type ListingApplicationMethod = CreateListingInput["applicationMethod"];

type StoredUnit = {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  rent?: number;
  availableDate?: string;
};

type StoredEligibilityCriteria = {
  maxIncome?: number | null;
  minAge?: number | null;
  housingType?: string | null;
};

type ListingFeatureDefinition = {
  key: string;
  label: string;
  description: string | null;
  category: string;
  sortOrder: number;
};
type StoredListingFeature = NonNullable<ListingDetails["accessibilityFeatures"]>[number];

export function buildListingCustomFields(input: CreateListingInput): ListingCustomFields {
  return {
    units: input.units.map((unit) => ({ ...unit })),
    amenities: [...input.amenities],
    accessibilityFeatures: [...input.accessibilityFeatures],
    applicationMethod: input.applicationMethod,
    externalApplicationUrl:
      input.applicationMethod === "external_link" ? (input.externalApplicationUrl ?? null) : null,
    eligibilityCriteria: { ...input.eligibilityCriteria },
  };
}

export function mergeListingCustomFields(
  existing: ListingCustomFields,
  input: UpdateListingInput,
): ListingCustomFields {
  const next: ListingCustomFields = {
    ...existing,
  };
  const existingUnits = getStoredUnits(existing);

  if (input.units !== undefined) {
    // Unit updates are patch-by-index today, so preserve untouched trailing units.
    next.units = mergeStoredUnits(existingUnits, input.units);
  }

  if (input.amenities !== undefined) {
    next.amenities = [...input.amenities];
  }

  if (input.accessibilityFeatures !== undefined) {
    next.accessibilityFeatures = [...input.accessibilityFeatures];
  }

  if (input.applicationMethod !== undefined) {
    next.applicationMethod = input.applicationMethod;
  }

  if (input.externalApplicationUrl !== undefined) {
    next.externalApplicationUrl = input.externalApplicationUrl;
  } else if (input.applicationMethod !== undefined && input.applicationMethod !== "external_link") {
    next.externalApplicationUrl = null;
  }

  if (input.eligibilityCriteria !== undefined) {
    next.eligibilityCriteria = {
      ...getStoredEligibilityCriteria(existing),
      ...input.eligibilityCriteria,
    };
  }

  return next;
}

export function getStoredUnits(customFields: ListingCustomFields): StoredUnit[] {
  const value = customFields.units;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((unit) => {
    if (!isRecord(unit)) {
      return [];
    }

    return [
      {
        bedrooms: getNumber(unit.bedrooms),
        bathrooms: getNumber(unit.bathrooms),
        sqft: getNumber(unit.sqft),
        rent: getNumber(unit.rent),
        availableDate: getString(unit.availableDate),
      },
    ];
  });
}

export function getStoredEligibilityCriteria(
  customFields: ListingCustomFields,
): StoredEligibilityCriteria {
  const value = customFields.eligibilityCriteria;

  if (!isRecord(value)) {
    return {};
  }

  return {
    maxIncome: getNullableNumber(value.maxIncome),
    minAge: getNullableNumber(value.minAge),
    housingType: getNullableString(value.housingType),
  };
}

export function getStoredStringArray(customFields: ListingCustomFields, key: string): string[] {
  const value = customFields[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

export function getStoredAccessibilityFeatures(
  customFields: ListingCustomFields,
): StoredListingFeature[] {
  const value = customFields.accessibilityFeatures;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry === "string" && entry.length > 0) {
      return [
        {
          name: entry,
          description: entry,
        },
      ];
    }

    if (!isRecord(entry)) {
      return [];
    }

    const name = getString(entry.name);

    if (!name) {
      return [];
    }

    return [
      {
        name,
        description: getString(entry.description) ?? name,
      },
    ];
  });
}

export function getStoredApplicationMethod(
  customFields: ListingCustomFields,
): ListingApplicationMethod | undefined {
  const value = customFields.applicationMethod;

  return value === "internal" || value === "external_link" || value === "paper" ? value : undefined;
}

export function getStoredExternalApplicationUrl(customFields: ListingCustomFields) {
  const value = customFields.externalApplicationUrl;

  if (value === null) {
    return null;
  }

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getEnabledBooleanCustomFieldKeys(customFields: ListingCustomFields) {
  return Object.entries(customFields)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
}

export function buildListingFeatureCategories(
  customFields: ListingCustomFields,
  definitions: ListingFeatureDefinition[],
): ListingDetails["features"] {
  const categories = new Map<string, ListingDetails["features"][number]>();

  const accessibilityFeatures = getStoredAccessibilityFeatures(customFields);
  if (accessibilityFeatures.length > 0) {
    categories.set("Accessibility", {
      categoryName: "Accessibility",
      features: accessibilityFeatures.map((feature) => ({ ...feature })),
    });
  }

  const amenities = getStoredStringArray(customFields, "amenities");
  if (amenities.length > 0) {
    categories.set("Amenities", {
      categoryName: "Amenities",
      features: amenities.map((feature) => ({
        name: feature,
        description: feature,
      })),
    });
  }

  for (const definition of sortCustomListingFieldsForDisplay(definitions)) {
    const existingCategory = categories.get(definition.category) ?? {
      categoryName: definition.category,
      features: [],
    };

    existingCategory.features.push({
      name: definition.label,
      description: definition.description ?? definition.label,
    });

    categories.set(definition.category, existingCategory);
  }

  return Array.from(categories.values());
}

export function formatListingAddress(street1: string, unitNumber: string | null) {
  return unitNumber ? `${street1} #${unitNumber}` : street1;
}

export function formatListingTimeAgo(publishedAt: Date | null, createdAt: Date) {
  return formatDistanceToNow(publishedAt ?? createdAt, {
    addSuffix: true,
  });
}

export function getListingCoordinates(latitude: number | null, longitude: number | null) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return {
    lat: latitude,
    lng: longitude,
  };
}

export function getListingSquareFeet(squareFeet: number | null, customFields: ListingCustomFields) {
  return squareFeet ?? getStoredUnits(customFields)[0]?.sqft ?? 0;
}

export function resolveListingStatusTimestamps(
  status: ListingStatus,
  current?: {
    publishedAt: Date | null;
    archivedAt: Date | null;
  },
) {
  const now = new Date();

  if (status === "published") {
    return {
      publishedAt: current?.publishedAt ?? now,
      archivedAt: null,
    };
  }

  if (status === "archived") {
    return {
      publishedAt: current?.publishedAt ?? null,
      archivedAt: current?.archivedAt ?? now,
    };
  }

  return {
    publishedAt: null,
    archivedAt: null,
  };
}

export function centsToDollars(amountInCents: number) {
  return amountInCents / 100;
}

export function dollarsToCents(amount: number | undefined) {
  return typeof amount === "number" ? Math.round(amount * 100) : null;
}

function mergeStoredUnits(
  existing: StoredUnit[],
  updates: NonNullable<UpdateListingInput["units"]>,
) {
  // Omitted trailing indexes are untouched; use `null` at an index to remove a stored unit.
  return Array.from({ length: Math.max(existing.length, updates.length) }, (_, index) => {
    const update = updates[index];

    if (!update) {
      return {
        ...existing[index],
      };
    }

    return {
      ...existing[index],
      ...update,
    };
  })
    .filter((_, index) => updates[index] !== null)
    .filter((unit) => Object.keys(unit).length > 0);
}

function isRecord(value: ListingCustomFieldValue | unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function getNullableNumber(value: unknown) {
  return value === null ? null : getNumber(value);
}

function getString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getNullableString(value: unknown) {
  return value === null ? null : getString(value);
}
