import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import type { ListingSummary } from "@/lib/listings/types";

export type Listing = ListingSummary;

export enum ListingsDisplayMode {
  SIDESCROLL = "sidescroll",
  FULLSCREEN = "fullscreen",
}

interface ListingsSidebarProps {
  listings: Listing[];
  mode: ListingsDisplayMode;
}

export function ListingsSidebar({ listings, mode }: ListingsSidebarProps) {
  const isFullscreen = mode === ListingsDisplayMode.FULLSCREEN;

  if (listings.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
        No listings match the current filters.
      </div>
    );
  }

  return (
    <ScrollArea className={isFullscreen ? "h-full w-full" : "flex-1"}>
      <div
        className={`p-4 ${
          isFullscreen
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "space-y-4"
        }`}
      >
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="flex cursor-pointer flex-col overflow-hidden border-none shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/9] bg-gray-200">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={`${listing.address}, ${listing.city}`}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 flex gap-1">
                <div className="h-2 w-2 rounded-full border border-white bg-blue-500" />
                <span className="text-[10px] font-medium text-white">{listing.timeAgo}</span>
              </div>
            </div>

            <CardContent className="flex flex-1 flex-col justify-between p-3">
              <div>
                <div className="text-2xl font-bold text-blue-600">${listing.price.toLocaleString()}</div>
                <div className="truncate text-sm font-semibold uppercase">
                  {listing.address}, {listing.city}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <strong>{listing.beds}</strong> bed
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <strong>{listing.baths}</strong> bath
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <strong>{listing.sqft}</strong> sqft
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
