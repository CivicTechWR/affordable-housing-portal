import { useState } from "react";

import { parseCreateDraftListingResponse } from "./api";

export function useCreateDraftListingQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const createDraftListing = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch("/api/listing-drafts", {
        method: "POST",
      });

      return await parseCreateDraftListingResponse(response);
    } catch (error) {
      setIsError(true);
      throw error instanceof Error ? error : new Error("Unable to create draft listing");
    } finally {
      setIsLoading(false);
    }
  };

  return { createDraftListing, isLoading, isError };
}
