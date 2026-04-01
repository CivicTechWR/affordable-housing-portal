"use client";
import { Button } from "@/components/ui/button";
import { DatePicker, DatePickerProps } from "../date-picker/date-picker";
import { PriceRangeInput, PriceRangeInputProps } from "../price-range-input/PriceRangeInput";
import { ToggleFilter, ToggleFilterProps } from "../toggle-filter/ToggleFilter";
import { FeatureAccordion, DynamicFilterGroup } from "../feature-accordian/FeatureAccordian";
import { ComponentProps } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useListingFilters } from "./useListingFilter";

// --- Interfaces ---
export interface ListingFiltersProps {
  dynamicGroups: DynamicFilterGroup[];
}

// --- Component ---

export function ListingFilters({ dynamicGroups = [] }: ListingFiltersProps) {
  const {
    getBedroomToggleProps,
    getPriceRangeInputProps,
    getBathroomToggleProps,
    getFeatureCheckboxProps,
    getDatePickerProps,
    clearFilters,
  } = useListingFilters();

  return (
    <div className="w-full max-w-sm p-4 space-y-8">
      {/* --- RENT PRICE --- */}
      <PriceRangeInput {...getPriceRangeInputProps()} />

      {/* --- BEDROOMS & BATHROOMS --- */}
      <ToggleFilter title="Bedrooms" {...getBedroomToggleProps()} />
      <ToggleFilter title="Bathrooms" {...getBathroomToggleProps()} />

      {/* --- MOVE-IN DATE --- */}
      <div className="space-y-4">
        <h3 className="font-medium leading-none">Move-In Date</h3>
        <DatePicker {...getDatePickerProps()} />
      </div>

      {/* --- DYNAMIC METADATA FILTERS --- */}
      <FeatureAccordion groups={dynamicGroups} getCheckboxProps={getFeatureCheckboxProps} />

      {/* --- ACTIONS --- */}
      <div className="flex items-center gap-4 pt-4 mt-6 border-t">
        <Button variant="outline" className="flex-1" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}
