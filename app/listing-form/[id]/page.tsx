import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import ListingForm from "../ListingForm";
import { ListingFormSkeleton } from "@/components/listing-form-skeleton/ListingFormSkeleton";
import { PageMessage } from "@/components/page-shell/AppPageShell";
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
      <PageMessage title="Listing author access required">
        Only partner and admin accounts can manage listing drafts.
      </PageMessage>
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
