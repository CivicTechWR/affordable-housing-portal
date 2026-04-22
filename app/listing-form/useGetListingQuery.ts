import { useEffect, useState } from "react";

import { parseListingEditorResponse } from "./api";
import type { ListingFormInput } from "./types";

export function useGetListingQuery(listingId?: string) {
  const [data, setData] = useState<ListingFormInput | null>(null);
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
    let cancelled = false;

    async function fetchListing() {
      try {
        const response = await fetch(`/api/listings/${listingId}/editor`, {
          method: "GET",
        });
        const payload = await parseListingEditorResponse(response);

        if (!cancelled) {
          setData(payload.data);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    }

    void fetchListing();

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  return { data, isLoading, isError };
}
