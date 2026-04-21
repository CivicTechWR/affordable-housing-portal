import "server-only";

import type { ListingCustomFields } from "@/db/schema";
import type { getOptionalSession } from "@/lib/auth/session";
import {
  buildListingFeatureCategories,
  buildListingCustomFields,
  centsToDollars,
  dollarsToCents,
  formatListingAddress,
  formatListingTimeAgo,
  getEnabledBooleanCustomFieldKeys,
  getListingCoordinates,
  getListingSquareFeet,
  getStoredApplicationMethod,
  getStoredAccessibilityFeatures,
  getStoredEligibilityCriteria,
  getStoredExternalApplicationUrl,
  getStoredUnits,
  mergeListingCustomFields,
  resolveListingStatusTimestamps,
} from "@/lib/listings/store";
import {
  andListingSpecifications,
  listingAccessibilitySpecification,
  listingBedroomsSpecification,
  listingMaxRentSpecification,
  listingNeighborhoodSpecification,
  listingOwnerSpecification,
  listingSearchSpecification,
  listingStatusSpecification,
} from "@/lib/listings/listing.specifications";
import {
  archiveListing,
  createListing,
  findListingImagesByListingId,
  findListingRecordById,
  findListingSummaries,
  findPublicFeatureDefinitionsByKeys,
  updateListingGraph,
  type ListingRecord,
} from "@/lib/listings/listing.repository";
import { fail, succeed, type DomainResult } from "@/lib/http/domain-result";
import {
  canEditListing,
  canReadListing,
  canWriteListing,
  getListingListVisibility,
  type ListingActor,
} from "@/lib/policies/listing-policy";
import { getOptionalSession as getAuthSession } from "@/lib/auth/session";
import type {
  CreateListingInput,
  CreateListingResponse,
  DeleteListingResponse,
  ListingByIdResponse,
  ListingDetails,
  ListingIdParam,
  ListingListResponse,
  ListingQuery,
  UpdateListingInput,
  UpdateListingResponse,
} from "@/shared/schemas/listings";

type OptionalSessionResult = Awaited<ReturnType<typeof getOptionalSession>>;

export async function getListingsService(query: ListingQuery): Promise<ListingListResponse> {
  const optionalSession =
    query.status === "draft" || query.status === "archived"
      ? await getAuthSession()
      : {
          session: null,
          authzUser: null,
        };

  const actor = toListingActor(optionalSession);
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;
  const visibility = getListingListVisibility(actor, query.status ?? null);

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

  const where = andListingSpecifications(
    listingStatusSpecification(visibility.status),
    listingOwnerSpecification(visibility.ownerUserId),
    listingNeighborhoodSpecification(query.neighborhood ?? null),
    listingBedroomsSpecification(query.bedrooms ? Number(query.bedrooms) : null),
    listingMaxRentSpecification(query.maxRent ?? null),
    listingAccessibilitySpecification(query.accessibility),
    listingSearchSpecification(query.search ?? null),
  );

  const { total, rows, imageRows } = await findListingSummaries({
    where,
    page,
    limit,
  });

  const imageByListingId = new Map<string, string>();
  for (const image of imageRows) {
    if (!imageByListingId.has(image.listingId)) {
      imageByListingId.set(image.listingId, image.imageUrl);
    }
  }

  return {
    data: rows.map((row) => {
      const coordinates = getListingCoordinates(row.latitude, row.longitude);
      const accessibilityFeatures = getStoredAccessibilityFeatures(row.customFields);
      const listingSummary = {
        id: row.id,
        price: centsToDollars(row.monthlyRentCents),
        address: formatListingAddress(row.street1, row.unitNumber),
        city: row.city,
        beds: row.bedrooms,
        baths: row.bathrooms,
        sqft: getListingSquareFeet(row.squareFeet, row.customFields),
        accessibilityFeatures: accessibilityFeatures.length > 0 ? accessibilityFeatures : undefined,
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

export async function getListingByIdService(
  listingId: ListingIdParam,
): Promise<DomainResult<ListingByIdResponse>> {
  const optionalSession = await getAuthSession();
  const actor = toListingActor(optionalSession);
  const listing = await findListingRecordById(listingId);

  if (!listing) {
    return fail("not_found", "Listing not found");
  }

  if (
    !canReadListing(
      {
        ownerUserId: listing.property.ownerUserId,
        status: listing.status,
      },
      actor,
    )
  ) {
    return fail("not_found", "Listing not found");
  }

  const details = await buildListingDetailsResponse(listing);

  return succeed({
    data: details,
  });
}

export async function createListingService(
  payload: CreateListingInput,
): Promise<DomainResult<CreateListingResponse>> {
  const actorResult = await requireListingWriteActor();

  if (!actorResult.ok) {
    return actorResult;
  }

  const primaryUnit = payload.units[0];

  if (!primaryUnit) {
    return fail("validation", "At least one unit is required");
  }

  const primaryUnitRentCents = dollarsToCents(primaryUnit.rent);

  if (primaryUnitRentCents === null) {
    return fail("validation", "Primary unit rent is required.");
  }

  const statusTimestamps = resolveListingStatusTimestamps(payload.status);
  const customFields = buildListingCustomFields(payload);

  const createdListing = await createListing({
    actorUserId: actorResult.value.actor.userId,
    payload,
    primaryUnitRentCents,
    customFields,
    publishedAt: statusTimestamps.publishedAt,
    archivedAt: statusTimestamps.archivedAt,
  });

  return succeed({
    message: "Listing created",
    data: {
      id: createdListing.id,
      ...payload,
    },
  });
}

export async function updateListingByIdService(input: {
  listingId: ListingIdParam;
  payload: UpdateListingInput;
}): Promise<DomainResult<UpdateListingResponse>> {
  const actorResult = await requireListingWriteActor();

  if (!actorResult.ok) {
    return actorResult;
  }

  const listing = await findListingRecordById(input.listingId);

  if (!listing) {
    return fail("not_found", "Listing not found");
  }

  if (
    !canEditListing(
      {
        ownerUserId: listing.property.ownerUserId,
        status: listing.status,
      },
      actorResult.value.actor,
    )
  ) {
    return fail("forbidden", "Forbidden");
  }

  const nextCustomFields = mergeListingCustomFields(listing.customFields, input.payload);
  const nextUnits = getStoredUnits(nextCustomFields);
  const primaryUnit = nextUnits[0];
  const nextEligibility = getStoredEligibilityCriteria(nextCustomFields);
  const nextStatus = input.payload.status ?? listing.status;
  const nextApplicationUrlResult = resolveNextApplicationUrl({
    payload: input.payload,
    listingApplicationUrl: listing.applicationUrl,
    listingCustomFields: listing.customFields,
    nextCustomFields,
  });

  if (!nextApplicationUrlResult.ok) {
    return fail("validation", nextApplicationUrlResult.message);
  }

  const statusTimestamps = resolveListingStatusTimestamps(nextStatus, {
    publishedAt: listing.publishedAt,
    archivedAt: listing.archivedAt,
  });
  const nextPrimaryUnitRentCents = dollarsToCents(primaryUnit?.rent ?? undefined);
  const monthlyRentCents =
    typeof nextPrimaryUnitRentCents === "number" && Number.isFinite(nextPrimaryUnitRentCents)
      ? nextPrimaryUnitRentCents
      : listing.monthlyRentCents;

  await updateListingGraph({
    actorUserId: actorResult.value.actor.userId,
    listingId: input.listingId,
    propertyId: listing.property.id,
    property: {
      name: input.payload.name ?? listing.property.name,
      street1: input.payload.address?.street ?? listing.property.street1,
      city: input.payload.address?.city ?? listing.property.city,
      province: input.payload.address?.province ?? listing.property.province,
      postalCode: input.payload.address?.postalCode ?? listing.property.postalCode,
      neighborhood: input.payload.address?.neighborhood ?? listing.property.neighborhood,
      latitude: input.payload.address?.latitude ?? listing.property.latitude,
      longitude: input.payload.address?.longitude ?? listing.property.longitude,
      contactName: input.payload.contact?.name ?? listing.property.contactName,
      contactEmail: input.payload.contact?.email ?? listing.property.contactEmail,
      contactPhone: input.payload.contact?.phone ?? listing.property.contactPhone,
    },
    listing: {
      title: input.payload.name ?? listing.title,
      description: input.payload.description ?? listing.description,
      status: nextStatus,
      bedrooms: primaryUnit?.bedrooms ?? listing.bedrooms,
      bathrooms: primaryUnit?.bathrooms ?? listing.bathrooms,
      squareFeet: primaryUnit?.sqft ?? listing.squareFeet,
      monthlyRentCents,
      availableOn: primaryUnit?.availableDate ?? listing.availableOn,
      maxIncomeCents:
        nextEligibility.maxIncome === null
          ? null
          : (dollarsToCents(nextEligibility.maxIncome ?? undefined) ?? listing.maxIncomeCents),
      applicationUrl: nextApplicationUrlResult.nextApplicationUrl,
      applicationEmail: input.payload.contact?.email ?? listing.applicationEmail,
      applicationPhone: input.payload.contact?.phone ?? listing.applicationPhone,
      customFields: nextCustomFields,
      publishedAt: statusTimestamps.publishedAt,
      archivedAt: statusTimestamps.archivedAt,
    },
    images: input.payload.images,
    imageAltTextBase: input.payload.name ?? listing.title,
  });

  return succeed({
    message: "Listing updated",
    data: {
      id: input.listingId,
      ...input.payload,
    },
  });
}

export async function deleteListingByIdService(
  listingId: ListingIdParam,
): Promise<DomainResult<DeleteListingResponse>> {
  const actorResult = await requireListingWriteActor();

  if (!actorResult.ok) {
    return actorResult;
  }

  const listing = await findListingRecordById(listingId);

  if (!listing) {
    return fail("not_found", "Listing not found");
  }

  if (
    !canEditListing(
      {
        ownerUserId: listing.property.ownerUserId,
        status: listing.status,
      },
      actorResult.value.actor,
    )
  ) {
    return fail("forbidden", "Forbidden");
  }

  await archiveListing({
    listingId,
    publishedAt: listing.publishedAt,
    actorUserId: actorResult.value.actor.userId,
  });

  return succeed({
    message: "Listing deleted",
    data: {
      id: listingId,
    },
  });
}

async function requireListingWriteActor(): Promise<
  DomainResult<{
    actor: {
      userId: string;
      role: Exclude<ListingActor["role"], null>;
    };
  }>
> {
  const optionalSession = await getAuthSession();

  if (!optionalSession.session || !optionalSession.authzUser) {
    return fail("unauthorized", "Unauthorized");
  }

  const actor = {
    userId: optionalSession.session.user.id,
    role: optionalSession.authzUser.role,
  };

  if (!canWriteListing(actor)) {
    return fail("forbidden", "Forbidden");
  }

  return succeed({
    actor: {
      userId: actor.userId,
      role: actor.role,
    },
  });
}

function toListingActor(optionalSession: OptionalSessionResult): ListingActor {
  if (!optionalSession.session || !optionalSession.authzUser) {
    return {
      userId: null,
      role: null,
    };
  }

  return {
    userId: optionalSession.session.user.id,
    role: optionalSession.authzUser.role,
  };
}

async function buildListingDetailsResponse(listing: ListingRecord): Promise<ListingDetails> {
  const imageRows = await findListingImagesByListingId(listing.id);

  const enabledDefinitionKeys = getEnabledBooleanCustomFieldKeys(listing.customFields);
  const featureDefinitions = await findPublicFeatureDefinitionsByKeys(enabledDefinitionKeys);

  return {
    id: listing.id,
    title: listing.title,
    unitNumber: listing.unitNumber ?? undefined,
    price: centsToDollars(listing.monthlyRentCents),
    address: {
      street1: listing.property.street1,
      city: listing.property.city,
      province: listing.property.province,
      postalCode: listing.property.postalCode,
    },
    beds: listing.bedrooms,
    baths: listing.bathrooms,
    sqft: getListingSquareFeet(listing.squareFeet, listing.customFields),
    accessibilityFeatures: getStoredAccessibilityFeatures(listing.customFields),
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

function resolveNextApplicationUrl(input: {
  payload: UpdateListingInput;
  listingApplicationUrl: string | null;
  listingCustomFields: ListingCustomFields;
  nextCustomFields: ListingCustomFields;
}) {
  const effectiveApplicationMethod =
    getStoredApplicationMethod(input.nextCustomFields) ??
    getStoredApplicationMethod(input.listingCustomFields) ??
    (input.listingApplicationUrl ? "external_link" : "internal");
  const hasExplicitExternalApplicationUrlUpdate =
    input.payload.externalApplicationUrl !== undefined;

  if (effectiveApplicationMethod !== "external_link") {
    input.nextCustomFields.externalApplicationUrl = null;
  }

  const nextExternalApplicationUrl = getStoredExternalApplicationUrl(input.nextCustomFields);
  const nextApplicationUrl =
    effectiveApplicationMethod === "external_link"
      ? hasExplicitExternalApplicationUrlUpdate
        ? (nextExternalApplicationUrl ?? null)
        : nextExternalApplicationUrl === undefined
          ? input.listingApplicationUrl
          : nextExternalApplicationUrl
      : null;

  if (effectiveApplicationMethod === "external_link" && !nextApplicationUrl) {
    return {
      ok: false as const,
      message: "External application URL is required when applicationMethod is external_link.",
    };
  }

  return {
    ok: true as const,
    nextApplicationUrl,
  };
}
