import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { db } from "@/db";
import { listings, properties, users, type UserRole, type UserStatus } from "@/db/schema";
import { createInvite } from "@/lib/auth/invite-service";
import { requireAdminSession } from "@/lib/auth/session";
import { errorMessageSchema } from "@/shared/schemas/common";
import {
  accountListResponseSchema,
  accountQuerySchema,
  createAccountInviteSchema,
  createAccountResponseSchema,
} from "@/shared/schemas/account-management";

export const { GET, POST } = route({
  getAccounts: routeOperation({
    method: "GET",
  })
    .input({
      query: accountQuerySchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: accountListResponseSchema,
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
    ])
    .handler(async (request) => {
      const { response } = await requireAdminSession();

      if (response) {
        return response;
      }

      const { searchParams } = request.nextUrl;

      const page = Number(searchParams.get("page") ?? 1);
      const limit = Number(searchParams.get("limit") ?? 20);
      const role = searchParams.get("role");
      const status = searchParams.get("status");
      const search = searchParams.get("search");

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
      const offset = (page - 1) * limit;

      const totalRows = await db.select({ total: count() }).from(users).where(whereClause);
      const total = totalRows[0]?.total ?? 0;

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

      const listingCounts =
        rows.length > 0
          ? await db
              .select({
                ownerUserId: properties.ownerUserId,
                total: count(listings.id),
              })
              .from(properties)
              .leftJoin(listings, eq(listings.propertyId, properties.id))
              .where(
                inArray(
                  properties.ownerUserId,
                  rows.map((row) => row.id),
                ),
              )
              .groupBy(properties.ownerUserId)
          : [];

      const listingCountByUserId = new Map(
        listingCounts.map((row) => [row.ownerUserId, row.total]),
      );

      return NextResponse.json({
        data: rows.map((row) => ({
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role,
          organization: row.organization,
          status: row.status,
          listingsCount: listingCountByUserId.get(row.id) ?? 0,
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
    }),

  createAccount: routeOperation({
    method: "POST",
  })
    .input({
      contentType: "application/json",
      body: createAccountInviteSchema,
    })
    .outputs([
      {
        status: 201,
        contentType: "application/json",
        body: createAccountResponseSchema,
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
    ])
    .handler(async (request) => {
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

      return NextResponse.json(
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
    }),
});
