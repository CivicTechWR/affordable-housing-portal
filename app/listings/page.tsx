import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ListingsDashboard from "./listings";

export default async function ListingsPage() {
  return (
    <NuqsAdapter>
      <Suspense>
        <ListingsDashboard />
      </Suspense>
    </NuqsAdapter>
  );
}
