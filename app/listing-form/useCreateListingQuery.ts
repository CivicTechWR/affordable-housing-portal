import { useState } from "react";
import { mapListingFormToCreateListingInput, parseCreateListingResponse } from "./api";
import type { ListingFormData } from "./types";

export function useCreateListingQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const createListing = async (data: ListingFormData) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(mapListingFormToCreateListingInput(data)),
      });

      return await parseCreateListingResponse(response);
    } catch (error) {
      setIsError(true);
      throw error instanceof Error ? error : new Error("Unable to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  return { createListing, isLoading, isError };
}
