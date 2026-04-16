import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingFormSchema, ListingFormData, INITIAL_FORM_DATA } from "./types";

// Simulated fetch hook that mirrors what SWR / React Query would do
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
        // Return mock edit data when an ID is fetched normally
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
    }, 1200); // simulate 1.2s API load

    return () => clearTimeout(timer);
  }, [listingId]);

  return { data, isLoading, isError };
}

export function useListingForm(listingId?: string) {
  const { data: initialData, isLoading, isError } = useListingQuery(listingId);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema) as any,
    defaultValues: INITIAL_FORM_DATA,
  });

  // Whenever the fetch finishes or ID changes, reset the form cleanly back to default or initial state
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset(INITIAL_FORM_DATA);
    }
  }, [initialData, form]);

  const onSubmit = (data: ListingFormData) => {
    // Determine whether this is POST (Create) or PUT/PATCH (Update)
    console.log(listingId ? `Updating ID ${listingId}:` : "Creating:", data);
    alert(listingId ? "Listing Updated! (Mock)" : "Listing Created! (Mock)");
  };

  return {
    form,
    onSubmit,
    isLoading,
    isError,
  };
}
