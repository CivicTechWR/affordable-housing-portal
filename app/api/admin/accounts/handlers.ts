import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { TypedNextResponse } from "next-rest-framework";

import { db } from "@/db";
import { users, type UserRole, type UserStatus } from "@/db/schema";
import { createInvite } from "@/lib/auth/invite-service";
import { requireAdminSession } from "@/lib/auth/session";
import type {
  AccountListResponse,
  CreateAccountInviteInput,
  CreateAccountResponse,
} from "@/shared/schemas/account-management";

export async function getAccountsHandler(request: Request) {
  const sessionResult = await requireAdminSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const offset = (page - 1) * limit;

  const filters = [];

  if (role) {
    filters.push(eq(users.role, role as UserRole));
  }

  if (status) {
    filters.push(eq(users.status, status as UserStatus));
  }

  if (search) {
    const searchTerm = `%${search}%`;

    filters.push(
      or(
        ilike(users.email, searchTerm),
        ilike(users.fullName, searchTerm),
        ilike(users.organization, searchTerm),
      )!,
    );
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const totalRows = await db.select({ total: count() }).from(users).where(whereClause);
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
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return TypedNextResponse.json<AccountListResponse, 200, "application/json">({
    data: rows.map((row) => ({
      ...row,
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  });
}

export async function createAccountHandler(request: Request) {
  const sessionResult = await requireAdminSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  const { session } = sessionResult;

  const body = (await request.json()) as CreateAccountInviteInput;
  const invite = await createInvite({
    email: body.email,
    fullName: body.name,
    role: body.role,
    organization: body.organization,
    invitedByUserId: session.user.id,
    sendInviteEmail: body.sendInviteEmail === true,
  });

  return TypedNextResponse.json<CreateAccountResponse, 201, "application/json">(
    {
      message: "Account invited",
      data: {
        id: invite.userId,
        email: invite.email,
        name: body.name,
        role: body.role,
        organization: invite.organization,
        inviteUrl: invite.inviteUrl,
      },
    },
    { status: 201 },
  );
}
