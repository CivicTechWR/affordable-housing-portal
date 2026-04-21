import { NextRequest } from "next/server";

import { getListingById } from "@/lib/listings/data";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/listings/:id
 *
 * Returns a single listing by ID, including full detail:
 * units, eligibility criteria, accessibility features,
 * application instructions, and contact info.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    return Response.json({ message: "Listing not found" }, { status: 404 });
  }

  return Response.json({
    data: listing,
  });
}

/**
 * PUT /api/listings/:id
 *
 * Updates an existing listing. Requires authentication
 * (the owning housing provider or an admin).
 *
 * Accepts a partial body — only provided fields are updated.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: authenticate request (must own listing or be admin)
  const body = await request.json();

  // TODO: validate body schema
  // TODO: update listing in database
  void body;

  return Response.json({
    message: "Listing updated",
    data: { id },
  });
}

/**
 * DELETE /api/listings/:id
 *
 * Deletes (or archives) a listing. Requires authentication
 * (the owning housing provider or an admin).
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: authenticate request (must own listing or be admin)
  // TODO: soft-delete / archive listing in database

  return Response.json({
    message: "Listing deleted",
    data: { id },
  });
}
