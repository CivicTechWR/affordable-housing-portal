import type { ListingsQuery, ListingsResponse } from "@/lib/listings/types";

function appendOptionalNumber(params: URLSearchParams, key: string, value: number | null | undefined) {
  if (value != null) {
    params.set(key, value.toString());
  }
}

export function buildListingsSearchParams(query: ListingsQuery) {
  const params = new URLSearchParams();

  appendOptionalNumber(params, "page", query.page);
  appendOptionalNumber(params, "limit", query.limit);

  if (query.location) {
    params.set("location", query.location);
  }

  appendOptionalNumber(params, "minPrice", query.minPrice);
  appendOptionalNumber(params, "maxPrice", query.maxPrice);
  appendOptionalNumber(params, "bedrooms", query.bedrooms);
  appendOptionalNumber(params, "bathrooms", query.bathrooms);

  if (query.moveInDate) {
    params.set("moveInDate", query.moveInDate);
  }

  if (query.sort) {
    params.set("sort", query.sort);
  }

  for (const feature of query.features ?? []) {
    params.append("features", feature);
  }

  return params;
}

export async function fetchListings(query: ListingsQuery, signal?: AbortSignal): Promise<ListingsResponse> {
  const params = buildListingsSearchParams(query);
  const requestUrl = params.size > 0 ? `/api/listings?${params.toString()}` : "/api/listings";
  const response = await fetch(requestUrl, {
    method: "GET",
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load listings right now.");
  }

  return response.json() as Promise<ListingsResponse>;
}
