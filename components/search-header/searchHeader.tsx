"use client";

import { Input } from "@/components/ui/input";
import { PriceRangeInput } from "../price-range-input/PriceRangeInput";
import { useListingFilters } from "../listing-filter/useListingFilter";
import { ToggleFilter } from "../toggle-filter/ToggleFilter";

export function SearchHeader() {
  const {
    priceRangeProps,
    bedroomToggleProps,
    bathroomToggleProps,
    searchInputProps,
  } = useListingFilters();

  return (
    <header className="flex h-16 items-center border-b bg-white px-4 gap-4 shrink-0">
      {/* Search Input with Icon */}
      <div className="relative w-full max-w-sm">
        <Input {...searchInputProps} />
      </div>

      {/* Price Range Selects */}
      <div className="flex items-center gap-1">
        <PriceRangeInput {...priceRangeProps} />
      </div>

      {/* Property Filters */}
      <div className="hidden lg:flex items-center gap-2">
        <ToggleFilter {...bedroomToggleProps} />
        <ToggleFilter {...bathroomToggleProps} />
      </div>

      {/* Action Buttons */}
      {/* Descoped for now */}
      {/* <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" className="rounded-full gap-2">
          Filters     <HugeiconsIcon
            icon={FilterMailIcon}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          />
        </Button>

        <Button variant="outline" className="rounded-full gap-2 border-green-600 text-green-700 hover:bg-green-50">
          Save Search     <HugeiconsIcon
            icon={Bookmark}
            size={24}
            color="currentColor"
            strokeWidth={1.5}
          />
        </Button>
      </div> */}
    </header>
  );
}
