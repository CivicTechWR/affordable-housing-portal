import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  price: number;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  images: ListingImage[];
  timeAgo: string;
  features: ListingFeatureCategory[];
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

  const propertyRows: Array<{ label: string; value: string }> = [
    { label: "ID", value: details.id },
    { label: "Price", value: `$${details.price.toLocaleString()}` },
    { label: "Address", value: details.address },
    { label: "City", value: details.city },
    { label: "Bedrooms", value: String(details.beds) },
    { label: "Bathrooms", value: String(details.baths) },
    { label: "Square Feet", value: `${details.sqft.toLocaleString()} sqft` },
    { label: "Posted", value: details.timeAgo },
    { label: "Image Count", value: String(details.images.length) },
  ];

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Listing details</p>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {details.address}, {details.city}
            </h1>
          </div>
          <Link
            href="/listings"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            Back to listings
          </Link>
        </div>

        {details.images[0] && (
          <Card>
            <CardContent className="p-0">
              <img
                src={details.images[0].url}
                alt={details.images[0].caption || `${details.address}, ${details.city}`}
                className="h-64 w-full object-cover sm:h-80"
              />
            </CardContent>
          </Card>
        )}

        {details.images.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Image gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {details.images.map((image, index) => (
                  <figure
                    key={`${image.url}-${index}`}
                    className="overflow-hidden rounded-md border border-border"
                  >
                    <img
                      src={image.url}
                      alt={
                        image.caption || `${details.address}, ${details.city} image ${index + 1}`
                      }
                      className="h-44 w-full object-cover"
                    />
                    {image.caption && (
                      <figcaption className="border-t border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Property attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {propertyRows.map((row) => (
                <div key={row.label} className="rounded-md border border-border bg-background p-3">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {details.features.map((category) => (
              <section key={category.categoryName} className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">{category.categoryName}</h2>
                <div className="flex flex-wrap gap-2">
                  {category.features.map((feature) => (
                    <Badge key={feature.name} variant="secondary" title={feature.description}>
                      {feature.name}
                    </Badge>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
