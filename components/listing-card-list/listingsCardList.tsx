import { ScrollArea } from "@/components/ui/scroll-area";
import { ListingsCard } from "../listings-card/listingsCard";

export interface Listing {
  id: string;
  title?: string;
  accessibilityFeatures?: string[];
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
    // Added h-full and w-full so it fills the parent column and enables actual scrolling
    <ScrollArea className="flex-1 h-full w-full">
      <div
        className={`p-4 grid gap-4 ${
          isFullscreen
            ? "grid-cols-[260px] sm:grid-cols-[290px_290px] lg:grid-cols-[320px_320px_320px] xl:grid-cols-[320px_320px_320px_320px]"
            : "grid-cols-1"
        }`}
      >
        {listings.map((listing) => (
          <ListingsCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            accessibilityFeatures={listing.accessibilityFeatures}
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
