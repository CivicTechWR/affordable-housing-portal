import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

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

      // TODO: query database with filters
      void [page, limit, role, status, search];

      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
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
            inviteUrl: invite.inviteUrl,
          },
        },
        { status: 201 },
      );
    }),
});
