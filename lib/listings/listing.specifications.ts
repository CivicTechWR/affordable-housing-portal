import { and, eq, ilike, lte, or, sql, type SQL } from "drizzle-orm";

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
