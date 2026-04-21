import type { Metadata } from "next";
import { redirect } from "next/navigation";

import verbiage from "@/content/verbiage.json";
import { buildInviteRecordFromAccountInvite } from "@/components/admin-invite/invite-records";
import { AdminInvitePanel } from "@/components/admin-invite/AdminInvitePanel";
import { getOptionalSession } from "@/lib/auth/session";
import { getRecentAccountInvitesService } from "@/lib/accounts/account.service";

export const metadata: Metadata = {
  title: verbiage.adminInvite.pageTitle,
  description: verbiage.adminInvite.pageDescription,
};

export const dynamic = "force-dynamic";

async function getInitialInvites() {
  const result = await getRecentAccountInvitesService(8);

  if (!result.ok) {
    return [];
  }

  return result.value.data.map(buildInviteRecordFromAccountInvite);
}

export default async function AdminInvitePage() {
  const { session, authzUser } = await getOptionalSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (authzUser?.role !== "admin") {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-md border border-border bg-card p-6">
          <h1 className="text-xl font-semibold text-foreground">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only admin accounts can send and review account invites.
          </p>
        </div>
      </main>
    );
  }

  const initialInvites = await getInitialInvites();

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <AdminInvitePanel initialInvites={initialInvites} shouldHydrateInvites={false} />
    </main>
  );
}
