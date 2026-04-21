import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import {
  accountListResponseSchema,
  accountQuerySchema,
  createAccountInviteSchema,
  createAccountResponseSchema,
} from "@/shared/schemas/account-management";
import { createAccountHandler, getAccountsHandler } from "./handlers";

export const { GET, POST } = route({
  getAccounts: routeOperation({ method: "GET" })
    .input({ query: accountQuerySchema })
    .outputs([
      { status: 200, contentType: "application/json", body: accountListResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(getAccountsHandler),

  createAccount: routeOperation({ method: "POST" })
    .input({ contentType: "application/json", body: createAccountInviteSchema })
    .outputs([
      { status: 201, contentType: "application/json", body: createAccountResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(createAccountHandler),
});
