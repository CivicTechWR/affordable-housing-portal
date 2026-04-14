"use client";

import { Listing, ListingsDisplayMode, ListingCardGallery } from "@/components/listing-card-list/listingsCardList";
import { SortOptions as SortOptionsType, SortOptions as SortOptionsComponent } from "@/components/sort-options/SortOptions";
import { DisplayMode } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { ListingsPanelHeader } from "@/components/listings-panel-header/ListingsPanelHeader";

interface ListingsPanelProps {
    listings: Listing[];
    displayMode: DisplayMode;
    isFilterOpen: boolean;
    activeFilterCount: number;
    onFilterClick: () => void;
    sortOptionProps: { sortOptions: SortOptionsType[]; onChange: (value: string) => void };
}

export function ListingsPanel({
    listings,
    displayMode,
    isFilterOpen,
    activeFilterCount,
    onFilterClick,
    sortOptionProps,
}: ListingsPanelProps) {
    return (
        <div className={`flex flex-col h-full bg-background min-w-[300px] sm:min-w-[330px] lg:min-w-[360px] ${displayMode === DisplayMode.LIST ? 'flex-1' : ''}`}>
            <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{listings.length} listing{listings.length !== 1 ? 's' : ''} found</span>
                <SortOptionsComponent {...sortOptionProps} />
                <ListingsPanelHeader
                    activeFilterCount={activeFilterCount}
                    isFilterOpen={isFilterOpen}
                    onFilterClick={onFilterClick}
                />
            </div>
            <ListingCardGallery listings={listings} mode={[DisplayMode.LIST, DisplayMode.MAP_LIST].includes(displayMode) ? ListingsDisplayMode.FULLSCREEN : ListingsDisplayMode.SIDESCROLL} />
        </div>
    );
}