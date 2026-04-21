"use client";

import { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { PriceRangeInput, PriceRangeInputProps } from "../price-range-input/PriceRangeInput";
import { ToggleFilter, ToggleFilterProps } from "../toggle-filter/ToggleFilter";

export interface ListingFilterSearchBarProps {
  searchInputProps: ComponentProps<typeof Input>;
  priceRangeProps: PriceRangeInputProps;
  bedroomToggleProps: ToggleFilterProps;
  bathroomToggleProps: ToggleFilterProps;
}

export function ListingFilterSearchBar({
  searchInputProps,
  priceRangeProps,
  bedroomToggleProps,
  bathroomToggleProps,
}: ListingFilterSearchBarProps) {
  return (
    <FieldGroup className="flex w-full flex-row items-center gap-6 space-y-0">
      <div className="max-w-sm flex-1">
        <Input {...searchInputProps} className="h-10" />
      </div>
      <div className="w-full max-w-[280px] shrink-0">
        <PriceRangeInput {...priceRangeProps} />
      </div>
      <div className="hidden shrink-0 items-center gap-6 lg:flex">
        <ToggleFilter {...bedroomToggleProps} />
        <ToggleFilter {...bathroomToggleProps} />
      </div>
    </FieldGroup>
  );
}
