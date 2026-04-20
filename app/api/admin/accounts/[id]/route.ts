import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { db } from "@/db";
import { listings, properties, users } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/session";
import { errorMessageSchema } from "@/shared/schemas/common";
import {
  accountByIdResponseSchema,
  accountParamsSchema,
  deactivateAccountResponseSchema,
  updateAccountResponseSchema,
  updateAccountSchema,
} from "@/shared/schemas/account-management";

export const { GET, PUT, DELETE } = route({
  getAccountById: routeOperation({
    method: "GET",
  })
    .input({
      params: accountParamsSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: accountByIdResponseSchema,
      },
      {
        status: 401,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 403,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 404,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (_request, { params }) => {
      const { response } = await requireAdminSession();

      if (response) {
        return response;
      }

      const account = await getAccountRecord(params.id);

      if (!account) {
        return NextResponse.json({ message: "Account not found" }, { status: 404 });
      }

      return NextResponse.json({
        data: account,
      });
    }),

  updateAccountById: routeOperation({
    method: "PUT",
  })
    .input({
      params: accountParamsSchema,
      contentType: "application/json",
      body: updateAccountSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: updateAccountResponseSchema,
      },
      {
        status: 401,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 403,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 404,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 409,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (request, { params }) => {
      const sessionResult = await requireAdminSession();
      const { response } = sessionResult;

      if (response) {
        return response;
      }

      const body = await request.json();
      const targetUser = await getAccountForMutation(params.id);

      if (!targetUser) {
        return NextResponse.json({ message: "Account not found" }, { status: 404 });
      }

      const nextRole = body.role ?? targetUser.role;
      const nextStatus = body.status ?? targetUser.status;

      if (
        params.id === sessionResult.session.user.id &&
        (nextRole !== "admin" || nextStatus !== "active")
      ) {
        return NextResponse.json(
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
        return NextResponse.json({ message: "Account not found" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Account updated",
        data: { id: params.id, ...body },
      });
    }),

  deactivateAccountById: routeOperation({
    method: "DELETE",
  })
    .input({
      params: accountParamsSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: deactivateAccountResponseSchema,
      },
      {
        status: 401,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 403,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 404,
        contentType: "application/json",
        body: errorMessageSchema,
      },
      {
        status: 409,
        contentType: "application/json",
        body: errorMessageSchema,
      },
    ])
    .handler(async (_request, { params }) => {
      const sessionResult = await requireAdminSession();
      const { response } = sessionResult;

      if (response) {
        return response;
      }

      if (params.id === sessionResult.session.user.id) {
        return NextResponse.json(
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
        return NextResponse.json({ message: "Account not found" }, { status: 404 });
      }

      return NextResponse.json({
        message: "Account deactivated",
        data: { id: params.id },
      });
    }),
});

async function getAccountRecord(accountId: string) {
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

  if (!user) {
    return null;
  }

  const listingCounts = await db
    .select({ total: count(listings.id) })
    .from(properties)
    .leftJoin(listings, eq(listings.propertyId, properties.id))
    .where(eq(properties.ownerUserId, accountId));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization: user.organization,
    status: user.status,
    listingsCount: listingCounts[0]?.total ?? 0,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function getAccountForMutation(accountId: string) {
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, accountId))
    .limit(1);

  return user ?? null;
}
