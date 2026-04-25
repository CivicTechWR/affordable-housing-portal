import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getOptionalSession } from "@/lib/auth/session";
import { getAdminCustomListingFieldsService } from "@/lib/custom-listing-fields/custom-listing-field-admin.service";
import { CustomListingFieldsDashboard } from "./CustomListingFieldsDashboard";
import { PageMessage } from "@/components/page-shell/AppPageShell";

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
      <PageMessage title="Admin access required">
        Only admin accounts can manage custom listing fields.
      </PageMessage>
    );
  }

  const result = await getAdminCustomListingFieldsService({});

  if (!result.ok) {
    return <PageMessage title="Unable to load custom fields">{result.error.message}</PageMessage>;
  }

  return <CustomListingFieldsDashboard initialFields={result.value.data} />;
}
