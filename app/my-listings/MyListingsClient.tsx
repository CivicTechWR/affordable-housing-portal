"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function MyListingsClient({ initialListings }: MyListingsClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(listingId: string) {
    setDeleteError(null);
    setDeletingListingId(listingId);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Unable to delete listing.");
      }

      setListings((current) =>
        current.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: "archived",
                updatedAt: new Date().toISOString(),
              }
            : listing,
        ),
      );
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete listing. Please try again.",
      );
    } finally {
      setDeletingListingId(null);
    }
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No listings yet. Start a draft to begin publishing inventory.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {deleteError}
        </div>
      ) : null}

      <div className="grid gap-4">
        {listings.map((listing) => {
          const isDeleted = listing.status === "archived";
          const isDeleting = deletingListingId === listing.id;

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
                        {formatDistanceToNow(new Date(listing.updatedAt), { addSuffix: true })}
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
                          disabled={isDeleting}
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
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This listing is in a deleted state and is no longer publicly visible.
                      </p>
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
