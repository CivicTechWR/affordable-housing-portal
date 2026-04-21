"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { fetchListings, buildListingsSearchParams } from "@/lib/listings/api";
import type { ListingsQuery, ListingsResponse } from "@/lib/listings/types";

interface ListingsQueryState {
  data: ListingsResponse | null;
  error: string | null;
  isLoading: boolean;
}

export function useListingsQuery(query: ListingsQuery) {
  const deferredQuery = useDeferredValue(query);
  const requestKey = useMemo(
    () => buildListingsSearchParams(deferredQuery).toString(),
    [
      deferredQuery.bathrooms,
      deferredQuery.bedrooms,
      deferredQuery.features,
      deferredQuery.limit,
      deferredQuery.location,
      deferredQuery.maxPrice,
      deferredQuery.minPrice,
      deferredQuery.moveInDate,
      deferredQuery.page,
      deferredQuery.sort,
    ],
  );
  const [state, setState] = useState<ListingsQueryState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      setState((current) => ({
        data: current.data,
        error: null,
        isLoading: true,
      }));

      try {
        const response = await fetchListings(deferredQuery, controller.signal);
        setState({
          data: response,
          error: null,
          isLoading: false,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState((current) => ({
          data: current.data,
          error: error instanceof Error ? error.message : "Unable to load listings right now.",
          isLoading: false,
        }));
      }
    }

    void loadListings();

    return () => {
      controller.abort();
    };
  }, [deferredQuery, requestKey]);

  return state;
}
