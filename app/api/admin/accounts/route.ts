import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { createInvite } from "@/lib/auth/invite-service";
import { requireAdminSession } from "@/lib/auth/session";
import {
  adminAccountsQuerySchema,
  createAdminAccountInviteSchema,
} from "@/shared/schemas/admin-account-management";

export const { GET, POST } = route({
  getAdminAccounts: routeOperation({
    method: "GET",
  })
    .input({
      query: adminAccountsQuerySchema,
    })
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

  createAdminAccount: routeOperation({
    method: "POST",
  })
    .input({
      contentType: "application/json",
      body: createAdminAccountInviteSchema,
    })
    .handler(async (request) => {
      const { response, session } = await requireAdminSession();

      if (response || !session) {
        return response ?? new NextResponse("Forbidden", { status: 403 });
      }

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
