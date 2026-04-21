import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import { getRecentAccountInvitesService } from "@/lib/accounts/account.service";
import { accountInviteQuerySchema } from "@/shared/schemas/account-management";
import type {
  AccountInviteListResponse,
  AccountInviteQuery,
} from "@/shared/schemas/account-management";

const DEFAULT_RECENT_INVITES_LIMIT = 8;

export async function getAccountInvitesHandler(
  request: TypedNextRequest<"GET", string, unknown, AccountInviteQuery>,
) {
  const query = accountInviteQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const limit = query.limit ? Number(query.limit) : DEFAULT_RECENT_INVITES_LIMIT;
  const result = await getRecentAccountInvitesService(limit);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<AccountInviteListResponse, 200, "application/json">({
    ...result.value,
  });
}
