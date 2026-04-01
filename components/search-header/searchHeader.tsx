"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PriceRangeInput } from "../price-range-input/PriceRangeInput";
import { useListingFilters } from "../listing-filter/useListingFilter";
import { Toggle } from "radix-ui";
import { ToggleFilter } from "../toggle-filter/ToggleFilter";


export function SearchHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const
    {
      getPriceRangeInputProps,
      getBedroomToggleProps,
      getBathroomToggleProps,
      getSearchInputProps,
    } = useListingFilters();

  const [isPending, startTransition] = useTransition();
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "5000";
  const location = searchParams.get("location") || "Waterloo, ON";

  return (
    <header className="flex h-16 items-center border-b bg-white px-4 gap-4 shrink-0">
      {/* Search Input with Icon */}
      <div className="relative w-full max-w-sm">
        <Input
          {...getSearchInputProps()}
          onChange={(e) => getSearchInputProps().onChange(e.target.value)}

        />
      </div>

      {/* Price Range Selects */}
      <div className="flex items-center gap-1">
        <PriceRangeInput
          {...getPriceRangeInputProps()}
        />
      </div>

      {/* Property Filters */}
      <div className="hidden lg:flex items-center gap-2">
        <ToggleFilter title="Bedrooms" {...getBedroomToggleProps()} />
        <ToggleFilter title="Bathrooms" {...getBathroomToggleProps()} />
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

      {/* Subtle loading indicator for route transitions */}
      {isPending && <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500 animate-pulse" />}
    </header>
  );
}