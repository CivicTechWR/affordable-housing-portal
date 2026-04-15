import { NextRequest } from "next/server";

import { requireListingWriteSession } from "@/lib/auth/session";

/**
 * GET /api/listings
 *
 * Returns a paginated list of affordable housing listings.
 * Supports query params for filtering and pagination:
 *   - ?page=1&limit=20
 *   - ?status=active
 *   - ?neighborhood=downtown
 *   - ?bedrooms=2
 *   - ?maxRent=1500
 *   - ?accessibility=true
 *   - ?search=keyword
 */
export async function GET(request: NextRequest) {
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

  return Response.json({
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  });
}

/**
 * POST /api/listings
 *
 * Creates a new housing listing. Requires authentication
 * (housing provider / property manager / admin).
 *
 * Expected body:
 * {
 *   name: string
 *   description: string
 *   address: { street, city, province, postalCode }
 *   units: [{ bedrooms, bathrooms, sqft, rent, availableDate }]
 *   amenities: string[]
 *   accessibilityFeatures: string[]
 *   applicationMethod: "internal" | "external_link" | "paper"
 *   externalApplicationUrl?: string
 *   eligibilityCriteria: { maxIncome?, minAge?, housingType? }
 *   images: string[]
 *   contact: { name, email, phone }
 *   status: "draft" | "active"
 * }
 */
export async function POST(request: NextRequest) {
  const { response } = await requireListingWriteSession();

  if (response) {
    return response;
  }

  const body = await request.json();

  // TODO: validate body schema
  // TODO: persist to database
  void body;

  return Response.json(
    { message: "Listing created", data: { id: "placeholder-id", ...body } },
    { status: 201 },
  );
}
