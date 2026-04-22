"use client";

import {
  SortOptions as SortOptionsType,
  SortOptions as SortOptionsComponent,
} from "@/components/sort-options/SortOptions";
import { FilterButton, FilterButtonProps } from "@/components/filter-button/FilterButton";
import { Listing } from "@/components/listing-card-list/ListingsCardList";

interface ListingsPanelHeaderProps {
  listings: Listing[];
  filterButtonProps: FilterButtonProps;
  sortOptionProps: { sortOptions: SortOptionsType[]; onChange: (value: string) => void };
  isLoading?: boolean;
}

export function ListingsPanelHeader({
  listings,
  filterButtonProps,
  sortOptionProps,
  isLoading = false,
}: ListingsPanelHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {isLoading
          ? "Updating listings..."
          : `${listings.length} listing${listings.length !== 1 ? "s" : ""} found`}
      </span>
      <SortOptionsComponent {...sortOptionProps} />
      <FilterButton {...filterButtonProps} />
    </div>
  );
}
