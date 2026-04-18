import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { users, type UserStatus } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/validation";

const DEFAULT_BOOTSTRAP_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_BOOTSTRAP_ADMIN_NAME = "admin";

export async function getUserForAuth(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user ?? null;
}

export async function ensureBootstrapAdmin(email: string, password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    return null;
  }

  const parsedPassword = passwordSchema.safeParse(configuredPassword);

  if (!parsedPassword.success) {
    throw new Error("ADMIN_PASSWORD does not satisfy the configured password policy.");
  }

  const bootstrapEmail = (process.env.ADMIN_EMAIL ?? DEFAULT_BOOTSTRAP_ADMIN_EMAIL)
    .trim()
    .toLowerCase();

  if (email !== bootstrapEmail || password !== parsedPassword.data) {
    return null;
  }

  return db.transaction(async (tx) => {
    const [existingAdmin] = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "admin"), isNotNull(users.passwordHash)))
      .limit(1);

    if (existingAdmin) {
      return null;
    }

    const now = new Date();
    const passwordHash = await hashPassword(parsedPassword.data);
    const [bootstrapAdmin] = await tx
      .insert(users)
      .values({
        email: bootstrapEmail,
        fullName: DEFAULT_BOOTSTRAP_ADMIN_NAME,
        passwordHash,
        role: "admin",
        status: "active",
        inviteAcceptedAt: now,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          fullName: DEFAULT_BOOTSTRAP_ADMIN_NAME,
          passwordHash,
          role: "admin",
          status: "active",
          inviteAcceptedAt: now,
        },
      })
      .returning();

    return bootstrapAdmin ?? null;
  });
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
