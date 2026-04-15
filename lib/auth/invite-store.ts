import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { userInvites, users } from "@/db/schema";
import { hashOpaqueToken } from "@/lib/auth/token";

export class InviteUnavailableError extends Error {
  constructor() {
    super("Invite is no longer valid.");
    this.name = "InviteUnavailableError";
  }
}

export async function getPendingInviteByToken(token: string) {
  const tokenHash = hashOpaqueToken(token);
  const [invite] = await db
    .select({
      invite: userInvites,
      user: users,
    })
    .from(userInvites)
    .innerJoin(users, eq(userInvites.userId, users.id))
    .where(
      and(
        eq(userInvites.tokenHash, tokenHash),
        isNull(userInvites.acceptedAt),
        gt(userInvites.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return invite ?? null;
}

export async function acceptInvite(params: {
  inviteId: string;
  userId: string;
  passwordHash: string;
}) {
  const now = new Date();

  await db.transaction(async (tx) => {
    const acceptedInvites = await tx
      .update(userInvites)
      .set({
        acceptedAt: now,
      })
      .where(
        and(
          eq(userInvites.id, params.inviteId),
          eq(userInvites.userId, params.userId),
          isNull(userInvites.acceptedAt),
          gt(userInvites.expiresAt, now),
        ),
      )
      .returning({ id: userInvites.id });

    if (acceptedInvites.length === 0) {
      throw new InviteUnavailableError();
    }

    await tx
      .update(users)
      .set({
        passwordHash: params.passwordHash,
        status: "active",
        inviteAcceptedAt: now,
      })
      .where(eq(users.id, params.userId));
  });
}
