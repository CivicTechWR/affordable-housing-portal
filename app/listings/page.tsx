import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { listingListResponseSchema, type ListingSummary } from "@/shared/schemas/listings";

import ListingsDashboard from "./listings";

async function getListingsFromApi(): Promise<ListingSummary[]> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const allowedHosts = new Set([
    "localhost:3000",
    "localhost:3100",
    "localhost:3200",
    "localhost:3201",
  ]);
  const trustedBaseUrl = process.env.NEXTAUTH_URL;

  const baseUrl =
    trustedBaseUrl || (host && allowedHosts.has(host) ? `${protocol}://${host}` : null);

  if (!baseUrl) {
    throw new Error("Missing trusted base URL for listings request.");
  }

  const response = await fetch(`${baseUrl}/api/listings?limit=50`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load listings.");
  }

  const payload = listingListResponseSchema.parse(await response.json());
  return payload.data;
}

export default async function ListingsPage() {
  const listings = await getListingsFromApi();

  return (
    <NuqsAdapter>
      <ListingsDashboard initialListings={listings} />
    </NuqsAdapter>
  );
}
