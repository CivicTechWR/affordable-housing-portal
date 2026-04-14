"use client";

import { Listing, ListingsDisplayMode, ListingCardGallery } from "@/components/listing-card-list/listingsCardList";
import { SortOptions as SortOptionsType, SortOptions as SortOptionsComponent } from "@/components/sort-options/SortOptions";
import { ToggleIconButton } from "@/components/toggle-icon-button/ToggleIconButton";
import { DisplayMode } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterMailIcon } from "@hugeicons/core-free-icons";

interface ListingsPanelProps {
    listings: Listing[];
    displayMode: DisplayMode;
    isFilterOpen: boolean;
    activeFilterCount: number;
    setIsFilterOpen: (open: boolean) => void;
    sortOptionProps: { sortOptions: SortOptionsType[]; onChange: (value: string) => void };
}

export function ListingsPanel({
    listings,
    displayMode,
    isFilterOpen,
    activeFilterCount,
    setIsFilterOpen,
    sortOptionProps,
}: ListingsPanelProps) {
    return (
        <div className={`flex flex-col h-full bg-background min-w-[240px] sm:min-w-[260px] lg:min-w-[290px] ${displayMode === DisplayMode.LIST ? 'flex-1' : ''}`}>
            <div className="p-4 border-b flex items-center gap-3 bg-background sticky top-0 z-10">
                <span className="text-sm text-muted-foreground">{listings.length} listing{listings.length !== 1 ? 's' : ''} found</span>
                <SortOptionsComponent {...sortOptionProps} />
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative sm:hidden">
                        <ToggleIconButton
                            isActive={isFilterOpen}
                            icon={<HugeiconsIcon icon={FilterMailIcon} strokeWidth={2} />}
                            onClick={() => setIsFilterOpen(!isFilterOpen)} />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {activeFilterCount}
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:block relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                isFilterOpen
                                    ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                                    : "border-border bg-background hover:bg-accent"
                            }`}
                        >
                            All Filters
                            {activeFilterCount > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <ListingCardGallery listings={listings} mode={[DisplayMode.LIST, DisplayMode.MAP_LIST].includes(displayMode) ? ListingsDisplayMode.FULLSCREEN : ListingsDisplayMode.SIDESCROLL} />
        </div>
    );
}