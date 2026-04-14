"use client";
import { Button } from '@/components/ui/button';
import { DatePicker, DatePickerProps } from '../date-picker/date-picker';
import { PriceRangeInput, PriceRangeInputProps } from '../price-range-input/PriceRangeInput';
import { ToggleFilter, ToggleFilterProps } from '../toggle-filter/ToggleFilter';
import { FeatureAccordion, DynamicFilterGroup } from '../feature-accordian/FeatureAccordian';
import { ComponentProps } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

// --- Interfaces ---
export interface ListingFiltersProps {
  dynamicGroups: DynamicFilterGroup[];
  bedroomToggleProps: ToggleFilterProps;
  priceRangeProps: PriceRangeInputProps;
  bathroomToggleProps: ToggleFilterProps;
  getFeatureCheckboxProps: (id: string) => ComponentProps<typeof Checkbox>;
  datePickerProps: DatePickerProps;
  clearFilters: () => Promise<void>;
}

// --- Component ---

export function ListingFilters({
  bedroomToggleProps,
  priceRangeProps,
  bathroomToggleProps,
  getFeatureCheckboxProps,
  datePickerProps,
  clearFilters,
  dynamicGroups,
}: ListingFiltersProps) {

  return (
    <div className="w-full max-w-sm p-4 space-y-8">

      {/* --- RENT PRICE --- */}
      <PriceRangeInput {...priceRangeProps} />

      {/* --- BEDROOMS & BATHROOMS --- */}
      <ToggleFilter {...bedroomToggleProps} />
      <ToggleFilter {...bathroomToggleProps} />

      {/* --- MOVE-IN DATE --- */}
      <div className="space-y-4">
        <DatePicker {...datePickerProps} />
      </div>

      {/* --- DYNAMIC METADATA FILTERS --- */}
      <FeatureAccordion
        groups={dynamicGroups}
        getCheckboxProps={getFeatureCheckboxProps}
      />

      {/* --- ACTIONS --- */}
      <div className="flex items-center gap-4 pt-4 mt-6 border-t">
        <Button variant="outline" className="flex-1" onClick={clearFilters}>
          Clear
        </Button>
      </div>

    </div>
  );
}