import { Suspense } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import ListingsDashboard from "./listings";

export default function ListingsPage() {
  return (
    <NuqsAdapter>
      <Suspense fallback={<div className="h-screen bg-white" />}>
        <ListingsDashboard />
      </Suspense>
    </NuqsAdapter>
  );
}
