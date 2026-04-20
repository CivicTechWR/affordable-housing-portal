import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { db } from "@/db";
import { listingImages, listings, properties } from "@/db/schema";
import { getOptionalSession, requireListingWriteSession } from "@/lib/auth/session";
import { readListings, toListingReadContext } from "@/lib/listings/queries";
import {
  buildListingCustomFields,
  DEFAULT_PROPERTY_COUNTRY,
  dollarsToCents,
  resolveListingStatusTimestamps,
} from "@/lib/listings/store";
import type {
  CreateListingInput,
  CreateListingResponse,
  ListingListResponse,
  ListingQuery,
} from "@/shared/schemas/listings";
import { listingQuerySchema } from "@/shared/schemas/listings";

export async function getListingsHandler(
  request: TypedNextRequest<"GET", string, unknown, ListingQuery>,
) {
  const query = listingQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

  const optionalSession =
    query.status === "draft" || query.status === "archived"
      ? await getOptionalSession()
      : { session: null, authzUser: null };

  const payload = await readListings({
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 20,
    status: query.status ?? null,
    neighborhood: query.neighborhood ?? null,
    bedrooms: query.bedrooms ? Number(query.bedrooms) : null,
    maxRent: query.maxRent ?? null,
    accessibility: query.accessibility,
    search: query.search ?? null,
    auth: toListingReadContext(optionalSession),
  });

  return TypedNextResponse.json<ListingListResponse, 200, "application/json">(payload);
}

export async function createListingHandler(
  request: TypedNextRequest<"POST", "application/json", CreateListingInput>,
) {
  const sessionResult = await requireListingWriteSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  const { session } = sessionResult;
  const body = await request.json();
  const primaryUnit = body.units[0];

  if (!primaryUnit) {
    return TypedNextResponse.json<{ message: string }, 400, "application/json">(
      { message: "At least one unit is required" },
      { status: 400 },
    );
  }
  const primaryUnitRentCents = dollarsToCents(primaryUnit.rent);

  if (primaryUnitRentCents === null) {
    throw new Error("Primary unit rent is required.");
  }

  const statusTimestamps = resolveListingStatusTimestamps(body.status);
  const customFields = buildListingCustomFields(body);

  const createdListing = await db.transaction(async (tx) => {
    const [property] = await tx
      .insert(properties)
      .values({
        ownerUserId: session.user.id,
        name: body.name,
        street1: body.address.street,
        street2: null,
        city: body.address.city,
        province: body.address.province,
        postalCode: body.address.postalCode,
        country: DEFAULT_PROPERTY_COUNTRY,
        neighborhood: body.address.neighborhood ?? null,
        latitude: body.address.latitude ?? null,
        longitude: body.address.longitude ?? null,
        contactName: body.contact.name,
        contactEmail: body.contact.email,
        contactPhone: body.contact.phone,
        createdByUserId: session.user.id,
        updatedByUserId: session.user.id,
      })
      .returning({ id: properties.id });

    if (!property) {
      throw new Error("Failed to create property.");
    }

    const [listing] = await tx
      .insert(listings)
      .values({
        propertyId: property.id,
        createdByUserId: session.user.id,
        updatedByUserId: session.user.id,
        title: body.name,
        description: body.description,
        status: body.status,
        unitNumber: null,
        bedrooms: primaryUnit.bedrooms,
        bathrooms: primaryUnit.bathrooms,
        squareFeet: primaryUnit.sqft,
        monthlyRentCents: primaryUnitRentCents,
        availableOn: primaryUnit.availableDate,
        maxIncomeCents: dollarsToCents(body.eligibilityCriteria.maxIncome),
        applicationUrl:
          body.applicationMethod === "external_link" ? (body.externalApplicationUrl ?? null) : null,
        applicationEmail: body.contact.email,
        applicationPhone: body.contact.phone,
        applicationInstructions: null,
        customFields,
        publishedAt: statusTimestamps.publishedAt,
        archivedAt: statusTimestamps.archivedAt,
      })
      .returning({ id: listings.id });

    if (!listing) {
      throw new Error("Failed to create listing.");
    }

    if (body.images.length > 0) {
      await tx.insert(listingImages).values(
        body.images.map((imageUrl, index) => ({
          listingId: listing.id,
          imageUrl,
          altText: `${body.name} image ${index + 1}`,
          sortOrder: index,
        })),
      );
    }

    return listing;
  });

  return TypedNextResponse.json<CreateListingResponse, 201, "application/json">(
    { message: "Listing created", data: { id: createdListing.id, ...body } },
    { status: 201 },
  );
}
