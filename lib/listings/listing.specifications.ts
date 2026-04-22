import { and, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";

import { listings, properties, type ListingStatus } from "@/db/schema";

export type ListingFilterSpecification = SQL<unknown> | undefined;

export function listingStatusSpecification(status: ListingStatus): ListingFilterSpecification {
  return eq(listings.status, status);
}

export function listingOwnerSpecification(ownerUserId: string | null): ListingFilterSpecification {
  if (!ownerUserId) {
    return undefined;
  }

  return eq(properties.ownerUserId, ownerUserId);
}

export function listingNeighborhoodSpecification(
  neighborhood: string | null,
): ListingFilterSpecification {
  if (!neighborhood) {
    return undefined;
  }

  return ilike(properties.neighborhood, `%${neighborhood}%`);
}

export function listingBedroomsSpecification(bedrooms: number | null): ListingFilterSpecification {
  if (typeof bedrooms !== "number") {
    return undefined;
  }

  return eq(listings.bedrooms, bedrooms);
}

export function listingBedroomsAtLeastSpecification(
  bedrooms: number | null,
): ListingFilterSpecification {
  if (typeof bedrooms !== "number") {
    return undefined;
  }

  return gte(listings.bedrooms, bedrooms);
}

export function listingBathroomsSpecification(
  bathrooms: number | null,
): ListingFilterSpecification {
  if (typeof bathrooms !== "number") {
    return undefined;
  }

  return eq(listings.bathrooms, bathrooms);
}

export function listingBathroomsAtLeastSpecification(
  bathrooms: number | null,
): ListingFilterSpecification {
  if (typeof bathrooms !== "number") {
    return undefined;
  }

  return gte(listings.bathrooms, bathrooms);
}

export function listingMinRentSpecification(minRent: string | null): ListingFilterSpecification {
  if (!minRent) {
    return undefined;
  }

  const minRentInCents = dollarsStringToCents(minRent);

  if (minRentInCents === null) {
    return undefined;
  }

  return gte(listings.monthlyRentCents, minRentInCents);
}

export function listingMaxRentSpecification(maxRent: string | null): ListingFilterSpecification {
  if (!maxRent) {
    return undefined;
  }

  const maxRentInCents = dollarsStringToCents(maxRent);

  if (maxRentInCents === null) {
    return undefined;
  }

  return lte(listings.monthlyRentCents, maxRentInCents);
}

export function listingAccessibilitySpecification(
  accessibility: "true" | "false" | undefined,
): ListingFilterSpecification {
  if (!accessibility) {
    return undefined;
  }

  const hasAccessibility = sql<boolean>`
    jsonb_array_length(
      case
        when jsonb_typeof(${listings.customFields} -> 'accessibilityFeatures') = 'array'
          then ${listings.customFields} -> 'accessibilityFeatures'
        else '[]'::jsonb
      end
    ) > 0
  `;

  return accessibility === "true" ? hasAccessibility : sql<boolean>`not (${hasAccessibility})`;
}

export function listingSearchSpecification(search: string | null): ListingFilterSpecification {
  if (!search) {
    return undefined;
  }

  const searchTerm = `%${search}%`;

  return or(
    ilike(listings.title, searchTerm),
    ilike(listings.description, searchTerm),
    ilike(properties.name, searchTerm),
    ilike(properties.street1, searchTerm),
    ilike(properties.city, searchTerm),
  );
}

export function listingAvailableBySpecification(
  moveInDate: string | null,
): ListingFilterSpecification {
  if (!moveInDate) {
    return undefined;
  }

  const parsedDate = new Date(moveInDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  const dateValue = parsedDate.toISOString().slice(0, 10);

  return lte(listings.availableOn, dateValue);
}

export function listingFeatureKeysSpecification(featureKeys: string[]): ListingFilterSpecification {
  if (featureKeys.length === 0) {
    return undefined;
  }

  const activeFeatureSpecs = featureKeys.map(
    (featureKey) =>
      sql<boolean>`coalesce(${listings.customFields} ->> ${featureKey}, 'false') = 'true'`,
  );

  return and(...activeFeatureSpecs);
}

export function andListingSpecifications(
  ...specifications: ListingFilterSpecification[]
): ListingFilterSpecification {
  const activeSpecifications = specifications.filter(
    (specification): specification is SQL<unknown> => specification !== undefined,
  );

  if (activeSpecifications.length === 0) {
    return undefined;
  }

  return and(...activeSpecifications);
}

function dollarsStringToCents(value: string) {
  const normalized = value.trim();
  const amountMatch = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/);

  if (!amountMatch) {
    return null;
  }

  const dollarsMatch = amountMatch[1];

  if (!dollarsMatch) {
    return null;
  }

  const dollars = Number.parseInt(dollarsMatch, 10);
  const cents = Number.parseInt((amountMatch[2] ?? "").padEnd(2, "0") || "0", 10);

  if (!Number.isSafeInteger(dollars) || !Number.isSafeInteger(cents)) {
    return null;
  }

  const totalCents = dollars * 100 + cents;

  return Number.isSafeInteger(totalCents) ? totalCents : null;
}
