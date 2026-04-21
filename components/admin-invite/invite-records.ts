import type { InviteRecord } from "@/components/admin-invite/types";
import type { AccountInviteListResponse } from "@/shared/schemas/account-management";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildInviteRecordFromAccountInvite(
  invite: AccountInviteListResponse["data"][number],
): InviteRecord {
  return {
    id: invite.id,
    email: normalizeEmail(invite.email),
    role: invite.role,
    invitedAt: invite.invitedAt,
    status: "sent",
  };
}
