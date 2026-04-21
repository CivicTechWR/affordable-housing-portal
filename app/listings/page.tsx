import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { listListings } from "@/lib/listings/data";

import ListingsDashboard from "./listings";
import { parseListingsPageQuery } from "./searchParams";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initialQuery = await parseListingsPageQuery(searchParams);
  const initialData = listListings(initialQuery);

  return (
    <NuqsAdapter>
      <Suspense fallback={<div className="h-screen bg-white" />}>
        <ListingsDashboard initialData={initialData} initialQuery={initialQuery} />
      </Suspense>
    </NuqsAdapter>
  );
}
