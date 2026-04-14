import { listingSearchParamsParsers } from '@/app/listings/searchParams';
import { useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';
import { FilterButtonProps } from '@/components/filter-button/FilterButton';

export function useListingFilters() {
    const [filters, setFilters] = useQueryStates(listingSearchParamsParsers);

    // --- 1. Static Props (Variables) ---
    const sortOptionProps = useMemo(() => ({
        sortOptions: [
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
        ],
        onChange: async (value: string) => await setFilters({ sort: value }),
    }), [filters.sort, setFilters]);

    const searchInputProps = useMemo(() => ({
        value: filters.location || "Waterloo, ON",
        onChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
            await setFilters({ location: e.target.value })
        },
    }), [filters.location, setFilters]);

    const priceRangeProps = useMemo(() => ({
        min: filters.minPrice || undefined,
        max: filters.maxPrice || undefined,
        step: 100,
        onMinChange: async (min: number | undefined) => {
            if (min && filters.maxPrice && min > filters.maxPrice) {
                await setFilters({ minPrice: min, maxPrice: min });
            }
            await setFilters({ minPrice: min });
        },
        onMaxChange: async (max: number | undefined) => {
            if (max && filters.minPrice && max < filters.minPrice) {
                await setFilters({ maxPrice: max, minPrice: max });
            }

            await setFilters({ maxPrice: max });
        },
    }), [filters.minPrice, filters.maxPrice, setFilters]);

    const bedroomToggleProps = useMemo(() => ({
        title: "Bedrooms",
        value: filters.bedrooms?.toString() || undefined,
        options: [
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4+", label: "4+" },
        ],
        onValueChange: async (val: string) => {
            await setFilters({
                bedrooms: val === "" ? null : val,
            });
        },
    }), [filters.bedrooms, setFilters]);

    const bathroomToggleProps = useMemo(() => ({
        title: "Bathrooms",
        value: filters.bathrooms?.toString() || undefined,
        options: [
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4+", label: "4+" },
        ],
        onValueChange: async (val: string) => {
            await setFilters({
                bathrooms: val === "" ? null : val,
            });
        },
    }), [filters.bathrooms, setFilters]);

    const datePickerProps = useMemo(() => ({
        selected: filters.moveInDate || undefined,
        onSelect: async (d?: Date) => await setFilters({ moveInDate: d }),
        formattedText: filters.moveInDate
            ? filters.moveInDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
            : "",
    }), [filters.moveInDate, setFilters]);

    // --- 2. Dynamic Getters (Functions) ---

    const getFeatureCheckboxProps = useCallback((id: string) => {
        const currentFeatures = filters.features || [];
        const isChecked = currentFeatures.includes(id);

        return {
            id: `feature-${id}`,
            checked: isChecked,
            onCheckedChange: async (checked: boolean) => {
                if (checked) {
                    await setFilters({ features: [...currentFeatures, id] });
                } else {
                    const nextFeatures = currentFeatures.filter((f) => f !== id);
                    await setFilters({
                        features: nextFeatures.length > 0 ? nextFeatures : null
                    });
                }
            },
        };
    }, [filters.features, setFilters]);

    // --- 3. Derived State ---

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.bedrooms) count++;
        if (filters.bathrooms) count++;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        if (filters.moveInDate) count++;
        if (filters.features && filters.features.length > 0) count++;
        return count;
    }, [filters.bedrooms, filters.bathrooms, filters.minPrice, filters.maxPrice, filters.moveInDate, filters.features]);

    // --- 4. Getters ---

    const getFilterButtonProps = useCallback((isFilterOpen: boolean, onFilterClick: () => void): FilterButtonProps => ({
        activeFilterCount,
        isFilterOpen,
        onFilterClick,
    }), [activeFilterCount]);

    // --- 5. Actions ---

    const clearFilters = useCallback(async () => {
        await setFilters({
            minPrice: null,
            maxPrice: null,
            bedrooms: null,
            bathrooms: null,
            moveInDate: null,
            features: null
        });
    }, [setFilters]);

    return {
        ...filters,
        activeFilterCount,
        sortOptionProps,
        searchInputProps,
        priceRangeProps,
        bedroomToggleProps,
        bathroomToggleProps,
        datePickerProps,
        getFeatureCheckboxProps,
        getFilterButtonProps,
        clearFilters,
    };
}