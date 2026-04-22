import { TypedNextResponse } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import { getListingEditorByIdService } from "@/lib/listings/listing.service";
import type { ListingEditorResponse, ListingParams } from "@/shared/schemas/listings";

type ListingEditorRouteContext = {
  params: ListingParams;
};

export async function getListingEditorByIdHandler(
  _request: Request,
  { params }: ListingEditorRouteContext,
) {
  const result = await getListingEditorByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<ListingEditorResponse, 200, "application/json">({
    ...result.value,
  });
}
