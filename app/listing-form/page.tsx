import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import ListingForm from "./ListingForm";
import { ListingFormSkeleton } from "@/components/listing-form-skeleton/ListingFormSkeleton";
import { PageMessage } from "@/components/page-shell/AppPageShell";
import { getOptionalSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "New Listing | WR Housing Bridge",
};

export const dynamic = "force-dynamic";

export default async function ListingFormPage() {
  const { session, authzUser } = await getOptionalSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (authzUser?.role !== "admin" && authzUser?.role !== "partner") {
    return (
      <PageMessage title="Listing author access required">
        Only partner and admin accounts can create new listings.
      </PageMessage>
    );
  }

  return (
    <div data-listing-form-page="true" className="h-full">
      <Suspense fallback={<ListingFormSkeleton />}>
        <ListingForm />
      </Suspense>
    </div>
  );
}
