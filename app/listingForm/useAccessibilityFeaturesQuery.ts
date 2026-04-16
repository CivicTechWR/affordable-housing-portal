import { useState, useEffect } from "react";
import { ACCESSIBILITY_FEATURE_GROUPS } from "./types";

export function useAccessibilityFeaturesQuery() {
  const [data, setData] = useState<typeof ACCESSIBILITY_FEATURE_GROUPS | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Simulate a network request delay
    const timer = setTimeout(() => {
      try {
        setData(ACCESSIBILITY_FEATURE_GROUPS);
        setIsLoading(false);
      } catch {
        setIsError(true);
        setIsLoading(false);
      }
    }, 1000); // 1s mock wait

    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading, isError };
}
