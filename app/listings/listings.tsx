"use client";

import { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { useListingFilters } from "@/components/listing-filter/useListingFilter";
import { MapView } from "@/components/map-view/mapView";
import {
  DisplayMode,
  ListingFilterSearchBar,
} from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { FilterButton } from "@/components/filter-button/FilterButton";
import { useState } from "react";
import { ListingsPanel } from "@/components/listings-panel/ListingsPanel";
import type { ListingSummary } from "@/shared/schemas/listings";

export default function ListingsDashboard() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);
  const isSplitView = displayMode === DisplayMode.MAP_LIST;
  const listings: ListingSummary[] = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Sunny Downtown Loft",
      price: 2350,
      address: "123 Main St",
      city: "Waterloo",
      beds: 3,
      baths: 2,
      sqft: 1200,
      imageUrl:
        "https://images.pexels.com/photos/10117724/pexels-photo-10117724.jpeg?cs=srgb&dl=pexels-keeganjchecks-10117724.jpg&fm=jpg",
      timeAgo: "2 days ago",
      lat: 43.45055954361165,
      lng: -80.49228395260133,
      accessibilityFeatures: [
        {
          name: "Main Entrance is Barrier-Free",
          description: "The building's main entrance is level and accessible without stairs.",
        },
        {
          name: "Elevator in Building",
          description: "The building has at least one functioning passenger elevator.",
        },
      ],
    },
    {
      id: "2",
      title: "Cozy Suburb Apartment",
      price: 145000,
      address: "456 King St N",
      city: "Waterloo",
      beds: 1,
      baths: 1,
      sqft: 650,
      timeAgo: "5 hours ago",
      lat: 43.468,
      lng: -80.525,
      accessibilityFeatures: [
        {
          name: "Main Entrance is Barrier-Free",
          description: "The building's main entrance is level and accessible without stairs.",
        },
        {
          name: "Unit Entrance is Barrier-Free",
          description: "The unit entrance has no raised threshold or steps.",
        },
      ],
    },
  ];

  const dynamicGroups: DynamicFilterGroup[] = [
    {
      groupId: "features",
      groupLabel: "Features",
      options: [
        { id: "beds", label: "Beds", type: "boolean" },
        { id: "baths", label: "Baths", type: "boolean" },
      ],
    },
  ];

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
            listings={listings}
            displayMode={displayMode}
            filterButtonProps={filterButtonProps}
            sortOptionProps={sortOptionProps}
          />
        ) : null}
        {[DisplayMode.MAP, DisplayMode.MAP_LIST].includes(displayMode) && (
          <div className={`min-w-0 flex-1 ${isSplitView ? "lg:basis-1/2" : ""}`}>
            <MapView listings={listings} />
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
