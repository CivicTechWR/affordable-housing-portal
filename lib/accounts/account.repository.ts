import "server-only";

import { count, desc, eq, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { users, type UserRole, type UserStatus } from "@/db/schema";

export type AccountListRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountRecord = AccountListRow;

export type AccountUpdateTarget = {
  id: string;
  role: UserRole;
  status: UserStatus;
};

export async function findAccounts(input: { where?: SQL<unknown>; page: number; limit: number }) {
  const offset = (input.page - 1) * input.limit;

  const totalRows = await db.select({ total: count() }).from(users).where(input.where);
  const total = Number(totalRows[0]?.total ?? 0);

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.fullName,
      role: users.role,
      organization: users.organization,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(input.where)
    .orderBy(desc(users.createdAt))
    .limit(input.limit)
    .offset(offset);

  return {
    total,
    rows,
  };
}

export async function findAccountById(accountId: string): Promise<AccountRecord | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.fullName,
      role: users.role,
      organization: users.organization,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, accountId))
    .limit(1);

  return user ?? null;
}

export async function findAccountUpdateTarget(
  accountId: string,
): Promise<AccountUpdateTarget | null> {
  const [targetUser] = await db
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, accountId))
    .limit(1);

  return targetUser ?? null;
}

export async function updateAccountById(input: {
  accountId: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  organization?: string | null;
}) {
  const [updatedUser] = await db
    .update(users)
    .set({
      fullName: input.name,
      role: input.role,
      status: input.status,
      organization: input.organization,
    })
    .where(eq(users.id, input.accountId))
    .returning({ id: users.id });

  return updatedUser ?? null;
}

export async function deactivateAccountById(accountId: string) {
  const [updatedUser] = await db
    .update(users)
    .set({
      status: "deactivated",
    })
    .where(eq(users.id, accountId))
    .returning({ id: users.id });

  return updatedUser ?? null;
}
