import { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

type ListingFeature = {
  name: string;
  description: string;
};

type ListingFeatureCategory = {
  categoryName: string;
  features: ListingFeature[];
};

type ListingImage = {
  url: string;
  caption: string;
};

type ListingDetails = {
  id: string;
  price: number;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  images: ListingImage[];
  timeAgo: string;
  features: ListingFeatureCategory[];
};

const details: ListingDetails = {
  id: "1",
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

/**
 * GET /api/listings/:id
 *
 * Returns a single listing by ID, including full detail:
 * units, eligibility criteria, accessibility features,
 * application instructions, and contact info.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (id !== details.id) {
    return Response.json({ message: "Listing not found" }, { status: 404 });
  }

  return Response.json({
    data: details,
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
