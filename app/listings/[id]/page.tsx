import { notFound } from "next/navigation";

import { getOptionalSession } from "@/lib/auth/session";
import { readListingById, toListingReadContext } from "@/lib/listings/queries";
import { ListingDetails } from "@/components/listing-details/ListingDetails";
import type { ListingDetailProps } from "@/components/listing-details/ListingDetails";
import type { ListingDetails as ListingDetailsData } from "@/shared/schemas/listings";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getListingDetails(id: string): Promise<ListingDetailsData> {
  const optionalSession = await getOptionalSession();
  const details = await readListingById({
    id,
    auth: toListingReadContext(optionalSession),
  });

  if (!details) {
    notFound();
  }

  return details;
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
  const details = await getListingDetails(id);
  const displayDetails = mapListingDetailsToDisplay(details);

  return <ListingDetails {...displayDetails} />;
}
