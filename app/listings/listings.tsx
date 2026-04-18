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

export default function ListingsDashboard() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);
  const listings = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      price: 100000,
      address: "123 Main St",
      city: "Waterloo",
      beds: 3,
      baths: 2,
      sqft: 100,
      // imageUrl: "https://picsum.photos/id/1/200/300",
      timeAgo: "2 days ago",
      lat: 43.45055954361165,
      lng: -80.49228395260133,
      features: [
        {
          categoryName: "Accessibility",
          features: [
            { name: "braille", description: "description of this" },
            { name: "wheelchair", description: "description of this" },
            { name: "ramp", description: "description of this" },
          ],
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
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center border-b bg-background px-4 shrink-0">
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
      <main className="flex flex-1 overflow-hidden">
        {displayMode !== DisplayMode.MAP ? (
          <ListingsPanel
            listings={listings}
            displayMode={displayMode}
            filterButtonProps={filterButtonProps}
            sortOptionProps={sortOptionProps}
          />
        ) : null}
        {[DisplayMode.MAP, DisplayMode.MAP_LIST].includes(displayMode) && (
          <MapView listings={listings} />
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
