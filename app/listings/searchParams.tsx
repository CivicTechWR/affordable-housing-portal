import {
  createSearchParamsCache,
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  parseAsStringEnum,
  parseAsIsoDateTime,
} from 'nuqs/server';

const sortOptions = ['newest', 'price_asc', 'price_desc'];

// 1. Define the raw parsers as a standalone object
export const listingSearchParamsParsers = {
  location: parseAsString,
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  bedrooms: parseAsString,
  bathrooms: parseAsString,
  moveInDate: parseAsIsoDateTime,
  sort: parseAsStringEnum(sortOptions).withDefault('newest'),
  features: parseAsArrayOf(parseAsString).withDefault([]),};

// 2. Pass the parsers into the server cache
export const listingSearchParamsCache = createSearchParamsCache(listingSearchParamsParsers);