import { TypedNextResponse } from "next-rest-framework";

import { db } from "@/db";
import { listingImages, listings, properties, type ListingStatus } from "@/db/schema";
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
} from "@/shared/schemas/listings";

export async function getListingsHandler(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const statusValue = searchParams.get("status");
  const status: ListingStatus | null =
    statusValue === "draft" || statusValue === "published" || statusValue === "archived"
      ? statusValue
      : null;
  const neighborhood = searchParams.get("neighborhood");
  const bedroomsValue = searchParams.get("bedrooms");
  const bedrooms = bedroomsValue ? Number(bedroomsValue) : null;
  const maxRent = searchParams.get("maxRent");
  const accessibility = searchParams.get("accessibility") ?? undefined;
  const search = searchParams.get("search");

  const optionalSession =
    status === "draft" || status === "archived"
      ? await getOptionalSession()
      : { session: null, authzUser: null };

  const payload = await readListings({
    page,
    limit,
    status,
    neighborhood,
    bedrooms,
    maxRent,
    accessibility:
      accessibility === "true" || accessibility === "false" ? accessibility : undefined,
    search,
    auth: toListingReadContext(optionalSession),
  });

  return TypedNextResponse.json<ListingListResponse, 200, "application/json">(payload);
}

export async function createListingHandler(request: Request) {
  const sessionResult = await requireListingWriteSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  const { session } = sessionResult;
  const body = (await request.json()) as CreateListingInput;
  const primaryUnit = body.units[0];

  if (!primaryUnit) {
    return TypedNextResponse.json<{ message: string }, 400, "application/json">(
      { message: "At least one unit is required" },
      { status: 400 },
    );
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
        monthlyRentCents: primaryUnit.rent * 100,
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
