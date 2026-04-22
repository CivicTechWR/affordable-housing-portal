import { useState } from "react";
import type { UpdateListingInput } from "@/shared/schemas/listings";
import { parseCreateListingResponse } from "./api";

interface EditListingInput {
  listingId: string;
  payload: UpdateListingInput;
}

export function useEditListingQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const editListing = async ({ listingId, payload }: EditListingInput) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return await parseCreateListingResponse(response);
    } catch (error) {
      setIsError(true);
      throw error instanceof Error ? error : new Error("Unable to edit listing");
    } finally {
      setIsLoading(false);
    }
  };

  return { editListing, isLoading, isError };
}
