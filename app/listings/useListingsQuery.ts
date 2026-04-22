"use client";

import { useEffect, useMemo, useState } from "react";

import { createListingsQueryString } from "./query";
import type { ListingListResponse, ListingQuery } from "@/shared/schemas/listings";

export function useListingsQuery(
  query: ListingQuery,
  initialData: ListingListResponse,
  initialQueryString: string,
) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryString = useMemo(() => createListingsQueryString(query), [query]);

  useEffect(() => {
    if (queryString === initialQueryString) {
      setData(initialData);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchListings() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/listings?${queryString}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch listings.");
        }

        const payload = (await response.json()) as ListingListResponse;
        setData(payload);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch listings.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchListings();

    return () => controller.abort();
  }, [initialData, initialQueryString, queryString]);

  return { data, error, isLoading };
}
