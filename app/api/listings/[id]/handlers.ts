import { eq } from "drizzle-orm";
import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { db } from "@/db";
import { listingImages, listings, properties } from "@/db/schema";
import { getOptionalSession, requireListingWriteSession } from "@/lib/auth/session";
import {
  getListingRecordById,
  readListingById,
  toListingReadContext,
} from "@/lib/listings/queries";
import {
  dollarsToCents,
  getStoredApplicationMethod,
  getStoredEligibilityCriteria,
  getStoredExternalApplicationUrl,
  getStoredUnits,
  mergeListingCustomFields,
  resolveListingStatusTimestamps,
} from "@/lib/listings/store";
import type {
  DeleteListingResponse,
  ListingByIdResponse,
  ListingIdParam,
  ListingParams,
  UpdateListingInput,
  UpdateListingResponse,
} from "@/shared/schemas/listings";

type ListingByIdRouteContext = {
  params: ListingParams;
};

export async function getListingByIdHandler(
  _request: TypedNextRequest<"GET">,
  { params }: ListingByIdRouteContext,
) {
  const optionalSession = await getOptionalSession();
  const details = await readListingById({
    id: params.id,
    auth: toListingReadContext(optionalSession),
  });

  if (!details) {
    return TypedNextResponse.json<{ message: string }, 404, "application/json">(
      { message: "Listing not found" },
      { status: 404 },
    );
  }

  return TypedNextResponse.json<ListingByIdResponse, 200, "application/json">({
    data: details,
  });
}

export async function updateListingByIdHandler(
  request: TypedNextRequest<"PUT", "application/json", UpdateListingInput>,
  { params }: ListingByIdRouteContext,
) {
  const ownership = await requireOwnedListingForWrite(params.id);

  if (ownership.response) {
    return ownership.response;
  }

  const body = await request.json();
  const { session, listing } = ownership;

  const nextCustomFields = mergeListingCustomFields(listing.customFields, body);
  const nextUnits = getStoredUnits(nextCustomFields);
  const primaryUnit = nextUnits[0];
  const nextEligibility = getStoredEligibilityCriteria(nextCustomFields);
  const nextStatus = body.status ?? listing.status;
  const effectiveApplicationMethod =
    getStoredApplicationMethod(nextCustomFields) ??
    getStoredApplicationMethod(listing.customFields) ??
    (listing.applicationUrl ? "external_link" : "internal");
  const hasExplicitExternalApplicationUrlUpdate = body.externalApplicationUrl !== undefined;

  if (effectiveApplicationMethod !== "external_link") {
    nextCustomFields.externalApplicationUrl = null;
  }

  const nextExternalApplicationUrl = getStoredExternalApplicationUrl(nextCustomFields);
  const nextApplicationUrl =
    effectiveApplicationMethod === "external_link"
      ? hasExplicitExternalApplicationUrlUpdate
        ? (nextExternalApplicationUrl ?? null)
        : nextExternalApplicationUrl === undefined
          ? listing.applicationUrl
          : nextExternalApplicationUrl
      : null;

  if (effectiveApplicationMethod === "external_link" && !nextApplicationUrl) {
    return TypedNextResponse.json<{ message: string }, 400, "application/json">(
      {
        message: "External application URL is required when applicationMethod is external_link.",
      },
      { status: 400 },
    );
  }

  const statusTimestamps = resolveListingStatusTimestamps(nextStatus, {
    publishedAt: listing.publishedAt,
    archivedAt: listing.archivedAt,
  });

  await db.transaction(async (tx) => {
    await tx
      .update(properties)
      .set({
        name: body.name ?? listing.property.name,
        street1: body.address?.street ?? listing.property.street1,
        city: body.address?.city ?? listing.property.city,
        province: body.address?.province ?? listing.property.province,
        postalCode: body.address?.postalCode ?? listing.property.postalCode,
        neighborhood: body.address?.neighborhood ?? listing.property.neighborhood,
        latitude: body.address?.latitude ?? listing.property.latitude,
        longitude: body.address?.longitude ?? listing.property.longitude,
        contactName: body.contact?.name ?? listing.property.contactName,
        contactEmail: body.contact?.email ?? listing.property.contactEmail,
        contactPhone: body.contact?.phone ?? listing.property.contactPhone,
        updatedByUserId: session.user.id,
      })
      .where(eq(properties.id, listing.property.id));

    await tx
      .update(listings)
      .set({
        title: body.name ?? listing.title,
        description: body.description ?? listing.description,
        status: nextStatus,
        bedrooms: primaryUnit?.bedrooms ?? listing.bedrooms,
        bathrooms: primaryUnit?.bathrooms ?? listing.bathrooms,
        squareFeet: primaryUnit?.sqft ?? listing.squareFeet,
        monthlyRentCents:
          (typeof primaryUnit?.rent === "number" ? primaryUnit.rent * 100 : null) ??
          listing.monthlyRentCents,
        availableOn: primaryUnit?.availableDate ?? listing.availableOn,
        maxIncomeCents:
          nextEligibility.maxIncome === null
            ? null
            : (dollarsToCents(nextEligibility.maxIncome ?? undefined) ?? listing.maxIncomeCents),
        applicationUrl: nextApplicationUrl,
        applicationEmail: body.contact?.email ?? listing.applicationEmail,
        applicationPhone: body.contact?.phone ?? listing.applicationPhone,
        customFields: nextCustomFields,
        updatedByUserId: session.user.id,
        publishedAt: statusTimestamps.publishedAt,
        archivedAt: statusTimestamps.archivedAt,
      })
      .where(eq(listings.id, listing.id));

    if (body.images !== undefined) {
      await tx.delete(listingImages).where(eq(listingImages.listingId, listing.id));

      if (body.images.length > 0) {
        await tx.insert(listingImages).values(
          body.images.map((imageUrl, index) => ({
            listingId: listing.id,
            imageUrl,
            altText: `${body.name ?? listing.title} image ${index + 1}`,
            sortOrder: index,
          })),
        );
      }
    }
  });

  return TypedNextResponse.json<UpdateListingResponse, 200, "application/json">({
    message: "Listing updated",
    data: { id: params.id, ...body },
  });
}

export async function deleteListingByIdHandler(
  _request: TypedNextRequest<"DELETE">,
  { params }: ListingByIdRouteContext,
) {
  const ownership = await requireOwnedListingForWrite(params.id);

  if (ownership.response) {
    return ownership.response;
  }

  await db
    .update(listings)
    .set({
      status: "archived",
      archivedAt: new Date(),
      publishedAt: ownership.listing.publishedAt,
      updatedByUserId: ownership.session.user.id,
    })
    .where(eq(listings.id, params.id));

  return TypedNextResponse.json<DeleteListingResponse, 200, "application/json">({
    message: "Listing deleted",
    data: { id: params.id },
  });
}

async function requireOwnedListingForWrite(listingId: ListingIdParam) {
  const sessionResult = await requireListingWriteSession();

  if (sessionResult.response) {
    return {
      response: sessionResult.response,
      session: null,
      listing: null,
    };
  }

  const listing = await getListingRecordById(listingId);

  if (!listing) {
    return {
      response: TypedNextResponse.json<{ message: string }, 404, "application/json">(
        { message: "Listing not found" },
        { status: 404 },
      ),
      session: null,
      listing: null,
    };
  }

  if (
    sessionResult.authzUser.role !== "admin" &&
    listing.property.ownerUserId !== sessionResult.session.user.id
  ) {
    return {
      response: TypedNextResponse.json<{ message: string }, 403, "application/json">(
        { message: "Forbidden" },
        { status: 403 },
      ),
      session: null,
      listing: null,
    };
  }

  return {
    response: null,
    session: sessionResult.session,
    listing,
  };
}
