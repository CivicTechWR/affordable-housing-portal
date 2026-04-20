"use client";

import { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { useListingFilters } from "@/components/listing-filter/useListingFilter";
import {
  DisplayMode,
  ListingFilterSearchBar,
} from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { FilterButton } from "@/components/filter-button/FilterButton";
import { useState } from "react";
import { ListingsPanel } from "@/components/listings-panel/ListingsPanel";
import type { ListingSummary } from "@/shared/schemas/listings";
import dynamic from "next/dynamic";

const LazyMapView = dynamic<{ listings: ListingSummary[] }>(
  () => import("../../components/map-view/MapView.js").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

interface ListingsDashboardProps {
  initialListings: ListingSummary[];
  dynamicGroups: DynamicFilterGroup[];
}

export default function ListingsDashboard({
  initialListings,
  dynamicGroups,
}: ListingsDashboardProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);
  const isSplitView = displayMode === DisplayMode.MAP_LIST;

  const {
    sortOptionProps,
    bedroomToggleProps,
    priceRangeProps,
    searchInputProps,
    bathroomToggleProps,
    getFeatureCheckboxProps,
    datePickerProps,
    clearFilters,
    getFilterButtonProps,
  } = useListingFilters();
  const filterButtonProps = getFilterButtonProps(isFilterOpen, () =>
    setIsFilterOpen(!isFilterOpen),
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <header className="flex h-16 shrink-0 items-center border-b bg-background px-4">
        <ListingFilterSearchBar
          searchInputProps={searchInputProps}
          priceRangeProps={priceRangeProps}
          bedroomToggleProps={bedroomToggleProps}
          bathroomToggleProps={bathroomToggleProps}
          displayModeProps={{
            displayModes: [
              { value: DisplayMode.LIST, label: "List" },
              { value: DisplayMode.MAP, label: "Map" },
              { value: DisplayMode.MAP_LIST, label: "Split" },
            ],
            onChange: (value: string) => setDisplayMode(value as DisplayMode),
            value: displayMode,
          }}
        />
        <FilterButton {...filterButtonProps} />
      </header>
      <main className="flex min-h-0 flex-1 overflow-hidden">
        {displayMode !== DisplayMode.MAP ? (
          <ListingsPanel
            listings={initialListings}
            displayMode={displayMode}
            filterButtonProps={filterButtonProps}
            sortOptionProps={sortOptionProps}
          />
        ) : null}
        {[DisplayMode.MAP, DisplayMode.MAP_LIST].includes(displayMode) && (
          <div className={`min-w-0 flex-1 ${isSplitView ? "lg:basis-1/2" : ""}`}>
            <LazyMapView listings={initialListings} />
          </div>
        )}
        {isFilterOpen && (
          <ListingFilters
            bathroomToggleProps={bathroomToggleProps}
            bedroomToggleProps={bedroomToggleProps}
            priceRangeProps={priceRangeProps}
            getFeatureCheckboxProps={getFeatureCheckboxProps}
            datePickerProps={datePickerProps}
            clearFilters={clearFilters}
            dynamicGroups={dynamicGroups}
          />
        )}
      </main>
    </div>
  );
}
