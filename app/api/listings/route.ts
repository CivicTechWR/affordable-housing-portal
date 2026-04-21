import { NextRequest } from "next/server";

import { listListings } from "@/lib/listings/data";
import type { ListingSortOption, ListingsQuery } from "@/lib/listings/types";

function parseOptionalNumber(value: string | null) {
  if (value == null || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSortOption(value: string | null): ListingSortOption | null {
  if (value === "newest" || value === "price_asc" || value === "price_desc") {
    return value;
  }

  return null;
}

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

  const query: ListingsQuery = {
    page: parseOptionalNumber(searchParams.get("page")) ?? 1,
    limit: parseOptionalNumber(searchParams.get("limit")) ?? 20,
    location: searchParams.get("location"),
    minPrice: parseOptionalNumber(searchParams.get("minPrice")),
    maxPrice: parseOptionalNumber(searchParams.get("maxPrice")),
    bedrooms: parseOptionalNumber(searchParams.get("bedrooms")),
    bathrooms: parseOptionalNumber(searchParams.get("bathrooms")),
    moveInDate: searchParams.get("moveInDate"),
    sort: parseSortOption(searchParams.get("sort")) ?? "newest",
    features: searchParams.getAll("features"),
  };

  return Response.json(listListings(query));
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
  // TODO: authenticate request (housing provider / admin)
  const body = await request.json();

  // TODO: validate body schema
  // TODO: persist to database
  void body;

  return Response.json(
    { message: "Listing created", data: { id: "placeholder-id", ...body } },
    { status: 201 },
  );
}
