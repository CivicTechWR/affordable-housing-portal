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
import { ListingsPanelShell } from "@/components/listings-layout/ListingsPanelShell";

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
    <ListingsPanelShell
      grow={displayMode === DisplayMode.LIST}
      header={
        <ListingsPanelHeader
          listings={listings}
          filterButtonProps={filterButtonProps}
          sortOptionProps={sortOptionProps}
        />
      }
    >
      <ListingCardGallery
        listings={listings}
        mode={
          [DisplayMode.LIST, DisplayMode.MAP_LIST].includes(displayMode)
            ? ListingsDisplayMode.FULLSCREEN
            : ListingsDisplayMode.SIDESCROLL
        }
      />
    </ListingsPanelShell>
  );
}
