import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { db } from "@/db";
import { listings, properties } from "@/db/schema";
import { requireListingWriteSession } from "@/lib/auth/session";
import {
  type ListingDetails,
  listingRouteParamsSchema,
  type ListingIdParam,
  updateListingSchema,
} from "@/shared/schemas/listings";

const details: ListingDetails = {
  id: "11111111-1111-4111-8111-111111111111",
  price: 100000,
  address: "123 Main St",
  city: "Waterloo",
  beds: 3,
  baths: 2,
  sqft: 100,
  images: [
    { url: "https://picsum.photos/id/1048/1200/800", caption: "Front exterior of the building" },
    { url: "https://picsum.photos/id/1068/1200/800", caption: "Living room with natural light" },
    { url: "https://picsum.photos/id/1084/1200/800", caption: "Primary bedroom" },
    { url: "https://picsum.photos/id/1025/1200/800", caption: "Accessible entry pathway" },
  ],
  timeAgo: "2 days ago",
  features: [
    {
      categoryName: "Accessibility",
      features: [
        { name: "braille", description: "description of this" },
        { name: "wheelchair", description: "description of this" },
        { name: "ramp", description: "description of this" },
      ],
    },
  ],
};

export const { GET, PUT, DELETE } = route({
  getListingById: routeOperation({
    method: "GET",
  })
    .input({
      params: listingRouteParamsSchema,
    })
    .handler((_request, { params }) => {
      const { id } = params;

      if (id !== details.id) {
        return NextResponse.json({ message: "Listing not found" }, { status: 404 });
      }

      return NextResponse.json({
        data: details,
      });
    }),

  updateListingById: routeOperation({
    method: "PUT",
  })
    .input({
      params: listingRouteParamsSchema,
      contentType: "application/json",
      body: updateListingSchema,
    })
    .handler(async (request, { params }) => {
      const { response } = await requireOwnedListingForWrite(params.id);

      if (response) {
        return response;
      }

      const body = await request.json();

      // TODO: update listing in database

      return NextResponse.json({
        message: "Listing updated",
        data: { id: params.id, ...body },
      });
    }),

  deleteListingById: routeOperation({
    method: "DELETE",
  })
    .input({
      params: listingRouteParamsSchema,
    })
    .handler(async (_request, { params }) => {
      const { response } = await requireOwnedListingForWrite(params.id);

      if (response) {
        return response;
      }

      // TODO: soft-delete / archive listing in database

      return NextResponse.json({
        message: "Listing deleted",
        data: { id: params.id },
      });
    }),
});

async function requireOwnedListingForWrite(listingId: ListingIdParam) {
  const { response, session, authzUser } = await requireListingWriteSession();

  if (response || !session || !authzUser) {
    return {
      response: response ?? new NextResponse("Forbidden", { status: 403 }),
    };
  }

  const [listing] = await db
    .select({
      id: listings.id,
      ownerUserId: properties.ownerUserId,
    })
    .from(listings)
    .innerJoin(properties, eq(listings.propertyId, properties.id))
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return {
      response: new NextResponse("Listing not found", { status: 404 }),
    };
  }

  if (authzUser.role !== "admin" && listing.ownerUserId !== session.user.id) {
    return {
      response: new NextResponse("Forbidden", { status: 403 }),
    };
  }

  return { response: null };
}
