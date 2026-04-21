export type ListingSortOption = "newest" | "price_asc" | "price_desc";

export interface ListingFeatureOption {
  id: string;
  label: string;
  type: "boolean";
}

export interface ListingFeatureGroup {
  groupId: string;
  groupLabel: string;
  options: ListingFeatureOption[];
}

export interface ListingSummary {
  id: string;
  price: number;
  address: string;
  city: string;
  neighborhood: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl?: string;
  timeAgo: string;
  lat: number;
  lng: number;
  features: string[];
  availableFrom: string;
  listedAt: string;
  status: "active" | "draft";
}

export interface ListingUnit {
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  availableDate: string;
}

export interface ListingDetail extends ListingSummary {
  name: string;
  description: string;
  units: ListingUnit[];
  amenities: string[];
  accessibilityFeatures: string[];
  applicationMethod: "internal" | "external_link" | "paper";
  externalApplicationUrl: string | null;
  eligibilityCriteria: {
    maxIncome: number | null;
    minAge: number | null;
    housingType: string | null;
  };
  images: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListingsQuery {
  page?: number | null;
  limit?: number | null;
  location?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  moveInDate?: string | null;
  sort?: ListingSortOption | null;
  features?: string[] | null;
}

export interface ListingsResponse {
  data: ListingSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  availableFilters: {
    featureGroups: ListingFeatureGroup[];
  };
}
