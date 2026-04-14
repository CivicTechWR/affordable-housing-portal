"use client";

import { FilterButton } from "@/components/filter-button/FilterButton";

interface ListingsPanelHeaderProps {
    activeFilterCount: number;
    isFilterOpen: boolean;
    onFilterClick: () => void;
}

export function ListingsPanelHeader({
    activeFilterCount,
    isFilterOpen,
    onFilterClick,
}: ListingsPanelHeaderProps) {
    return (
        <FilterButton
            activeFilterCount={activeFilterCount}
            isFilterOpen={isFilterOpen}
            onFilterClick={onFilterClick}
        />
    );
}