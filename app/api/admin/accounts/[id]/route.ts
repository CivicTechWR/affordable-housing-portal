import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import {
  accountByIdResponseSchema,
  accountParamsSchema,
  deactivateAccountResponseSchema,
  updateAccountResponseSchema,
  updateAccountSchema,
} from "@/shared/schemas/account-management";
import {
  deactivateAccountByIdHandler,
  getAccountByIdHandler,
  updateAccountByIdHandler,
} from "./handlers";

export const { GET, PUT, DELETE } = route({
  getAccountById: routeOperation({ method: "GET" })
    .input({ params: accountParamsSchema })
    .outputs([
      { status: 200, contentType: "application/json", body: accountByIdResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(getAccountByIdHandler),

  updateAccountById: routeOperation({ method: "PUT" })
    .input({
      params: accountParamsSchema,
      contentType: "application/json",
      body: updateAccountSchema,
    })
    .outputs([
      { status: 200, contentType: "application/json", body: updateAccountResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
      { status: 409, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(updateAccountByIdHandler),

  deactivateAccountById: routeOperation({ method: "DELETE" })
    .input({ params: accountParamsSchema })
    .outputs([
      { status: 200, contentType: "application/json", body: deactivateAccountResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
      { status: 409, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(deactivateAccountByIdHandler),
});
