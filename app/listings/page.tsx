import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsSkeleton from "@/components/listings-skeleton/ListingsSkeleton";
import { Suspense } from "react";
import { listingListResponseSchema, type ListingSummary } from "@/shared/schemas/listings";

import ListingsDashboard from "./listings";
import { getListingsDashboardData } from "./data";

async function getListingsFromApi(): Promise<ListingSummary[]> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Missing host header for listings request.");
  }

  const response = await fetch(`${protocol}://${host}/api/listings?limit=50`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load listings.");
  }

  const payload = listingListResponseSchema.parse(await response.json());
  return payload.data;
}

export default async function ListingsPage() {
  const [listings, { dynamicGroups }] = await Promise.all([
    getListingsFromApi(),
    getListingsDashboardData(),
  ]);

  return (
    <NuqsAdapter>
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsDashboard initialListings={listings} dynamicGroups={dynamicGroups} />
      </Suspense>
    </NuqsAdapter>
  );
}
