"use client";

import { useState, useCallback, useMemo } from "react";
import { Map, Marker, Popup } from "@vis.gl/react-maplibre";
import type { Listing } from "@/components/listings-sidebar/ListingCardGallery";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

/** Default view centred on Waterloo Region */
const DEFAULT_VIEW = { longitude: -80.52, latitude: 43.46, zoom: 12 } as const;

export function MapView({ listings }: { listings: Listing[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedId) ?? null,
    [listings, selectedId],
  );

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative h-full w-full">
      <Map
        mapStyle={OPENFREEMAP_STYLE}
        initialViewState={DEFAULT_VIEW}
        style={{ width: "100%", height: "100%" }}
        scrollZoom={true}
      >
        {listings.map((listing) => (
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
              <div className="text-sm font-semibold">
                {selectedListing.address}, {selectedListing.city}
              </div>
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
