import { connection } from "next/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsSkeleton from "@/components/listings-skeleton/ListingsSkeleton";
import { Suspense } from "react";
import { readListings } from "@/lib/listings/queries";

import ListingsDashboard from "./listings";
import { getListingsDashboardData } from "./data";

async function getListings() {
  await connection();

  const payload = await readListings({
    limit: 50,
  });

  return payload.data;
}

export default async function ListingsPage() {
  const [listings, { dynamicGroups }] = await Promise.all([
    getListings(),
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
