import { NextRequest } from "next/server";

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

  // TODO: fetch listing from database by id
  // TODO: return 404 if not found

  return Response.json({
    data: {
      id,
      name: null,
      description: null,
      address: null,
      units: [],
      amenities: [],
      accessibilityFeatures: [],
      applicationMethod: null,
      externalApplicationUrl: null,
      eligibilityCriteria: null,
      images: [],
      contact: null,
      status: null,
      createdAt: null,
      updatedAt: null,
    },
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
