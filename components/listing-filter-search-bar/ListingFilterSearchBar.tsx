"use client";

import { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import {
  FieldGroup,
} from "@/components/ui/field";
import { PriceRangeInput, PriceRangeInputProps } from "../price-range-input/PriceRangeInput";
import { ToggleFilter, ToggleFilterProps } from "../toggle-filter/ToggleFilter";
export enum DisplayMode {
    LIST = 'list',
    MAP_LIST = 'map_list',
    MAP = 'map',
}
export interface ListingFilterSearchBarProps {
  searchInputProps: ComponentProps<typeof Input>;
  priceRangeProps: PriceRangeInputProps;
  bedroomToggleProps: ToggleFilterProps;
  bathroomToggleProps: ToggleFilterProps;
  displayModeProps: {
    displayModes: {
      value: DisplayMode;
      label: string;
    }[];
    onChange: (value: string) => void;
    value: DisplayMode;
  };
}

export function ListingFilterSearchBar({ 
  searchInputProps,
  priceRangeProps,
  bedroomToggleProps,
  bathroomToggleProps,
  displayModeProps,
}: ListingFilterSearchBarProps) {
  return (
      <FieldGroup className="flex flex-row items-center w-full gap-6 space-y-0">
        
        {/* Search: Grows to fill available space up to a point */}
        <div className="flex-1 max-w-sm">
          <Input {...searchInputProps} className="h-10" />
        </div>

        {/* Price Range: Constrained so it doesn't take 1/3 of the page */}
        <div className="w-full max-w-[280px] shrink-0">
          <PriceRangeInput {...priceRangeProps} />
        </div>

        {/* Property Filters: Compact toggles */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <ToggleFilter {...bedroomToggleProps} />
          <ToggleFilter {...bathroomToggleProps} />
        </div>

        <div>
          <ToggleFilter 
          title={"View"}
          value={displayModeProps.value}
          onValueChange={displayModeProps.onChange}
          options={displayModeProps.displayModes}
          />
        </div>
      </FieldGroup>
  );
}