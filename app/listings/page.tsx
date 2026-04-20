// app/listings/page.tsx
// types/listings.ts
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsDashboard from "./listings";
import ListingsSkeleton from "@/components/listings-skeleton/ListingsSkeleton";
import { Suspense } from "react";
import { getListingsDashboardData } from "./data";

export default async function ListingsPage() {
  const { listings, dynamicGroups } = await getListingsDashboardData();

  return (
    <NuqsAdapter>
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsDashboard initialListings={listings} dynamicGroups={dynamicGroups} />
      </Suspense>
    </NuqsAdapter>
  );
}
