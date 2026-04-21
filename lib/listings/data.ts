import type {
  ListingDetail,
  ListingFeatureGroup,
  ListingsQuery,
  ListingsResponse,
  ListingSortOption,
  ListingSummary,
} from "@/lib/listings/types";

export const LISTING_FEATURE_GROUPS: ListingFeatureGroup[] = [
  {
    groupId: "building-features",
    groupLabel: "Building Features",
    options: [
      { id: "parking", label: "Parking", type: "boolean" },
      { id: "laundry", label: "Laundry", type: "boolean" },
      { id: "elevator", label: "Elevator", type: "boolean" },
      { id: "balcony", label: "Balcony", type: "boolean" },
    ],
  },
  {
    groupId: "accessibility",
    groupLabel: "Accessibility",
    options: [
      { id: "step-free", label: "Step-free entry", type: "boolean" },
      { id: "wide-hallways", label: "Wide hallways", type: "boolean" },
      { id: "wheelchair", label: "Wheelchair accessible", type: "boolean" },
    ],
  },
];

const LISTING_FIXTURES: ListingDetail[] = [
  {
    id: "listing-1",
    name: "Erb Street Apartments",
    description: "Bright two-bedroom apartment close to downtown Waterloo amenities.",
    price: 1825,
    address: "45 Erb St W",
    city: "Waterloo",
    neighborhood: "Uptown",
    beds: 2,
    baths: 1,
    sqft: 840,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=340&fit=crop",
    timeAgo: "2 days ago",
    lat: 43.4636,
    lng: -80.5264,
    features: ["parking", "laundry", "balcony"],
    availableFrom: "2026-05-01",
    listedAt: "2026-04-19T10:00:00.000Z",
    status: "active",
    units: [
      { bedrooms: 2, bathrooms: 1, sqft: 840, rent: 1825, availableDate: "2026-05-01" },
    ],
    amenities: ["On-site laundry", "Surface parking", "Pet friendly"],
    accessibilityFeatures: ["Step-free entry"],
    applicationMethod: "external_link",
    externalApplicationUrl: "https://example.org/apply/erb-street",
    eligibilityCriteria: {
      maxIncome: 72000,
      minAge: null,
      housingType: "Family",
    },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&fit=crop"],
    contact: {
      name: "Waterloo Housing Team",
      email: "leasing@waterloohousing.example",
      phone: "519-555-0101",
    },
    createdAt: "2026-04-19T10:00:00.000Z",
    updatedAt: "2026-04-20T14:00:00.000Z",
  },
  {
    id: "listing-2",
    name: "King Street Family Suites",
    description: "Three-bedroom family suites with elevator access in central Kitchener.",
    price: 2140,
    address: "18 King St N",
    city: "Kitchener",
    neighborhood: "Downtown",
    beds: 3,
    baths: 2,
    sqft: 1040,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=340&fit=crop",
    timeAgo: "5 hours ago",
    lat: 43.4516,
    lng: -80.4925,
    features: ["parking", "elevator", "laundry", "wheelchair"],
    availableFrom: "2026-06-15",
    listedAt: "2026-04-21T08:00:00.000Z",
    status: "active",
    units: [
      { bedrooms: 3, bathrooms: 2, sqft: 1040, rent: 2140, availableDate: "2026-06-15" },
    ],
    amenities: ["Community room", "Elevator", "Bike storage"],
    accessibilityFeatures: ["Wheelchair accessible", "Wide hallways"],
    applicationMethod: "internal",
    externalApplicationUrl: null,
    eligibilityCriteria: {
      maxIncome: 88000,
      minAge: null,
      housingType: "Family",
    },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&fit=crop"],
    contact: {
      name: "Kitchener Housing Co-op",
      email: "apply@kitchenerhousing.example",
      phone: "519-555-0102",
    },
    createdAt: "2026-04-21T08:00:00.000Z",
    updatedAt: "2026-04-21T08:00:00.000Z",
  },
  {
    id: "listing-3",
    name: "Weber Street Studios",
    description: "Compact one-bedroom suites designed for quick transit access and low maintenance.",
    price: 1595,
    address: "77 Weber St E",
    city: "Waterloo",
    neighborhood: "Midtown",
    beds: 1,
    baths: 1,
    sqft: 610,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=340&fit=crop",
    timeAgo: "Just listed",
    lat: 43.4668,
    lng: -80.5087,
    features: ["laundry", "step-free"],
    availableFrom: "2026-05-10",
    listedAt: "2026-04-21T11:30:00.000Z",
    status: "active",
    units: [
      { bedrooms: 1, bathrooms: 1, sqft: 610, rent: 1595, availableDate: "2026-05-10" },
    ],
    amenities: ["Near transit", "Secure entry"],
    accessibilityFeatures: ["Step-free entry"],
    applicationMethod: "paper",
    externalApplicationUrl: null,
    eligibilityCriteria: {
      maxIncome: 54000,
      minAge: null,
      housingType: "Single",
    },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&fit=crop"],
    contact: {
      name: "Midtown Housing Services",
      email: "homes@midtownhousing.example",
      phone: "519-555-0103",
    },
    createdAt: "2026-04-21T11:30:00.000Z",
    updatedAt: "2026-04-21T11:30:00.000Z",
  },
  {
    id: "listing-4",
    name: "Duke Street Townhomes",
    description: "Spacious homes for larger households in Cambridge with family-oriented amenities.",
    price: 2475,
    address: "12 Duke St",
    city: "Cambridge",
    neighborhood: "Galt",
    beds: 3,
    baths: 2,
    sqft: 1220,
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=340&fit=crop",
    timeAgo: "1 week ago",
    lat: 43.3601,
    lng: -80.3149,
    features: ["parking", "balcony", "laundry"],
    availableFrom: "2026-07-01",
    listedAt: "2026-04-14T09:00:00.000Z",
    status: "active",
    units: [
      { bedrooms: 3, bathrooms: 2, sqft: 1220, rent: 2475, availableDate: "2026-07-01" },
    ],
    amenities: ["Play area", "Parking", "Private outdoor space"],
    accessibilityFeatures: [],
    applicationMethod: "external_link",
    externalApplicationUrl: "https://example.org/apply/duke-townhomes",
    eligibilityCriteria: {
      maxIncome: 93000,
      minAge: null,
      housingType: "Family",
    },
    images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&fit=crop"],
    contact: {
      name: "Cambridge Affordable Living",
      email: "homes@cambridgeal.example",
      phone: "519-555-0104",
    },
    createdAt: "2026-04-14T09:00:00.000Z",
    updatedAt: "2026-04-18T12:15:00.000Z",
  },
  {
    id: "listing-5",
    name: "Cedar Creek Seniors Housing",
    description: "Accessible one-bedroom homes with support services for older adults.",
    price: 1380,
    address: "9 Cedar Creek Rd",
    city: "Kitchener",
    neighborhood: "Forest Heights",
    beds: 1,
    baths: 1,
    sqft: 590,
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&h=340&fit=crop",
    timeAgo: "3 days ago",
    lat: 43.4301,
    lng: -80.5364,
    features: ["elevator", "step-free", "wide-hallways", "wheelchair"],
    availableFrom: "2026-05-20",
    listedAt: "2026-04-18T16:00:00.000Z",
    status: "active",
    units: [
      { bedrooms: 1, bathrooms: 1, sqft: 590, rent: 1380, availableDate: "2026-05-20" },
    ],
    amenities: ["Common lounge", "Elevator", "Support desk"],
    accessibilityFeatures: ["Step-free entry", "Wide hallways", "Wheelchair accessible"],
    applicationMethod: "internal",
    externalApplicationUrl: null,
    eligibilityCriteria: {
      maxIncome: 48000,
      minAge: 55,
      housingType: "Senior",
    },
    images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&fit=crop"],
    contact: {
      name: "Cedar Creek Residence",
      email: "intake@cedarcreek.example",
      phone: "519-555-0105",
    },
    createdAt: "2026-04-18T16:00:00.000Z",
    updatedAt: "2026-04-20T09:30:00.000Z",
  },
  {
    id: "listing-6",
    name: "Victoria Park Accessible Flats",
    description: "Two-bedroom apartments near Victoria Park with step-free entry and balconies.",
    price: 1960,
    address: "210 Park St",
    city: "Kitchener",
    neighborhood: "Victoria Park",
    beds: 2,
    baths: 2,
    sqft: 915,
    imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=340&fit=crop",
    timeAgo: "1 day ago",
    lat: 43.4464,
    lng: -80.4991,
    features: ["balcony", "laundry", "step-free", "parking"],
    availableFrom: "2026-05-05",
    listedAt: "2026-04-20T15:30:00.000Z",
    status: "active",
    units: [
      { bedrooms: 2, bathrooms: 2, sqft: 915, rent: 1960, availableDate: "2026-05-05" },
    ],
    amenities: ["Balcony", "In-suite laundry", "Near park"],
    accessibilityFeatures: ["Step-free entry"],
    applicationMethod: "external_link",
    externalApplicationUrl: "https://example.org/apply/victoria-park",
    eligibilityCriteria: {
      maxIncome: 76000,
      minAge: null,
      housingType: "Family",
    },
    images: ["https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&fit=crop"],
    contact: {
      name: "Victoria Park Housing",
      email: "leasing@victoriapark.example",
      phone: "519-555-0106",
    },
    createdAt: "2026-04-20T15:30:00.000Z",
    updatedAt: "2026-04-20T18:00:00.000Z",
  },
];

function normalizeSearchValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function matchesBathroomFilter(baths: number, requestedBathrooms: number) {
  if (requestedBathrooms >= 4) {
    return baths >= requestedBathrooms;
  }

  return baths >= requestedBathrooms;
}

function matchesBedroomFilter(beds: number, requestedBedrooms: number) {
  if (requestedBedrooms >= 4) {
    return beds >= requestedBedrooms;
  }

  return beds === requestedBedrooms;
}

function sortListings(listings: ListingDetail[], sort: ListingSortOption) {
  const sorted = [...listings];

  sorted.sort((left, right) => {
    if (sort === "price_asc") {
      return left.price - right.price;
    }

    if (sort === "price_desc") {
      return right.price - left.price;
    }

    return Date.parse(right.listedAt) - Date.parse(left.listedAt);
  });

  return sorted;
}

export function listListings(query: ListingsQuery): ListingsResponse {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 20);
  const location = normalizeSearchValue(query.location);
  const selectedMoveInDate = query.moveInDate ? Date.parse(query.moveInDate) : null;
  const selectedFeatures = query.features ?? [];
  const sort = query.sort ?? "newest";

  const filtered = LISTING_FIXTURES.filter((listing) => {
    if (listing.status !== "active") {
      return false;
    }

    if (
      location &&
      !`${listing.address} ${listing.city} ${listing.neighborhood}`.toLowerCase().includes(location)
    ) {
      return false;
    }

    if (query.minPrice != null && listing.price < query.minPrice) {
      return false;
    }

    if (query.maxPrice != null && listing.price > query.maxPrice) {
      return false;
    }

    if (query.bedrooms != null && !matchesBedroomFilter(listing.beds, query.bedrooms)) {
      return false;
    }

    if (query.bathrooms != null && !matchesBathroomFilter(listing.baths, query.bathrooms)) {
      return false;
    }

    if (selectedMoveInDate != null && Date.parse(listing.availableFrom) > selectedMoveInDate) {
      return false;
    }

    if (selectedFeatures.length > 0 && !selectedFeatures.every((feature) => listing.features.includes(feature))) {
      return false;
    }

    return true;
  });

  const sorted = sortListings(filtered, sort);
  const total = sorted.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: sorted.slice(start, end).map((listing) => toListingSummary(listing)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    availableFilters: {
      featureGroups: LISTING_FEATURE_GROUPS,
    },
  };
}

export function getListingById(id: string) {
  return LISTING_FIXTURES.find((listing) => listing.id === id) ?? null;
}

export function toListingSummary(listing: ListingDetail): ListingSummary {
  return {
    id: listing.id,
    price: listing.price,
    address: listing.address,
    city: listing.city,
    neighborhood: listing.neighborhood,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    imageUrl: listing.imageUrl,
    timeAgo: listing.timeAgo,
    lat: listing.lat,
    lng: listing.lng,
    features: listing.features,
    availableFrom: listing.availableFrom,
    listedAt: listing.listedAt,
    status: listing.status,
  };
}
