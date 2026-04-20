import { useState } from "react";
import type { ListingFormData } from "./types";

interface EditListingInput {
  listingId: string;
  data: ListingFormData;
}

export function useEditListingQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const editListing = async ({ listingId, data }: EditListingInput) => {
    setIsLoading(true);
    setIsError(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.log(`Updating listing ${listingId}:`, data);
      return { listingId, data };
    } catch {
      setIsError(true);
      throw new Error("Unable to edit listing");
    } finally {
      setIsLoading(false);
    }
  };

  return { editListing, isLoading, isError };
}
