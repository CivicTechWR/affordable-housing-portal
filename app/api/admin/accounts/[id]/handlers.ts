import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import {
  deactivateAccountByIdService,
  getAccountByIdService,
  updateAccountByIdService,
} from "@/lib/accounts/account.service";
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
  const result = await getAccountByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<AccountByIdResponse, 200, "application/json">(
    {
      ...result.value,
    },
    { status: 200 },
  );
}

export async function updateAccountByIdHandler(
  request: TypedNextRequest<"PUT", "application/json", UpdateAccountInput>,
  { params }: AccountByIdRouteContext,
) {
  const body = await request.json();
  const result = await updateAccountByIdService({
    accountId: params.id,
    payload: body,
  });

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<UpdateAccountResponse, 200, "application/json">(result.value, {
    status: 200,
  });
}

export async function deactivateAccountByIdHandler(
  _request: TypedNextRequest<"DELETE">,
  { params }: AccountByIdRouteContext,
) {
  const result = await deactivateAccountByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<DeactivateAccountResponse, 200, "application/json">(result.value, {
    status: 200,
  });
}
