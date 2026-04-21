import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getOptionalSession } from "@/lib/auth/session";
import { getAdminCustomListingFieldsService } from "@/lib/custom-listing-fields/custom-listing-field-admin.service";
import { CustomListingFieldsDashboard } from "./CustomListingFieldsDashboard";

export const metadata: Metadata = {
  title: "Custom Listing Fields | WR Housing Bridge",
};

export const dynamic = "force-dynamic";

export default async function CustomListingFieldsPage() {
  const { session, authzUser } = await getOptionalSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (authzUser?.role !== "admin") {
    return (
      <main className="min-h-[calc(100vh-7rem)] bg-muted/60 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-md border border-border bg-background p-6">
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only admin accounts can manage custom listing fields.
          </p>
        </div>
      </main>
    );
  }

  const result = await getAdminCustomListingFieldsService({});

  if (!result.ok) {
    return (
      <main className="min-h-[calc(100vh-7rem)] bg-muted/60 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-md border border-border bg-background p-6">
          <h1 className="text-xl font-semibold">Unable to load custom fields</h1>
          <p className="mt-2 text-sm text-muted-foreground">{result.error.message}</p>
        </div>
      </main>
    );
  }

  return <CustomListingFieldsDashboard initialFields={result.value.data} />;
}
