"use client";

import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { Map, Marker, Popup } from "@vis.gl/react-maplibre";
import type { Listing } from "@/components/listing-card-list/listingsCardList";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

/** Default view centred on Waterloo Region */
const DEFAULT_VIEW = { longitude: -80.52, latitude: 43.46, zoom: 12 } as const;

export function MapView({ listings }: { listings: Listing[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mappableListings = useMemo(
    () =>
      listings.filter((listing): listing is Listing & { lat: number; lng: number } =>
        hasCoordinates(listing),
      ),
    [listings],
  );

  const selectedListing = useMemo(
    () => mappableListings.find((l) => l.id === selectedId) ?? null,
    [mappableListings, selectedId],
  );

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full flex-1">
      <Map
        mapStyle={OPENFREEMAP_STYLE}
        initialViewState={DEFAULT_VIEW}
        style={{ width: "100%", height: "100%" }}
        scrollZoom={true}
      >
        {mappableListings.map((listing) => (
          <Marker
            key={listing.id}
            longitude={listing.lng}
            latitude={listing.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(listing.id);
            }}
          >
            <div
              className={`cursor-pointer rounded-full border border-white px-2 py-1 text-[10px] font-bold shadow-lg transition-transform hover:scale-110 ${
                selectedId === listing.id ? "bg-blue-600 text-white" : "bg-[#3b444b] text-white"
              }`}
            >
              ${listing.price.toLocaleString()}
            </div>
          </Marker>
        ))}

        {selectedListing && (
          <Popup
            longitude={selectedListing.lng}
            latitude={selectedListing.lat}
            anchor="bottom"
            offset={28}
            closeOnClick={false}
            onClose={() => setSelectedId(null)}
          >
            <div className="min-w-[180px] p-1">
              <div className="text-lg font-bold text-blue-600">
                ${selectedListing.price.toLocaleString()}
              </div>
              <Link
                href={`/listings/${selectedListing.id}`}
                className="text-sm font-semibold text-foreground transition-colors hover:text-blue-600 hover:underline"
              >
                {selectedListing.address}, {selectedListing.city}
              </Link>
              <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                <span>
                  <strong>{selectedListing.beds}</strong> bed
                </span>
                <span>
                  <strong>{selectedListing.baths}</strong> bath
                </span>
                <span>
                  <strong>{selectedListing.sqft}</strong> sqft
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

function hasCoordinates(listing: Listing): listing is Listing & { lat: number; lng: number } {
  return typeof listing.lat === "number" && typeof listing.lng === "number";
}
