import type { Metadata } from "next";
import { redirect } from "next/navigation";

import verbiage from "@/content/verbiage.json";
import { buildInviteRecordFromAccountInvite } from "@/components/admin-invite/invite-records";
import { AdminInvitePanel } from "@/components/admin-invite/AdminInvitePanel";
import { PageMessage } from "@/components/page-shell/AppPageShell";
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
      <PageMessage
        title="Admin access required"
        className="min-h-screen bg-background"
        contentClassName="bg-card"
      >
        Only admin accounts can send and review account invites.
      </PageMessage>
    );
  }

  const initialInvites = await getInitialInvites();

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <AdminInvitePanel initialInvites={initialInvites} shouldHydrateInvites={false} />
    </main>
  );
}
