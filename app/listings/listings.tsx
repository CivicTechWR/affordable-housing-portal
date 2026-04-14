"use client";

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { useListingFilters } from "@/components/listing-filter/useListingFilter";
import { ListingsDisplayMode } from "@/components/listing-card-list/listingsCardList";
import { MapView } from "@/components/map-view/mapView";
import { DisplayMode, ListingFilterSearchBar } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { ToggleIconButton } from '@/components/toggle-icon-button/ToggleIconButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterMailIcon } from '@hugeicons/core-free-icons';
import { useState } from 'react';
import { ListingsPanel } from '@/components/listings-panel/ListingsPanel';


export default function ListingsDashboard() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.LIST);
    const listings = [
        {
            id: "1",
            price: 100000,
            address: "123 Main St",
            city: "Waterloo",
            beds: 3,
            baths: 2,
            sqft: 100,
            imageUrl: "https://picsum.photos/id/1/200/300",
            timeAgo: "2 days ago",
            lat: 43.45055954361165,
            lng: -80.49228395260133,
            features: [
                {
                    categoryName: "Accessibility",
                    features: [{ name: "braille", description: "description of this" },
                    { name: "wheelchair", description: "description of this" },
                    { name: "ramp", description: "description of this" }]
                }]
        }]

    const dynamicGroups: DynamicFilterGroup[] = [
        {
            groupId: "features",
            groupLabel: "Features",
            options: [
                { id: "beds", label: "Beds", type: "boolean" },
                { id: "baths", label: "Baths", type: "boolean" },
            ],
        },
    ]

    const {
        sortOptionProps,
        bedroomToggleProps,
        priceRangeProps,
        searchInputProps,
        bathroomToggleProps,
        getFeatureCheckboxProps,
        datePickerProps,
        clearFilters,
        activeFilterCount,
    } = useListingFilters();

    return (
        <NuqsAdapter>
            <div className="flex h-screen flex-col">
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
                                { value: DisplayMode.MAP_LIST, label: "Split" }
                            ],
                            onChange: (value: string) => setDisplayMode(value as DisplayMode),
                            value: displayMode,
                        }}
                    />
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
                </header>
                <main className="flex flex-1 overflow-hidden">
                    {displayMode !== DisplayMode.MAP ? (
                        <ListingsPanel
                            listings={listings}
                            displayMode={displayMode}
                            isFilterOpen={isFilterOpen}
                            activeFilterCount={activeFilterCount}
                            setIsFilterOpen={setIsFilterOpen}
                            sortOptionProps={sortOptionProps}
                        />
                    ) : null}
                    {([DisplayMode.MAP, DisplayMode.MAP_LIST].includes(displayMode)) && <MapView listings={listings} />}
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
        </NuqsAdapter>
    );
}