import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';

import type { ListingsQuery, ListingSortOption } from "@/lib/listings/types";

const sortOptions = ["newest", "price_asc", "price_desc"];

export const listingSearchParamsParsers = {
  location: parseAsString,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  bedrooms: parseAsInteger,
  bathrooms: parseAsFloat,
  moveInDate: parseAsIsoDateTime,
  sort: parseAsStringEnum(sortOptions).withDefault('newest'),
  features: parseAsArrayOf(parseAsString).withDefault([]),
};

export const listingSearchParamsCache = createSearchParamsCache(listingSearchParamsParsers);

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function parseListingsPageQuery(searchParams: PageSearchParams): Promise<ListingsQuery> {
  const filters = await listingSearchParamsCache.parse(searchParams);

  return {
    page: 1,
    limit: 50,
    location: filters.location,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    moveInDate: filters.moveInDate ? filters.moveInDate.toISOString() : null,
    sort: filters.sort as ListingSortOption,
    features: filters.features,
  };
}
