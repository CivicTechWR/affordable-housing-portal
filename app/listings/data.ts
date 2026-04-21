import type { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import type { ListingSummary } from "@/shared/schemas/listings";
import { getCustomListingFieldsService } from "@/lib/custom-listing-fields/custom-listing-field.service";
import { MOCK_LISTING_ID_PRIMARY, MOCK_LISTING_ID_SECONDARY } from "./mockListingIds";

export interface ListingsDashboardData {
  listings: ListingSummary[];
  dynamicGroups: DynamicFilterGroup[];
}

const MOCK_LISTINGS: ListingSummary[] = [
  {
    id: MOCK_LISTING_ID_PRIMARY,
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
    id: MOCK_LISTING_ID_SECONDARY,
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

export async function getListingsDashboardData(): Promise<ListingsDashboardData> {
  const fieldsResponse = await getCustomListingFieldsService({
    publicOnly: "true",
    filterableOnly: "true",
    type: "boolean",
  });

  const dynamicGroups: DynamicFilterGroup[] = fieldsResponse.data.map((group) => ({
    groupId: group.groupId,
    groupLabel: group.groupLabel,
    options: group.options.map((option) => ({
      id: option.id,
      label: option.label,
      type: "boolean" as const,
    })),
  }));

  // TODO: Replace with API/database reads when listings index data is available.
  return {
    listings: MOCK_LISTINGS,
    dynamicGroups,
  };
}
