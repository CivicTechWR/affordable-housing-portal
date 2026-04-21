import type { Metadata } from "next";

import verbiage from "@/content/verbiage.json";
import { AdminInvitePanel } from "@/components/admin-invite/AdminInvitePanel";

export const metadata: Metadata = {
  title: verbiage.adminInvite.previewPageTitle,
  description: verbiage.adminInvite.previewPageDescription,
};

export default function AdminInvitePreviewPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <AdminInvitePanel initialInvites={[]} shouldHydrateInvites={false} />
    </main>
  );
}
