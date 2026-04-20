import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { db } from "@/db";
import {
  customListingFields,
  listingImages,
  listings,
  properties,
  type ListingCustomFields,
} from "@/db/schema";
import { getOptionalSession, requireListingWriteSession } from "@/lib/auth/session";
import {
  buildListingFeatureCategories,
  centsToDollars,
  dollarsToCents,
  formatListingAddress,
  formatListingTimeAgo,
  getEnabledBooleanCustomFieldKeys,
  getStoredApplicationMethod,
  getStoredEligibilityCriteria,
  getStoredExternalApplicationUrl,
  getStoredUnits,
  getListingSquareFeet,
  mergeListingCustomFields,
  resolveListingStatusTimestamps,
} from "@/lib/listings/store";
import { errorMessageSchema } from "@/shared/schemas/common";
import {
  deleteListingResponseSchema,
  listingByIdResponseSchema,
  listingParamsSchema,
  type ListingIdParam,
  updateListingResponseSchema,
  updateListingSchema,
} from "@/shared/schemas/listings";

export const { GET, PUT, DELETE } = route({
  getListingById: routeOperation({
    method: "GET",
  })
    .input({
      params: listingParamsSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: listingByIdResponseSchema,
      },
      {
        status: 404,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 400,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (_request, { params }) => {
      const optionalSession = await getOptionalSession();
      const listing = await getListingRecord(params.id);

      if (!listing || !canReadListing(listing, optionalSession)) {
        return NextResponse.json({ message: "Listing not found" }, { status: 404 });
      }

      const details = await buildListingDetailsResponse(listing);

      return NextResponse.json({
        data: details,
      });
    }),

  updateListingById: routeOperation({
    method: "PUT",
  })
    .input({
      params: listingParamsSchema,
      contentType: "application/json",
      body: updateListingSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: updateListingResponseSchema,
      },
      {
        status: 401,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 403,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 404,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 400,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (request, { params }) => {
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
        return NextResponse.json(
          {
            message:
              "External application URL is required when applicationMethod is external_link.",
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
                : (dollarsToCents(nextEligibility.maxIncome ?? undefined) ??
                  listing.maxIncomeCents),
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

      return NextResponse.json({
        message: "Listing updated",
        data: { id: params.id, ...body },
      });
    }),

  deleteListingById: routeOperation({
    method: "DELETE",
  })
    .input({
      params: listingParamsSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: deleteListingResponseSchema,
      },
      {
        status: 401,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 403,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 404,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (_request, { params }) => {
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

      return NextResponse.json({
        message: "Listing deleted",
        data: { id: params.id },
      });
    }),
});

async function buildListingDetailsResponse(listing: Awaited<ReturnType<typeof getListingRecord>>) {
  if (!listing) {
    throw new Error("Listing is required.");
  }

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
    price: centsToDollars(listing.monthlyRentCents),
    address: formatListingAddress(listing.property.street1, listing.unitNumber),
    city: listing.property.city,
    description: listing.description,
    beds: listing.bedrooms,
    baths: listing.bathrooms,
    sqft: getListingSquareFeet(listing.squareFeet, listing.customFields),
    units: getStoredUnits(listing.customFields).map((unit) => ({
      bedrooms: unit.bedrooms ?? listing.bedrooms,
      bathrooms: unit.bathrooms ?? listing.bathrooms,
      sqft: unit.sqft ?? getListingSquareFeet(listing.squareFeet, listing.customFields),
      rent: unit.rent ?? centsToDollars(listing.monthlyRentCents),
      availableDate:
        unit.availableDate ??
        listing.availableOn ??
        new Date(listing.createdAt).toISOString().slice(0, 10),
    })),
    images: imageRows.map((image) => ({
      url: image.imageUrl,
      caption: image.altText ?? `${listing.title} image`,
    })),
    timeAgo: formatListingTimeAgo(listing.publishedAt, listing.createdAt),
    features: buildListingFeatureCategories(listing.customFields, featureDefinitions),
  };
}

async function getListingRecord(listingId: ListingIdParam) {
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

function canReadListing(
  listing: NonNullable<Awaited<ReturnType<typeof getListingRecord>>>,
  sessionResult: Awaited<ReturnType<typeof getOptionalSession>>,
) {
  if (listing.status === "published") {
    return true;
  }

  if (!sessionResult.session || !sessionResult.authzUser) {
    return false;
  }

  return (
    sessionResult.authzUser.role === "admin" ||
    listing.property.ownerUserId === sessionResult.session.user.id
  );
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

  const listing = await getListingRecord(listingId);

  if (!listing) {
    return {
      response: NextResponse.json<{ message: string }>(
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
      response: NextResponse.json<{ message: string }>({ message: "Forbidden" }, { status: 403 }),
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
