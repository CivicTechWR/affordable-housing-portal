// app/listings/page.tsx
// types/listings.ts
import { Suspense } from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { DynamicFilterGroup } from "@/components/feature-accordian/FeatureAccordian";
import { ListingFilters } from "@/components/listing-filter/ListingFilter";
import { ListingsSidebar } from "@/components/listings-sidebar/listingsSideBar";
import { MapView } from "@/components/map-view/mapView";
import { SearchHeader } from "@/components/search-header/searchHeader";

export default async function ListingsPage( ) {
    // Await the params in Next.js 15+ and set defaults
    // Await the params in Next.js 15+
    const sortOptions = [
        { value: "newest", label: "Newest" },
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },
    ];
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
        },]

    // Accessing the data

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
    return (
        <NuqsAdapter>
            <div className="flex h-screen flex-col">
                <Suspense fallback={<div className="flex h-16 items-center border-b bg-white px-4 shrink-0" />}>
                    <SearchHeader />
                </Suspense>

                <main className="flex flex-1 overflow-hidden">
                    {/* The Sidebar stays relatively static but scrolls */}
                    <ListingsSidebar listings={listings} sortOptions={sortOptions} />
                    <Suspense>
                        <ListingFilters
                            dynamicGroups={dynamicGroups}
                        />
                    </Suspense>
                    {/* The Map must be a Client Component */}
                    <MapView listings={listings} />
                </main>
            </div>
        </NuqsAdapter>
    );
}