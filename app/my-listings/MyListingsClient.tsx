"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDistance } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertBanner } from "@/components/ui/alert-banner";
import { EmptyState } from "@/components/ui/empty-state";

type MyListingItem = {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
  price: number;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl?: string;
  updatedAt: string;
  publishedAt?: string;
  editUrl: string;
  viewUrl: string;
};

type MyListingsClientProps = {
  initialListings: MyListingItem[];
  renderedAt: string;
};

const statusVariantByLabel = {
  draft: "secondary",
  published: "default",
  archived: "outline",
} as const;

const statusLabelByValue = {
  draft: "Draft",
  published: "Published",
  archived: "Deleted",
} as const;

export function MyListingsClient({ initialListings, renderedAt }: MyListingsClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState(sortListings(initialListings));
  const [mutatingListingId, setMutatingListingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date(renderedAt));

  useEffect(() => {
    setNow(new Date());

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setListings(sortListings(initialListings));
  }, [initialListings]);

  async function handleDelete(listingId: string) {
    setMutationError(null);
    setMutatingListingId(listingId);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Unable to delete listing.");
      }

      setListings((current) =>
        sortListings(
          current.map((listing) =>
            listing.id === listingId
              ? {
                  ...listing,
                  status: "archived",
                  updatedAt: new Date().toISOString(),
                }
              : listing,
          ),
        ),
      );
      router.refresh();
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : "Unable to delete listing. Please try again.",
      );
    } finally {
      setMutatingListingId(null);
    }
  }

  async function handleUndelete(listingId: string) {
    setMutationError(null);
    setMutatingListingId(listingId);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "draft" }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Unable to restore listing.");
      }

      setListings((current) =>
        sortListings(
          current.map((listing) =>
            listing.id === listingId
              ? {
                  ...listing,
                  status: "draft",
                  updatedAt: new Date().toISOString(),
                }
              : listing,
          ),
        ),
      );
      router.refresh();
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : "Unable to restore listing. Please try again.",
      );
    } finally {
      setMutatingListingId(null);
    }
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState size="spacious" className="border-0">
            No listings yet. Start a draft to begin publishing inventory.
          </EmptyState>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mutationError ? (
        <AlertBanner variant="error" size="default" className="rounded-lg">
          {mutationError}
        </AlertBanner>
      ) : null}

      <div className="grid gap-4">
        {listings.map((listing) => {
          const isDeleted = listing.status === "archived";
          const isMutating = mutatingListingId === listing.id;

          return (
            <Card key={listing.id}>
              <div className="grid gap-4 px-4 md:grid-cols-[220px_1fr]">
                <div className="overflow-hidden rounded-lg bg-muted/30">
                  <div className="h-full min-h-44">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-44 items-center justify-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-h-44 flex-col">
                  <CardHeader className="flex flex-row items-start justify-between gap-6 px-0">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-xl font-semibold tracking-tight">
                          {listing.title}
                        </CardTitle>
                        <Badge variant={statusVariantByLabel[listing.status]}>
                          {statusLabelByValue[listing.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {listing.address}, {listing.city}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Updated{" "}
                        {formatDistance(new Date(listing.updatedAt), now, { addSuffix: true })}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${listing.price.toLocaleString("en-CA")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {listing.beds} bd • {listing.baths} ba • {listing.sqft} sqft
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="mt-auto flex flex-wrap items-center justify-end gap-3 px-0 pt-4">
                    {!isDeleted ? (
                      <>
                        {listing.status === "published" ? (
                          <Button asChild variant="outline">
                            <Link href={listing.viewUrl}>View listing</Link>
                          </Button>
                        ) : null}
                        <Button asChild>
                          <Link href={listing.editUrl}>
                            {listing.status === "draft" ? "Resume draft" : "Edit listing"}
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete this listing? It will be kept in a deleted state and can be recovered later from the database if needed.",
                              )
                            ) {
                              void handleDelete(listing.id);
                            }
                          }}
                        >
                          {isMutating ? "Deleting..." : "Delete"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          This listing is in a deleted state and is no longer publicly visible.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating}
                          onClick={() => void handleUndelete(listing.id)}
                        >
                          {isMutating ? "Restoring..." : "Undelete"}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function sortListings(listings: MyListingItem[]) {
  return [...listings].sort((left, right) => {
    if (left.status === "archived" && right.status !== "archived") {
      return 1;
    }

    if (left.status !== "archived" && right.status === "archived") {
      return -1;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}
