import { ScrollArea } from "@/components/ui/scroll-area";
import type { ListingSummary } from "@/shared/schemas/listings";
import { ListingsCard } from "../listings-card/ListingsCard";

export type Listing = ListingSummary;

export enum ListingsDisplayMode {
  SIDESCROLL = "sidescroll",
  FULLSCREEN = "fullscreen",
}

interface ListingCardGalleryProps {
  listings: Listing[];
  mode: ListingsDisplayMode;
}

export function ListingCardGallery({ listings, mode }: ListingCardGalleryProps) {
  const isFullscreen = mode === ListingsDisplayMode.FULLSCREEN;

  return (
    <ScrollArea className="flex-1 h-full w-full">
      <div
        className={`p-4 grid gap-4 ${
          isFullscreen
            ? "justify-items-center grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]"
            : "grid-cols-1"
        }`}
      >
        {listings.map((listing) => (
          <ListingsCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            accessibilityFeatures={listing.accessibilityFeatures?.map((feature) => feature.name)}
            price={listing.price}
            address={listing.address}
            city={listing.city}
            beds={listing.beds}
            baths={listing.baths}
            sqft={listing.sqft}
            timeAgo={listing.timeAgo}
            imageUrl={listing.imageUrl}
            variant={isFullscreen ? "vertical" : "horizontal"}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
