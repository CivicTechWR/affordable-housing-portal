import { TypedNextResponse } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import { createDraftListingService } from "@/lib/listings/listing.service";
import type { CreateDraftListingResponse } from "@/shared/schemas/listings";

export async function createDraftListingHandler() {
  const result = await createDraftListingService();

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<CreateDraftListingResponse, 201, "application/json">(result.value, {
    status: 201,
  });
}
