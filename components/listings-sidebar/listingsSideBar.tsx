import { ScrollArea } from "@/components/ui/scroll-area";
import { ListingsCard } from "../listings-card/listingsCard";

export interface Listing {
    id: string;
    price: number;
    address: string;
    city: string;
    beds: number;
    baths: number;
    sqft: number;
    lat: number;
    lng: number;
    imageUrl?: string;
    timeAgo: string;
}

export enum ListingsDisplayMode {
    SIDESCROLL = 'sidescroll',
    FULLSCREEN = 'fullscreen',
}

interface ListingsSidebarProps {
    listings: Listing[];
    mode: ListingsDisplayMode;
}

export function ListingsSidebar({ listings, mode }: ListingsSidebarProps) {
    const isFullscreen = mode === ListingsDisplayMode.FULLSCREEN;

    return (
        // Added h-full and w-full so it fills the parent column and enables actual scrolling
        <ScrollArea className="flex-1 h-full w-full">
            <div
                // Switched from space-y-4 to a cohesive grid system for both modes
                className={`p-4 grid gap-4 ${
                    isFullscreen
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1" 
                }`}
            >
                {listings.map((listing) => (
                    <ListingsCard
                        key={listing.id}
                        id={listing.id}
                        price={listing.price}
                        address={listing.address}
                        city={listing.city}
                        beds={listing.beds}
                        baths={listing.baths}
                        sqft={listing.sqft}
                        timeAgo={listing.timeAgo}
                        imageUrl={listing.imageUrl}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}