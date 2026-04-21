import { useState, useEffect } from "react";

import {
  customListingFieldListResponseSchema,
  type CustomListingFieldGroup,
} from "@/shared/schemas/custom-listing-fields";

export function useAccessibilityFeaturesQuery() {
  const [data, setData] = useState<CustomListingFieldGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeatures() {
      try {
        const response = await fetch(
          "/api/custom-listing-fields?publicOnly=true&filterableOnly=true&type=boolean",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch accessibility features");
        }
        const payload = customListingFieldListResponseSchema.parse(await response.json());
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

    void fetchFeatures();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, isError };
}
