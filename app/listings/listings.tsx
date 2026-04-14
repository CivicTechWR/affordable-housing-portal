"use client";

// app/listings/page.tsx
// types/listings.ts
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { useListingFilters } from "@/components/listing-filter/useListingFilter";
import { ListingsDisplayMode, ListingsSidebar } from "@/components/listings-sidebar/listingsSideBar";
import { MapView } from "@/components/map-view/mapView";
import { DisplayMode, ListingFilterSearchBar } from "@/components/listing-filter-search-bar/ListingFilterSearchBar";
import { SortOptions } from '@/components/sort-options/SortOptions';
import { ToggleIconButton } from '@/components/toggle-icon-button/ToggleIconButton';
import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterMailIcon } from '@hugeicons/core-free-icons';


export default function ListingsDashboard() {
    // Await the params in Next.js 15+ and set defaults
    // Await the params in Next.js 15+
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
        },]

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


    // Accessing the data
    const {
        sortOptionProps,
        bedroomToggleProps,
        priceRangeProps,
        searchInputProps,
        bathroomToggleProps,
        getFeatureCheckboxProps,
        datePickerProps,
        clearFilters,
    } = useListingFilters();
    console.log('displayMode', displayMode);
    return (
        <NuqsAdapter>
            <div className="flex h-screen flex-col">
                <header className="flex h-16 items-center border-b bg-white px-4 shrink-0">
                    <ListingFilterSearchBar
                        searchInputProps={searchInputProps}
                        priceRangeProps={priceRangeProps}
                        bedroomToggleProps={bedroomToggleProps}
                        bathroomToggleProps={bathroomToggleProps}
                        displayModeProps={{
                            displayModes: [
                                {value: DisplayMode.LIST, label: "List"},
                                {value: DisplayMode.MAP, label: "Map"},
                                {value: DisplayMode.MAP_LIST, label: "Split"}
                            ],
                            onChange: (value: string) => setDisplayMode(value as DisplayMode),
                            value: displayMode,
                        }}
                    />
                    <div className="flex">
                        <h2>Filters</h2>
                        <ToggleIconButton
                            isActive={isFilterOpen}
                            icon={<HugeiconsIcon icon={FilterMailIcon} strokeWidth={2} />}
                            onClick={() => setIsFilterOpen(!isFilterOpen)} />
                    </div>
                </header>
                <main className="flex flex-1 overflow-hidden">
                    {/* The Sidebar stays relatively static but scrolls */}
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <SortOptions {...sortOptionProps} />
                        </div>
                        <ListingsSidebar listings={listings} mode={[DisplayMode.LIST, DisplayMode.MAP_LIST].includes(displayMode) ? ListingsDisplayMode.FULLSCREEN : ListingsDisplayMode.SIDESCROLL} />
                    </div>
                    {([DisplayMode.MAP, DisplayMode.MAP_LIST].includes(displayMode)) && <MapView listings={listings} />}
                    {isFilterOpen &&
                        <ListingFilters
                            bathroomToggleProps={bathroomToggleProps}
                            bedroomToggleProps={bedroomToggleProps}
                            priceRangeProps={priceRangeProps}
                            getFeatureCheckboxProps={getFeatureCheckboxProps}
                            datePickerProps={datePickerProps}
                            clearFilters={clearFilters}
                            dynamicGroups={dynamicGroups}

                        />
                    }
                </main>
            </div>
        </NuqsAdapter>
    );
}