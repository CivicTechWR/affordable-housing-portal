"use server";

import { createAccountService } from "@/lib/accounts/account.service";
import type { InviteActionResult, InviteRecord } from "@/components/admin-invite/types";
import {
  createAccountInviteSchema,
  type CreateAccountResponse,
} from "@/shared/schemas/account-management";

export type SendAdminInviteActionState =
  | {
      status: "idle";
      message: string;
      invite?: undefined;
    }
  | InviteActionResult;

function normalizeOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function buildInviteRecordFromResponse(data: CreateAccountResponse["data"]): InviteRecord {
  return {
    id: data.id,
    email: data.email.trim().toLowerCase(),
    role: data.role,
    invitedAt: new Date().toISOString(),
    status: "sent",
  };
}

export async function sendAdminInviteAction(
  _state: SendAdminInviteActionState,
  formData: FormData,
): Promise<SendAdminInviteActionState> {
  try {
    const rawValues = {
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
      organization: normalizeOptionalString(formData.get("organization")),
      sendInviteEmail: true,
    };

    const parsed = createAccountInviteSchema.safeParse(rawValues);

    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid invite details.",
      };
    }

    const result = await createAccountService(parsed.data);

    if (!result.ok) {
      return {
        status: "error",
        message: result.error.message,
      };
    }

    const invite = buildInviteRecordFromResponse(result.value.data);

    return {
      status: "sent",
      message: result.value.message,
      invite,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Unable to send the invite right now.",
    };
  }
}
