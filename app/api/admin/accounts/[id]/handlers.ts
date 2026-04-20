import { eq } from "drizzle-orm";
import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/session";
import type {
  AccountByIdResponse,
  AccountParams,
  DeactivateAccountResponse,
  UpdateAccountInput,
  UpdateAccountResponse,
} from "@/shared/schemas/account-management";

type AccountByIdRouteContext = {
  params: AccountParams;
};

export async function getAccountByIdHandler(
  _request: TypedNextRequest<"GET">,
  { params }: AccountByIdRouteContext,
) {
  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

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
    .where(eq(users.id, params.id))
    .limit(1);

  if (!user) {
    return TypedNextResponse.json<{ message: string }, 404, "application/json">(
      { message: "Account not found" },
      { status: 404 },
    );
  }

  const account = {
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  return TypedNextResponse.json<AccountByIdResponse, 200, "application/json">(
    {
      data: account,
    },
    { status: 200 },
  );
}

export async function updateAccountByIdHandler(
  request: TypedNextRequest<"PUT", "application/json", UpdateAccountInput>,
  { params }: AccountByIdRouteContext,
) {
  const sessionResult = await requireAdminSession();
  const { response } = sessionResult;

  if (response) {
    return response;
  }

  const body = await request.json();
  const [targetUser] = await db
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, params.id))
    .limit(1);

  if (!targetUser) {
    return TypedNextResponse.json<{ message: string }, 404, "application/json">(
      { message: "Account not found" },
      { status: 404 },
    );
  }

  const nextRole = body.role ?? targetUser.role;
  const nextStatus = body.status ?? targetUser.status;

  if (
    params.id === sessionResult.session.user.id &&
    (nextRole !== "admin" || nextStatus !== "active")
  ) {
    return TypedNextResponse.json<{ message: string }, 409, "application/json">(
      { message: "You cannot remove your own admin access." },
      { status: 409 },
    );
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      fullName: body.name,
      role: body.role,
      status: body.status,
      organization: body.organization,
    })
    .where(eq(users.id, params.id))
    .returning({ id: users.id });

  if (!updatedUser) {
    return TypedNextResponse.json<{ message: string }, 404, "application/json">(
      { message: "Account not found" },
      { status: 404 },
    );
  }

  return TypedNextResponse.json<UpdateAccountResponse, 200, "application/json">(
    {
      message: "Account updated",
      data: { id: params.id, ...body },
    },
    { status: 200 },
  );
}

export async function deactivateAccountByIdHandler(
  _request: TypedNextRequest<"DELETE">,
  { params }: AccountByIdRouteContext,
) {
  const sessionResult = await requireAdminSession();
  const { response } = sessionResult;

  if (response) {
    return response;
  }

  if (params.id === sessionResult.session.user.id) {
    return TypedNextResponse.json<{ message: string }, 409, "application/json">(
      { message: "You cannot deactivate your own admin account." },
      { status: 409 },
    );
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      status: "deactivated",
    })
    .where(eq(users.id, params.id))
    .returning({ id: users.id });

  if (!updatedUser) {
    return TypedNextResponse.json<{ message: string }, 404, "application/json">(
      { message: "Account not found" },
      { status: 404 },
    );
  }

  return TypedNextResponse.json<DeactivateAccountResponse, 200, "application/json">(
    {
      message: "Account deactivated",
      data: { id: params.id },
    },
    { status: 200 },
  );
}
