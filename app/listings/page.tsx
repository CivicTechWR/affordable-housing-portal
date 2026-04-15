// app/listings/page.tsx
// types/listings.ts
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsDashboard from "./listings";
import ListingsSkeleton from "@/components/listings-skeleton/ListingsSkeleton";
import { Suspense } from "react";

export default async function ListingsPage() {
  return (
    <NuqsAdapter>
      <Suspense fallback={<ListingsSkeleton />}>
        <ListingsDashboard />
      </Suspense>
    </NuqsAdapter>
  );
}
