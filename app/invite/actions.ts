"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import {
  acceptInvite,
  getPendingInviteByToken,
  InviteUnavailableError,
} from "@/lib/auth/invite-store";
import { hashPassword } from "@/lib/auth/password";
import { acceptInviteSchema } from "@/lib/auth/validation";

type InviteState = {
  error: string;
};

export async function acceptInviteAction(
  _state: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid invite details.",
    };
  }

  const pendingInvite = await getPendingInviteByToken(parsed.data.token);

  if (!pendingInvite) {
    return {
      error: "This invite is invalid or has expired.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await acceptInvite({
      inviteId: pendingInvite.invite.id,
      userId: pendingInvite.user.id,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof InviteUnavailableError) {
      return {
        error: "This invite is invalid or has expired.",
      };
    }

    throw error;
  }

  await signIn("credentials", {
    email: pendingInvite.user.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/");
}
