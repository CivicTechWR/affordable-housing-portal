import { listingSearchParamsParsers } from '@/app/listings/searchParams';
import { useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

export function useListingFilters() {
    const [filters, setFilters] = useQueryStates(listingSearchParamsParsers);

    // --- 1. Static Props (Variables) ---
    const sortOptionProps = useMemo(() => ({
        sortOptions: [
            { value: "newest", label: "Newest" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
        ],
        value: filters.sort,
        onChange: async (value: string) => await setFilters({ sort: value }),
    }), [filters.sort, setFilters]);

    const searchInputProps = useMemo(() => ({
        value: filters.location ?? "",
        placeholder: "Search by city, neighbourhood, or address",
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
        type: "single" as const,
        title: "Bedrooms",
        value: filters.bedrooms?.toString(),
        onValueChange: async (val: string) => await setFilters({
            bedrooms: val === "" ? null : parseInt(val, 10)
        }),
    }), [filters.bedrooms, setFilters]);

    const bathroomToggleProps = useMemo(() => ({
        type: "single" as const,
        title: "Bathrooms",
        value: filters.bathrooms?.toString(),
        onValueChange: async (val: string) => await setFilters({
            bathrooms: val === "" ? null : parseInt(val, 10) // Fixed: was bedrooms
        }),
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

    // --- 3. Actions ---

    const clearFilters = useCallback(async () => {
        await setFilters({
            location: null,
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
        sortOptionProps,
        searchInputProps,
        priceRangeProps,
        bedroomToggleProps,
        bathroomToggleProps,
        datePickerProps,
        getFeatureCheckboxProps, // Still a getter because of the 'id' param
        clearFilters,
    };
}
