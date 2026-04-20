import "server-only";

import { and, asc, desc, eq, ilike, inArray, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  customListingFields,
  listingImages,
  listings,
  properties,
  type ListingCustomFields,
  type ListingStatus,
  type UserRole,
} from "@/db/schema";
import type { getOptionalSession } from "@/lib/auth/session";
import {
  buildListingFeatureCategories,
  centsToDollars,
  formatListingAddress,
  formatListingTimeAgo,
  getEnabledBooleanCustomFieldKeys,
  getListingCoordinates,
  getListingSquareFeet,
} from "@/lib/listings/store";
import type {
  ListingDetails,
  ListingIdParam,
  ListingListResponse,
} from "@/shared/schemas/listings";

type OptionalSessionResult = Awaited<ReturnType<typeof getOptionalSession>>;

export type ListingReadContext = {
  userId: string | null;
  role: UserRole | null;
};

export type ListingListReadInput = {
  page?: number;
  limit?: number;
  status?: ListingStatus | null;
  neighborhood?: string | null;
  bedrooms?: number | null;
  maxRent?: string | null;
  accessibility?: "true" | "false";
  search?: string | null;
  auth?: ListingReadContext | null;
};

type ListingListVisibility = {
  status: ListingStatus;
  ownerUserId: string | null;
  isAccessible: boolean;
};

export type ListingRecord = NonNullable<Awaited<ReturnType<typeof getListingRecordById>>>;

export function toListingReadContext(
  sessionResult: OptionalSessionResult | null | undefined,
): ListingReadContext {
  if (!sessionResult?.session || !sessionResult.authzUser) {
    return {
      userId: null,
      role: null,
    };
  }

  return {
    userId: sessionResult.session.user.id,
    role: sessionResult.authzUser.role,
  };
}

export async function readListings(input: ListingListReadInput = {}): Promise<ListingListResponse> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const visibility = getListingListVisibility(input.auth ?? null, input.status ?? null);

  if (!visibility.isAccessible) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const filters = [eq(listings.status, visibility.status)];

  if (visibility.ownerUserId) {
    filters.push(eq(properties.ownerUserId, visibility.ownerUserId));
  }

  if (input.neighborhood) {
    filters.push(ilike(properties.neighborhood, `%${input.neighborhood}%`));
  }

  if (typeof input.bedrooms === "number") {
    filters.push(eq(listings.bedrooms, input.bedrooms));
  }

  if (input.maxRent) {
    filters.push(lte(listings.monthlyRentCents, dollarsStringToCents(input.maxRent)));
  }

  const accessibilityFilter = buildAccessibilityFilter(input.accessibility);

  if (accessibilityFilter) {
    filters.push(accessibilityFilter);
  }

  if (input.search) {
    const searchTerm = `%${input.search}%`;

    filters.push(
      or(
        ilike(listings.title, searchTerm),
        ilike(listings.description, searchTerm),
        ilike(properties.name, searchTerm),
        ilike(properties.street1, searchTerm),
        ilike(properties.city, searchTerm),
      )!,
    );
  }

  const whereClause = and(...filters);
  const offset = (page - 1) * limit;

  const totalRows = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(listings)
    .innerJoin(properties, eq(listings.propertyId, properties.id))
    .where(whereClause);
  const total = Number(totalRows[0]?.total ?? 0);

  const pagedRows = await db
    .select({
      id: listings.id,
      monthlyRentCents: listings.monthlyRentCents,
      bedrooms: listings.bedrooms,
      bathrooms: listings.bathrooms,
      squareFeet: listings.squareFeet,
      customFields: listings.customFields,
      unitNumber: listings.unitNumber,
      publishedAt: listings.publishedAt,
      createdAt: listings.createdAt,
      street1: properties.street1,
      city: properties.city,
      latitude: properties.latitude,
      longitude: properties.longitude,
    })
    .from(listings)
    .innerJoin(properties, eq(listings.propertyId, properties.id))
    .where(whereClause)
    .orderBy(desc(listings.publishedAt), desc(listings.createdAt))
    .limit(limit)
    .offset(offset);

  const listingIds = pagedRows.map((row) => row.id);
  const imageRows =
    listingIds.length > 0
      ? await db
          .select({
            listingId: listingImages.listingId,
            imageUrl: listingImages.imageUrl,
            sortOrder: listingImages.sortOrder,
          })
          .from(listingImages)
          .where(inArray(listingImages.listingId, listingIds))
          .orderBy(asc(listingImages.sortOrder))
      : [];

  const imageByListingId = new Map<string, string>();
  for (const image of imageRows) {
    if (!imageByListingId.has(image.listingId)) {
      imageByListingId.set(image.listingId, image.imageUrl);
    }
  }

  return {
    data: pagedRows.map((row) => {
      const coordinates = getListingCoordinates(row.latitude, row.longitude);
      const listingSummary = {
        id: row.id,
        price: centsToDollars(row.monthlyRentCents),
        address: formatListingAddress(row.street1, row.unitNumber),
        city: row.city,
        beds: row.bedrooms,
        baths: row.bathrooms,
        sqft: getListingSquareFeet(row.squareFeet, row.customFields),
        imageUrl: imageByListingId.get(row.id),
        timeAgo: formatListingTimeAgo(row.publishedAt, row.createdAt),
      };

      if (!coordinates) {
        return listingSummary;
      }

      return {
        ...listingSummary,
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

export async function readListingById(input: {
  id: ListingIdParam;
  auth?: ListingReadContext | null;
}): Promise<ListingDetails | null> {
  const listing = await getListingRecordById(input.id);

  if (!listing || !canReadListing(listing, input.auth ?? null)) {
    return null;
  }

  return buildListingDetailsResponse(listing);
}

export async function getListingRecordById(listingId: ListingIdParam) {
  const [listing] = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      status: listings.status,
      unitNumber: listings.unitNumber,
      bedrooms: listings.bedrooms,
      bathrooms: listings.bathrooms,
      squareFeet: listings.squareFeet,
      monthlyRentCents: listings.monthlyRentCents,
      availableOn: listings.availableOn,
      maxIncomeCents: listings.maxIncomeCents,
      applicationUrl: listings.applicationUrl,
      applicationEmail: listings.applicationEmail,
      applicationPhone: listings.applicationPhone,
      customFields: listings.customFields,
      publishedAt: listings.publishedAt,
      archivedAt: listings.archivedAt,
      createdAt: listings.createdAt,
      updatedAt: listings.updatedAt,
      property: {
        id: properties.id,
        ownerUserId: properties.ownerUserId,
        name: properties.name,
        street1: properties.street1,
        street2: properties.street2,
        city: properties.city,
        province: properties.province,
        postalCode: properties.postalCode,
        neighborhood: properties.neighborhood,
        latitude: properties.latitude,
        longitude: properties.longitude,
        contactName: properties.contactName,
        contactEmail: properties.contactEmail,
        contactPhone: properties.contactPhone,
      },
    })
    .from(listings)
    .innerJoin(properties, eq(listings.propertyId, properties.id))
    .where(eq(listings.id, listingId))
    .limit(1);

  return listing
    ? {
        ...listing,
        customFields: listing.customFields as ListingCustomFields,
      }
    : null;
}

async function buildListingDetailsResponse(listing: ListingRecord): Promise<ListingDetails> {
  const imageRows = await db
    .select({
      imageUrl: listingImages.imageUrl,
      altText: listingImages.altText,
    })
    .from(listingImages)
    .where(eq(listingImages.listingId, listing.id))
    .orderBy(asc(listingImages.sortOrder));

  const enabledDefinitionKeys = getEnabledBooleanCustomFieldKeys(listing.customFields);
  const featureDefinitions =
    enabledDefinitionKeys.length > 0
      ? await db
          .select({
            key: customListingFields.key,
            label: customListingFields.label,
            description: customListingFields.description,
            category: customListingFields.category,
          })
          .from(customListingFields)
          .where(
            and(
              inArray(customListingFields.key, enabledDefinitionKeys),
              eq(customListingFields.isPublic, true),
            ),
          )
          .orderBy(asc(customListingFields.sortOrder))
      : [];

  return {
    id: listing.id,
    title: listing.title,
    unitNumber: listing.unitNumber ?? undefined,
    price: centsToDollars(listing.monthlyRentCents),
    address: {
      street1: listing.property.street1,
      street2: listing.property.street2 ?? undefined,
      city: listing.property.city,
      province: listing.property.province,
      postalCode: listing.property.postalCode,
    },
    beds: listing.bedrooms,
    baths: listing.bathrooms,
    sqft: getListingSquareFeet(listing.squareFeet, listing.customFields),
    images: imageRows.map((image) => ({
      url: image.imageUrl,
      caption: image.altText ?? `${listing.title} image`,
    })),
    timeAgo: formatListingTimeAgo(listing.publishedAt, listing.createdAt),
    features: buildListingFeatureCategories(listing.customFields, featureDefinitions),
    contact:
      listing.property.contactName && listing.property.contactEmail && listing.property.contactPhone
        ? {
            name: listing.property.contactName,
            email: listing.property.contactEmail,
            phone: listing.property.contactPhone,
          }
        : undefined,
  };
}

function getListingListVisibility(
  auth: ListingReadContext | null,
  requestedStatus: ListingStatus | null,
): ListingListVisibility {
  if (requestedStatus === "draft" || requestedStatus === "archived") {
    if (auth?.role === "admin") {
      return {
        status: requestedStatus,
        ownerUserId: null,
        isAccessible: true,
      };
    }

    if (auth?.role === "partner" && auth.userId) {
      return {
        status: requestedStatus,
        ownerUserId: auth.userId,
        isAccessible: true,
      };
    }

    return {
      status: "published",
      ownerUserId: null,
      isAccessible: false,
    };
  }

  return {
    status: "published",
    ownerUserId: null,
    isAccessible: true,
  };
}

function canReadListing(listing: ListingRecord, auth: ListingReadContext | null) {
  if (listing.status === "published") {
    return true;
  }

  if (!auth?.userId || !auth.role) {
    return false;
  }

  return auth.role === "admin" || listing.property.ownerUserId === auth.userId;
}

function dollarsStringToCents(value: string) {
  const [whole, fractional = ""] = value.split(".");
  const cents = `${fractional}00`.slice(0, 2);

  return Number(whole) * 100 + Number(cents);
}

function buildAccessibilityFilter(accessibility: "true" | "false" | undefined) {
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
