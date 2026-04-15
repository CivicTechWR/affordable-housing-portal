import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type UserStatus } from "@/db/schema";

export async function getUserForAuth(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user ?? null;
}

export async function getUserForSession(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export function isUserAllowedToSignIn(status: UserStatus) {
  return status === "active";
}

export async function recordSuccessfulLogin(userId: string) {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}
