import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ListingDetails } from "@/components/listing-details/ListingDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ListingFeature = {
  name: string;
  description: string;
};

type ListingFeatureCategory = {
  categoryName: string;
  features: ListingFeature[];
};

type ListingImage = {
  url: string;
  caption: string;
};

type ListingDetails = {
  id: string;
  title?: string;
  price: number;
  city?: string;
  beds: number;
  baths: number;
  sqft: number;
  images: ListingImage[];
  timeAgo: string;
  features: ListingFeatureCategory[];
  unitNumber?: string;
  address?: string;
  street1?: string;
  street2?: string;
};

async function getListingFromApi(id: string): Promise<ListingDetails> {
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

  const payload = (await response.json()) as { data: ListingDetails };
  return payload.data;
}

export default async function ListingDetailsPage({ params }: Readonly<PageProps>) {
  const { id } = await params;
  const details = await getListingFromApi(id);

  return (
    <ListingDetails
      title={details.title}
      price={details.price}
      unitNumber={details.unitNumber}
      street1={details.street1 ?? details.address ?? ""}
      street2={details.street2}
      city={details.city ?? ""}
      beds={details.beds}
      baths={details.baths}
      sqft={details.sqft}
      images={details.images}
      timeAgo={details.timeAgo}
      features={details.features}
    />
  );
}
