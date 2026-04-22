import { connection } from "next/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsSkeleton from "@/components/listings-skeleton/ListingsSkeleton";
import { Suspense } from "react";
import { getListingsService } from "@/lib/listings/listing.service";
import type { ListingQuery } from "@/shared/schemas/listings";

import ListingsDashboard from "./listings";
import { getListingsDashboardData } from "./data";
import { createListingsQueryString, getListingsQueryFromSearchParams } from "./query";

async function getListings(query: ListingQuery) {
  await connection();

  const payload = await getListingsService(query);

  return payload;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = getListingsQueryFromSearchParams({
    ...resolvedSearchParams,
    limit: resolvedSearchParams.limit ?? "50",
  });

  const [initialData, { dynamicGroups }] = await Promise.all([
    getListings(query),
    getListingsDashboardData(),
  ]);

  return (
    <NuqsAdapter>
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsDashboard
          initialData={initialData}
          initialQueryString={createListingsQueryString(query)}
          dynamicGroups={dynamicGroups}
        />
      </Suspense>
    </NuqsAdapter>
  );
}
