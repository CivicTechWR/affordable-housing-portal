import { useState } from "react";
import type { ListingFormData } from "./types";

export function useCreateListingQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const createListing = async (data: ListingFormData) => {
    setIsLoading(true);
    setIsError(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.log("Creating listing:", data);
      return data;
    } catch {
      setIsError(true);
      throw new Error("Unable to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  return { createListing, isLoading, isError };
}
