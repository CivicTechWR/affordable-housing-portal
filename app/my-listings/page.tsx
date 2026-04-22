import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/auth/session";
import { getMyListingsService } from "@/lib/listings/listing.service";
import { MyListingsClient } from "./MyListingsClient";

export const metadata: Metadata = {
  title: "My Listings | WR Housing Bridge",
};

export default async function MyListingsPage() {
  const renderedAt = new Date().toISOString();
  const { session, authzUser } = await getOptionalSession();

  if (!session?.user) {
    return (
      <main className="min-h-[calc(100vh-7rem)] bg-muted/40 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-xl border bg-background p-6">
          <h1 className="text-2xl font-semibold">My Listings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your listings.</p>
        </div>
      </main>
    );
  }

  if (authzUser?.role !== "admin" && authzUser?.role !== "partner") {
    return (
      <main className="min-h-[calc(100vh-7rem)] bg-muted/40 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-xl border bg-background p-6">
          <h1 className="text-2xl font-semibold">My Listings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only partner and admin accounts can manage listings.
          </p>
        </div>
      </main>
    );
  }

  const result = await getMyListingsService();

  if (!result.ok) {
    return (
      <main className="min-h-[calc(100vh-7rem)] bg-muted/40 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-xl border bg-background p-6">
          <h1 className="text-2xl font-semibold">My Listings</h1>
          <p className="mt-2 text-sm text-destructive">{result.error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-muted/40 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Listings</h1>
            <p className="text-sm text-muted-foreground">
              Drafts autosave here as you build them. Publish when the listing is ready.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/listing-form">New listing</Link>
          </Button>
        </div>

        <MyListingsClient initialListings={result.value.data} renderedAt={renderedAt} />
      </div>
    </main>
  );
}
