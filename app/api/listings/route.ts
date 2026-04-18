import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { requireListingWriteSession } from "@/lib/auth/session";
import { createListingSchema, listingSearchQuerySchema } from "@/shared/schemas/listings";

export const { GET, POST } = route({
  getListings: routeOperation({
    method: "GET",
  })
    .input({
      query: listingSearchQuerySchema,
    })
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
    .handler(async (request) => {
      const { response } = await requireListingWriteSession();

      if (response) {
        return response;
      }

      const body = await request.json();

      // TODO: persist to database

      return NextResponse.json(
        { message: "Listing created", data: { id: "placeholder-id", ...body } },
        { status: 201 },
      );
    }),
});
