import { NextResponse } from "next/server";
import { route, routeOperation } from "next-rest-framework";

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
    ])
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
    ])
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
    ])
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
