import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createInvite } from "@/lib/auth/invite-service";
import { requireAdminSession } from "@/lib/auth/session";
import { accountQuerySchema } from "@/shared/schemas/account-management";
import type {
  AccountQuery,
  AccountListResponse,
  CreateAccountInviteInput,
  CreateAccountResponse,
} from "@/shared/schemas/account-management";

export async function getAccountsHandler(
  request: TypedNextRequest<"GET", string, unknown, AccountQuery>,
) {
  const sessionResult = await requireAdminSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  const query = accountQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;
  const role = query.role;
  const status = query.status;
  const search = query.search;
  const offset = (page - 1) * limit;

  const filters = [];

  if (role) {
    filters.push(eq(users.role, role));
  }

  if (status) {
    filters.push(eq(users.status, status));
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

export async function createAccountHandler(
  request: TypedNextRequest<"POST", "application/json", CreateAccountInviteInput>,
) {
  const sessionResult = await requireAdminSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  const { session } = sessionResult;

  const body = await request.json();
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
