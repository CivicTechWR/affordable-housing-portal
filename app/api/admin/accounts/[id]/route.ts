import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

import { requireAdminSession } from "@/lib/auth/session";
import {
  adminAccountParamsSchema,
  updateAdminAccountSchema,
} from "@/shared/schemas/admin-account-management";

export const { GET, PUT, DELETE } = route({
  getAdminAccountById: routeOperation({
    method: "GET",
  })
    .input({
      params: adminAccountParamsSchema,
    })
    .handler(async (_request, { params }) => {
      const { response } = await requireAdminSession();

      if (response) {
        return response;
      }

      return NextResponse.json({
        data: {
          id: params.id,
          email: null,
          name: null,
          role: null,
          organization: null,
          status: null,
          listingsCount: 0,
          lastLoginAt: null,
          createdAt: null,
          updatedAt: null,
        },
      });
    }),

  updateAdminAccountById: routeOperation({
    method: "PUT",
  })
    .input({
      params: adminAccountParamsSchema,
      contentType: "application/json",
      body: updateAdminAccountSchema,
    })
    .handler(async (request, { params }) => {
      const { response } = await requireAdminSession();

      if (response) {
        return response;
      }

      const body = await request.json();

      // TODO: update account in database

      return NextResponse.json({
        message: "Account updated",
        data: { id: params.id, ...body },
      });
    }),

  deactivateAdminAccountById: routeOperation({
    method: "DELETE",
  })
    .input({
      params: adminAccountParamsSchema,
    })
    .handler(async (_request, { params }) => {
      const { response } = await requireAdminSession();

      if (response) {
        return response;
      }

      // TODO: soft-delete account in database
      // TODO: revoke active sessions

      return NextResponse.json({
        message: "Account deactivated",
        data: { id: params.id },
      });
    }),
});
