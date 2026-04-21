import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import { createAccountService, getAccountsService } from "@/lib/accounts/account.service";
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
  const query = accountQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await getAccountsService(query);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<AccountListResponse, 200, "application/json">({
    ...result.value,
  });
}

export async function createAccountHandler(
  request: TypedNextRequest<"POST", "application/json", CreateAccountInviteInput>,
) {
  const body = await request.json();
  const result = await createAccountService(body);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<CreateAccountResponse, 201, "application/json">(result.value, {
    status: 201,
  });
}
