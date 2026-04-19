import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingImageCarousel } from "@/components/listing-image-carousel/ListingImageCarousel";
import { listingByIdResponseSchema, type ListingDetails } from "@/shared/schemas/listings";

type PageProps = {
  params: Promise<{ id: string }>;
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

  const payload = listingByIdResponseSchema.parse(await response.json());
  return payload.data;
}

export default async function ListingDetailsPage({ params }: Readonly<PageProps>) {
  const { id } = await params;
  const details = await getListingFromApi(id);

  const propertyRows: Array<{ label: string; value: string }> = [
    { label: "Rental Cost", value: `$${details.price.toLocaleString()}` },
    { label: "Address", value: `${details.address}, ${details.city}` },
    { label: "Bedrooms", value: String(details.beds) },
    { label: "Bathrooms", value: String(details.baths) },
    { label: "Square Feet", value: `${details.sqft.toLocaleString()} sqft` },
    { label: "Posted", value: details.timeAgo },
  ];

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {details.address}, {details.city}
            </h1>
          </div>
        </div>

        {details.images.length > 0 && (
          <ListingImageCarousel
            images={details.images}
            altPrefix={`${details.address}, ${details.city}`}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rental Details</CardTitle>
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
            <CardTitle>Rental Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {details.features.map((category) => (
              <section key={category.categoryName} className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">{category.categoryName}</h2>
                <div className="flex flex-wrap gap-2">
                  {category.features.map((feature) => (
                    <Badge
                      key={feature.name}
                      variant="secondary"
                      title={feature.description}
                      className="text-sm px-3 py-1"
                    >
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
