import { connection } from "next/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { readListings } from "@/lib/listings/queries";

import ListingsDashboard from "./listings";

async function getListings() {
  await connection();

  const payload = await readListings({
    limit: 50,
  });

  return payload.data;
}

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <NuqsAdapter>
      <ListingsDashboard initialListings={listings} />
    </NuqsAdapter>
  );
}
