import { useEffect, useState } from "react";
import { ListingFormData } from "./types";

const MOCK_LISTING_DATA: ListingFormData = {
  title: "Modern Downtown Loft",
  description:
    "A beautiful, fully renovated loft right in the heart of downtown. Steps away from major transit lines and grocery stores.",
  propertyType: "Rent",
  buildingType: "Apartment",
  unitStory: undefined,
  bedrooms: 1,
  bathrooms: 1,
  squareFeet: 750,
  monthlyRentCents: 185000,
  leaseTerm: "1 year",
  utilitiesIncluded: [],
  images: [
    {
      url: "https://picsum.photos/id/1048/1200/800",
      caption: "Front entrance and shared walkway",
    },
    {
      url: "https://picsum.photos/id/1068/1200/800",
      caption: "Living room with natural sunlight",
    },
  ],
  availableOn: undefined,
  status: "published",
  unitNumber: "405",
  name: "The Hub Lofts",
  street1: "123 Main St",
  street2: "",
  city: "Waterloo",
  province: "ON",
  postalCode: "N2L 3V3",
  contactName: "John Doe",
  contactEmail: "leasing@thehub.com",
  contactPhone: "555-0199",
  customFeatures: [
    {
      category: "Entry & Exterior",
      id: "main_entrance_is_barrier_free",
      name: "Main Entrance is Barrier-Free",
      description:
        "The main building entrance has no steps or barriers and can be accessed without assistance.",
    },
    {
      category: "Building Amenities",
      id: "elevator_in_building",
      name: "Elevator in Building",
      description: "The building has at least one elevator for accessing upper floors.",
    },
    {
      category: "Unit Interior",
      id: "unit_entrance_is_barrier_free",
      name: "Unit Entrance is Barrier-Free",
      description: "The entrance to the unit has no steps or raised thresholds.",
    },
  ],
};

export function useGetListingQuery(listingId?: string) {
  const [data, setData] = useState<ListingFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!listingId) {
      setData(null);
      setIsError(false);
      setIsLoading(false);
      return;
    }

    setIsError(false);
    setIsLoading(true);
    const timer = setTimeout(() => {
      try {
        setData(MOCK_LISTING_DATA);
        setIsLoading(false);
      } catch {
        setIsError(true);
        setIsLoading(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [listingId]);

  return { data, isLoading, isError };
}
