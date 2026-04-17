import { useEffect, useState } from "react";
import { ListingFormData, INITIAL_FORM_DATA } from "./types";

export function useListingQuery(listingId?: string) {
  const [data, setData] = useState<ListingFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!listingId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      try {
        setData({
          ...INITIAL_FORM_DATA,
          title: "Modern Downtown Loft",
          description:
            "A beautiful, fully renovated loft right in the heart of downtown. Steps away from major transit lines and grocery stores.",
          propertyType: "Rent",
          buildingType: "Apartment",
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 750,
          monthlyRentCents: 185000,
          leaseTerm: "1 year",
          status: "published",
          unitNumber: "405",
          name: "The Hub Lofts",
          street1: "123 Main St",
          city: "Waterloo",
          province: "ON",
          postalCode: "N2L 3V3",
          contactName: "John Doe",
          contactEmail: "leasing@thehub.com",
          contactPhone: "555-0199",
          accessibilityFeatures: [
            "Main Entrance is Barrier-Free",
            "Elevator in Building",
            "Unit Entrance is Barrier-Free",
          ],
        });
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
