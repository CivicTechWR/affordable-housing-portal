import type { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import type { ListingSummary } from "@/shared/schemas/listings";

export interface ListingsDashboardData {
  listings: ListingSummary[];
  dynamicGroups: DynamicFilterGroup[];
}

const MOCK_LISTINGS: ListingSummary[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Sunny Downtown Loft",
    price: 2350,
    address: "123 Main St",
    city: "Waterloo",
    beds: 3,
    baths: 2,
    sqft: 1200,
    imageUrl:
      "https://images.pexels.com/photos/10117724/pexels-photo-10117724.jpeg?cs=srgb&dl=pexels-keeganjchecks-10117724.jpg&fm=jpg",
    timeAgo: "2 days ago",
    lat: 43.45055954361165,
    lng: -80.49228395260133,
    accessibilityFeatures: [
      {
        name: "Main Entrance is Barrier-Free",
        description: "The building's main entrance is level and accessible without stairs.",
      },
      {
        name: "Elevator in Building",
        description: "The building has at least one functioning passenger elevator.",
      },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Cozy Suburb Apartment",
    price: 145000,
    address: "456 King St N",
    city: "Waterloo",
    beds: 1,
    baths: 1,
    sqft: 650,
    timeAgo: "5 hours ago",
    lat: 43.468,
    lng: -80.525,
    accessibilityFeatures: [
      {
        name: "Main Entrance is Barrier-Free",
        description: "The building's main entrance is level and accessible without stairs.",
      },
      {
        name: "Unit Entrance is Barrier-Free",
        description: "The unit entrance has no raised threshold or steps.",
      },
    ],
  },
];

const DEFAULT_DYNAMIC_GROUPS: DynamicFilterGroup[] = [
  {
    groupId: "features",
    groupLabel: "Features",
    options: [
      { id: "beds", label: "Beds", type: "boolean" },
      { id: "baths", label: "Baths", type: "boolean" },
    ],
  },
];

export async function getListingsDashboardData(): Promise<ListingsDashboardData> {
  // TODO: Replace with API/database reads when listings index data is available.
  return {
    listings: MOCK_LISTINGS,
    dynamicGroups: DEFAULT_DYNAMIC_GROUPS,
  };
}
