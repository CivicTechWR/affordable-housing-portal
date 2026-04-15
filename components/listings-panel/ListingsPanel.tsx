"use client";

import {
  Listing,
  ListingsDisplayMode,
  ListingCardGallery,
} from "@/components/listing-card-list/listingsCardList";
import { SortOptions as SortOptionsType } from "@/components/sort-options/SortOptions";
import { FilterButtonProps } from "@/components/filter-button/FilterButton";
import { DisplayMode } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { ListingsPanelHeader } from "@/components/listings-panel-header/ListingsPanelHeader";

interface ListingsPanelProps {
  listings: Listing[];
  displayMode: DisplayMode;
  filterButtonProps: FilterButtonProps;
  sortOptionProps: { sortOptions: SortOptionsType[]; onChange: (value: string) => void };
}

export function ListingsPanel({
  listings,
  displayMode,
  filterButtonProps,
  sortOptionProps,
}: ListingsPanelProps) {
  return (
    <div
      className={`flex flex-col h-full bg-background min-w-[300px] sm:min-w-[330px] lg:min-w-[360px] ${displayMode === DisplayMode.LIST ? "flex-1" : ""}`}
    >
      <ListingsPanelHeader
        listings={listings}
        filterButtonProps={filterButtonProps}
        sortOptionProps={sortOptionProps}
      />
      <ListingCardGallery
        listings={listings}
        mode={
          [DisplayMode.LIST, DisplayMode.MAP_LIST].includes(displayMode)
            ? ListingsDisplayMode.FULLSCREEN
            : ListingsDisplayMode.SIDESCROLL
        }
      />
    </div>
  );
}
