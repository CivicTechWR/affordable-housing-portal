import { listingSearchParamsParsers } from "@/app/listings/searchParams";
import { useQueryStates } from "nuqs";
import { useCallback } from "react";

export function useListingFilters() {
  // 1. nuqs replaces the useReducer
  const [filters, setFilters] = useQueryStates(listingSearchParamsParsers);
  const getSearchInputProps = useCallback(
    (onChangeInput?: (e: string) => void) => ({
      value: filters.location ? filters.location : "Waterloo, ON",
      onChange: async (e: string) => {
        await setFilters({ location: e });
      },
    }),
    [filters.location, setFilters],
  );

  // 2. Prop Getters map UI events directly to URL mutations
  const getPriceRangeInputProps = useCallback(
    () => ({
      // Provide fallbacks if the URL is empty
      min: filters.minPrice || 0,
      max: filters.maxPrice || 5000,
      step: 100,
      onValueChange: async (min: number, max: number) => {
        await setFilters({
          minPrice: min,
          maxPrice: max,
        });
      },
    }),
    [filters.minPrice, filters.maxPrice, setFilters],
  );

  const getBedroomToggleProps = useCallback(
    () => ({
      type: "single" as const,
      value: filters.bedrooms?.toString(),
      onValueChange: async (val: string) =>
        await setFilters({
          // nuqs handles the type conversion back to integer via your cache definition
          bedrooms: val === "" ? null : parseInt(val, 10),
        }),
    }),
    [filters.bedrooms, setFilters],
  );

  const getBathroomToggleProps = useCallback(
    () => ({
      type: "single" as const,
      value: filters.bathrooms?.toString(),
      onValueChange: async (val: string) =>
        await setFilters({
          // nuqs handles the type conversion back to integer via your cache definition
          bedrooms: val === "" ? null : parseInt(val, 10),
        }),
    }),
    [filters.bathrooms, setFilters],
  );

  // 3. Derived actions
  const clearFilters = useCallback(async () => {
    // Setting to null removes the parameters from the URL
    await setFilters({
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      moveInDate: null,
      features: null,
    });
  }, [setFilters]);
  const getFeatureCheckboxProps = useCallback(
    (id: string) => {
      // Default to an empty array if the URL parameter doesn't exist yet
      const currentFeatures = filters.features || [];

      // It is checked if the ID exists in the URL array
      const isChecked = currentFeatures.includes(id);

      return {
        id: `feature-${id}`,
        checked: isChecked,
        onCheckedChange: async (checked: boolean) => {
          if (checked) {
            // Add the feature to the array
            await setFilters({ features: [...currentFeatures, id] });
          } else {
            // Remove the feature from the array
            const nextFeatures = currentFeatures.filter((f) => f !== id);

            // If the array is empty, pass null to completely remove '?features=' from the URL
            await setFilters({
              features: nextFeatures.length > 0 ? nextFeatures : null,
            });
          }
        },
      };
    },
    [filters.features, setFilters],
  );

  const getDatePickerProps = useCallback(() => {
    // 1. Calculate the derived text
    const formattedText = filters.moveInDate
      ? filters.moveInDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Pick a moveInDate";

    // 2. Return the complete package expected by your new component
    return {
      selected: filters.moveInDate ? filters.moveInDate : undefined,
      onSelect: async (d?: Date) => await setFilters({ moveInDate: d }),
      formattedText,
    };
  }, [filters.moveInDate, setFilters]);

  return {
    ...filters,
    getDatePickerProps,
    getSearchInputProps,
    getPriceRangeInputProps,
    getFeatureCheckboxProps,
    getBedroomToggleProps,
    getBathroomToggleProps,
    clearFilters,
  };
}
