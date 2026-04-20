import { and, asc, desc, eq, ilike, inArray, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { db } from "@/db";
import { listingImages, listings, properties, type ListingStatus } from "@/db/schema";
import { getOptionalSession, requireListingWriteSession } from "@/lib/auth/session";
import {
  buildListingCustomFields,
  centsToDollars,
  DEFAULT_PROPERTY_COUNTRY,
  dollarsToCents,
  formatListingAddress,
  formatListingTimeAgo,
  getListingCoordinates,
  getListingSquareFeet,
  resolveListingStatusTimestamps,
} from "@/lib/listings/store";
import { errorMessageSchema } from "@/shared/schemas/common";
import {
  createListingResponseSchema,
  createListingSchema,
  listingListResponseSchema,
  listingQuerySchema,
} from "@/shared/schemas/listings";

export const { GET, POST } = route({
  getListings: routeOperation({
    method: "GET",
  })
    .input({
      query: listingQuerySchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: listingListResponseSchema,
      },
    ])
    .handler(async (request) => {
      const { searchParams } = request.nextUrl;
      const optionalSession = await getOptionalSession();

      const page = Number(searchParams.get("page") ?? 1);
      const limit = Number(searchParams.get("limit") ?? 20);
      const status = searchParams.get("status");
      const neighborhood = searchParams.get("neighborhood");
      const bedrooms = searchParams.get("bedrooms");
      const maxRent = searchParams.get("maxRent");
      const accessibility = searchParams.get("accessibility");
      const search = searchParams.get("search");

      const visibility = getListingListVisibility(optionalSession, status);

      if (!visibility.isAccessible) {
        return NextResponse.json({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const filters = [eq(listings.status, visibility.status)];

      if (visibility.ownerUserId) {
        filters.push(eq(properties.ownerUserId, visibility.ownerUserId));
      }

      if (neighborhood) {
        filters.push(ilike(properties.neighborhood, `%${neighborhood}%`));
      }

      if (bedrooms) {
        filters.push(eq(listings.bedrooms, Number(bedrooms)));
      }

      if (maxRent) {
        filters.push(lte(listings.monthlyRentCents, Number(maxRent) * 100));
      }

      if (search) {
        const searchTerm = `%${search}%`;

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
      const allRows = await db
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
        .orderBy(desc(listings.publishedAt), desc(listings.createdAt));

      const filteredRows =
        accessibility === undefined
          ? allRows
          : allRows.filter((row) => {
              const hasAccessibility = hasAccessibilityArray(row.customFields);

              return accessibility === "true" ? hasAccessibility : !hasAccessibility;
            });

      const pagedRows = filteredRows.slice(offset, offset + limit);
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

      return NextResponse.json({
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
          total: filteredRows.length,
          totalPages: filteredRows.length === 0 ? 0 : Math.ceil(filteredRows.length / limit),
        },
      });
    }),

  createListing: routeOperation({
    method: "POST",
  })
    .input({
      contentType: "application/json",
      body: createListingSchema,
    })
    .outputs([
      {
        status: 201,
        contentType: "application/json",
        body: createListingResponseSchema,
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
        status: 400,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (request) => {
      const sessionResult = await requireListingWriteSession();

      if (sessionResult.response) {
        return sessionResult.response;
      }

      const { session } = sessionResult;
      const body = await request.json();
      const primaryUnit = body.units[0];

      if (!primaryUnit) {
        return NextResponse.json({ message: "At least one unit is required" }, { status: 400 });
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
              body.applicationMethod === "external_link"
                ? (body.externalApplicationUrl ?? null)
                : null,
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

      return NextResponse.json(
        { message: "Listing created", data: { id: createdListing.id, ...body } },
        { status: 201 },
      );
    }),
});

function getListingListVisibility(
  sessionResult: Awaited<ReturnType<typeof getOptionalSession>>,
  requestedStatus: string | null,
) {
  type ListingVisibility = {
    status: ListingStatus;
    ownerUserId: string | null;
    isAccessible: boolean;
  };

  if (requestedStatus === "draft" || requestedStatus === "archived") {
    if (sessionResult.authzUser?.role === "admin") {
      return {
        status: requestedStatus,
        ownerUserId: null,
        isAccessible: true,
      } satisfies ListingVisibility;
    }

    if (sessionResult.authzUser?.role === "partner" && sessionResult.session) {
      return {
        status: requestedStatus,
        ownerUserId: sessionResult.session.user.id,
        isAccessible: true,
      } satisfies ListingVisibility;
    }

    return {
      status: "published",
      ownerUserId: null,
      isAccessible: false,
    } satisfies ListingVisibility;
  }

  return {
    status: "published",
    ownerUserId: null,
    isAccessible: true,
  } satisfies ListingVisibility;
}

function hasAccessibilityArray(customFields: (typeof listings.$inferSelect)["customFields"]) {
  const value = customFields.accessibilityFeatures;

  return Array.isArray(value) && value.length > 0;
}
