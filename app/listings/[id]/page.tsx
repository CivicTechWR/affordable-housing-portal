import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ListingDetails } from "@/components/listing-details/ListingDetails";
import type { ListingDetailProps } from "@/components/listing-details/ListingDetails";
import {
  listingByIdResponseSchema,
  type ListingDetails as ListingDetailsData,
} from "@/shared/schemas/listings";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getListingFromApi(id: string): Promise<ListingDetailsData> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    notFound();
  }

  const response = await fetch(`${protocol}://${host}/api/listings/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load listing details");
  }

  const payload = listingByIdResponseSchema.parse(await response.json());
  return payload.data;
}

function mapListingDetailsToDisplay(details: ListingDetailsData): ListingDetailProps {
  return {
    title: details.title,
    price: details.price,
    unitNumber: details.unitNumber,
    street1: details.address.street1,
    street2: details.address.street2,
    city: details.address.city,
    postalCode: details.address.postalCode,
    beds: details.beds,
    baths: details.baths,
    sqft: details.sqft,
    images: details.images,
    timeAgo: details.timeAgo,
    features: details.features,
    contactName: details.contact?.name,
    contactEmail: details.contact?.email,
    contactPhone: details.contact?.phone,
  };
}

export default async function ListingDetailsPage({ params }: Readonly<PageProps>) {
  const { id } = await params;
  const details = await getListingFromApi(id);
  const displayDetails = mapListingDetailsToDisplay(details);

  return <ListingDetails {...displayDetails} />;
}
