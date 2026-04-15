import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsDashboard from "./listings";
import ListingsSkeleton from "@/components/listings-skeleton/ListingsSkeleton";

export default async function ListingsPage() {
  return (
    <NuqsAdapter>
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsDashboard />
      </Suspense>
    </NuqsAdapter>
  );
}
