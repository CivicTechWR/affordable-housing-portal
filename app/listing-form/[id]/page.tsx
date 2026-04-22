import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import ListingForm from "../ListingForm";
import { ListingFormSkeleton } from "@/components/listing-form-skeleton/ListingFormSkeleton";
import { getOptionalSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Edit Listing | WR Housing Bridge",
};

export const dynamic = "force-dynamic";

export default async function EditListingFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { session, authzUser }] = await Promise.all([params, getOptionalSession()]);

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (authzUser?.role !== "admin" && authzUser?.role !== "partner") {
    return (
      <main className="min-h-[calc(100vh-7rem)] bg-muted/60 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-md border border-border bg-background p-6">
          <h1 className="text-xl font-semibold">Listing author access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only partner and admin accounts can manage listing drafts.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div data-listing-form-page="true" className="h-full">
      <Suspense fallback={<ListingFormSkeleton />}>
        <ListingForm listingId={id} />
      </Suspense>
    </div>
  );
}
