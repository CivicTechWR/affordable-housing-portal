"use client";

import { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { useListingFilters } from "@/components/listing-filter/useListingFilter";
import { ListingsDisplayMode, ListingsSidebar } from "@/components/listings-sidebar/listingsSideBar";
import { MapView } from "@/components/map-view/mapView";
import { ListingFilterSearchBar } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { SortOptions } from "@/components/sort-options/SortOptions";
import { ToggleIconButton } from "@/components/toggle-icon-button/ToggleIconButton";
import { FilterMailIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

import { useListingsQuery } from "@/hooks/useListingsQuery";
import type { ListingSortOption, ListingsQuery, ListingsResponse } from "@/lib/listings/types";

export enum DisplayMode {
  LIST = "list",
  MAP_LIST = "map_list",
  MAP = "map",
}

interface ListingsDashboardProps {
  initialData: ListingsResponse;
  initialQuery: ListingsQuery;
}

export default function ListingsDashboard({
  initialData,
  initialQuery,
}: ListingsDashboardProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayMode] = useState<DisplayMode>(DisplayMode.LIST);
  const {
    sortOptionProps,
    bedroomToggleProps,
    priceRangeProps,
    searchInputProps,
    bathroomToggleProps,
    getFeatureCheckboxProps,
    datePickerProps,
    clearFilters,
    bathrooms,
    bedrooms,
    features,
    location,
    maxPrice,
    minPrice,
    moveInDate,
    sort,
  } = useListingFilters();

  const query = useMemo<ListingsQuery>(
    () => ({
      page: 1,
      limit: 50,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      moveInDate: moveInDate ? moveInDate.toISOString() : null,
      sort: sort as ListingSortOption,
      features,
    }),
    [bathrooms, bedrooms, features, location, maxPrice, minPrice, moveInDate, sort],
  );
  const { data, error, isLoading } = useListingsQuery(query, {
    initialData,
    initialQuery,
  });
  const listings = data.data;
  const dynamicGroups: DynamicFilterGroup[] = data.availableFilters.featureGroups;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center border-b bg-white px-4">
        <ListingFilterSearchBar
          searchInputProps={searchInputProps}
          priceRangeProps={priceRangeProps}
          bedroomToggleProps={bedroomToggleProps}
          bathroomToggleProps={bathroomToggleProps}
        />
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-slate-700">Filters</h2>
          <ToggleIconButton
            isActive={isFilterOpen}
            icon={<HugeiconsIcon icon={FilterMailIcon} strokeWidth={2} />}
            onClick={() => setIsFilterOpen((current) => !current)}
            aria-label="Toggle filters"
          />
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex h-full min-w-0 flex-col bg-white">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
            <div className="text-sm text-slate-500">
              {isLoading && listings.length === 0
                ? "Loading listings..."
                : `${data.pagination.total} results`}
            </div>
            <SortOptions {...sortOptionProps} />
          </div>
          {error ? (
            <div className="flex h-full items-center justify-center p-8 text-sm text-red-600">{error}</div>
          ) : (
            <ListingsSidebar
              listings={listings}
              mode={
                displayMode === DisplayMode.LIST
                  ? ListingsDisplayMode.FULLSCREEN
                  : ListingsDisplayMode.SIDESCROLL
              }
            />
          )}
        </div>
        <MapView listings={listings} />
        {isFilterOpen ? (
          <ListingFilters
            bathroomToggleProps={bathroomToggleProps}
            bedroomToggleProps={bedroomToggleProps}
            priceRangeProps={priceRangeProps}
            getFeatureCheckboxProps={getFeatureCheckboxProps}
            datePickerProps={datePickerProps}
            clearFilters={clearFilters}
            dynamicGroups={dynamicGroups}
          />
        ) : null}
      </main>
    </div>
  );
}
