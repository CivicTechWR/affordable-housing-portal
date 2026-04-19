import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { requireListingWriteSession } from "@/lib/auth/session";
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
    .handler((request) => {
      const { searchParams } = request.nextUrl;

      const page = Number(searchParams.get("page") ?? 1);
      const limit = Number(searchParams.get("limit") ?? 20);
      const status = searchParams.get("status");
      const neighborhood = searchParams.get("neighborhood");
      const bedrooms = searchParams.get("bedrooms");
      const maxRent = searchParams.get("maxRent");
      const accessibility = searchParams.get("accessibility");
      const search = searchParams.get("search");

      // TODO: query database with filters
      void [page, limit, status, neighborhood, bedrooms, maxRent, accessibility, search];

      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
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
    ])
    .handler(async (request) => {
      const { response } = await requireListingWriteSession();

      if (response) {
        return response;
      }

      const body = await request.json();
      const createdListingId = crypto.randomUUID();

      // TODO: persist to database

      return NextResponse.json(
        { message: "Listing created", data: { id: createdListingId, ...body } },
        { status: 201 },
      );
    }),
});
