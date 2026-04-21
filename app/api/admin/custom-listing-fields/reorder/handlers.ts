import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { reorderAdminCustomListingFieldsService } from "@/lib/custom-listing-fields/custom-listing-field-admin.service";
import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import type {
  ReorderCustomListingFieldsInput,
  ReorderCustomListingFieldsResponse,
} from "@/shared/schemas/custom-listing-fields";

export async function reorderAdminCustomListingFieldsHandler(
  request: TypedNextRequest<"PUT", "application/json", ReorderCustomListingFieldsInput>,
) {
  const body = await request.json();
  const result = await reorderAdminCustomListingFieldsService(body);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<ReorderCustomListingFieldsResponse, 200, "application/json">(
    result.value,
    { status: 200 },
  );
}
