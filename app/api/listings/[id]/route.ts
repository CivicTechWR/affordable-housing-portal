import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { db } from "@/db";
import { listings, properties } from "@/db/schema";
import { requireListingWriteSession } from "@/lib/auth/session";
import { errorMessageSchema } from "@/shared/schemas/common";
import {
  deleteListingResponseSchema,
  listingByIdResponseSchema,
  type ListingDetails,
  listingParamsSchema,
  type ListingIdParam,
  updateListingResponseSchema,
  updateListingSchema,
} from "@/shared/schemas/listings";

const details: ListingDetails = {
  id: "11111111-1111-4111-8111-111111111111",
  price: 2350,
  address: {
    street1: "123 Main St",
    city: "Waterloo",
    province: "ON",
    postalCode: "N2L 3A1",
  },
  beds: 3,
  baths: 2,
  sqft: 1200,
  images: [
    {
      url: "https://images.pexels.com/photos/7746646/pexels-photo-7746646.jpeg?cs=srgb&dl=pexels-artbovich-7746646.jpg&fm=jpg",
      caption: "Open-concept living area and kitchen",
    },
    {
      url: "https://images.pexels.com/photos/10117724/pexels-photo-10117724.jpeg?cs=srgb&dl=pexels-keeganjchecks-10117724.jpg&fm=jpg",
      caption: "Bright apartment living room and dining area",
    },
    {
      url: "https://images.pexels.com/photos/7614411/pexels-photo-7614411.jpeg?cs=srgb&dl=pexels-artbovich-7614411.jpg&fm=jpg",
      caption: "Primary bedroom",
    },
    {
      url: "https://images.pexels.com/photos/26732551/pexels-photo-26732551.jpeg?cs=srgb&dl=pexels-pu-ca-adryan-163345030-26732551.jpg&fm=jpg",
      caption: "Modern apartment sitting room",
    },
  ],
  timeAgo: "2 days ago",
  features: [
    {
      categoryName: "Accessibility",
      features: [
        { name: "braille", description: "braille signage" },
        { name: "lowered counters", description: "lowered counters for wheelchair users" },
        { name: "ramp", description: "wheelchair accessible ramp" },
      ],
    },
  ],
};

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
    ])
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
    ])
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
  const sessionResult = await requireListingWriteSession();

  if (sessionResult.response) {
    return {
      response: sessionResult.response,
    };
  }

  const { session, authzUser } = sessionResult;

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
      response: NextResponse.json<{ message: string }>(
        { message: "Listing not found" },
        { status: 404 },
      ),
    };
  }

  if (authzUser.role !== "admin" && listing.ownerUserId !== session.user.id) {
    return {
      response: NextResponse.json<{ message: string }>({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return { response: null };
}
