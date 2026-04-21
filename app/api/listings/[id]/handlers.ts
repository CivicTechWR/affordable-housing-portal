import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import {
  deleteListingByIdService,
  getListingByIdService,
  updateListingByIdService,
} from "@/lib/listings/listing.service";
import type {
  DeleteListingResponse,
  ListingByIdResponse,
  ListingParams,
  UpdateListingInput,
  UpdateListingResponse,
} from "@/shared/schemas/listings";

type ListingByIdRouteContext = {
  params: ListingParams;
};

export async function getListingByIdHandler(
  _request: TypedNextRequest<"GET">,
  { params }: ListingByIdRouteContext,
) {
  const result = await getListingByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<ListingByIdResponse, 200, "application/json">({
    ...result.value,
  });
}

export async function updateListingByIdHandler(
  request: TypedNextRequest<"PUT", "application/json", UpdateListingInput>,
  { params }: ListingByIdRouteContext,
) {
  const body = await request.json();
  const result = await updateListingByIdService({
    listingId: params.id,
    payload: body,
  });

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<UpdateListingResponse, 200, "application/json">({
    ...result.value,
  });
}

export async function deleteListingByIdHandler(
  _request: TypedNextRequest<"DELETE">,
  { params }: ListingByIdRouteContext,
) {
  const result = await deleteListingByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<DeleteListingResponse, 200, "application/json">({
    ...result.value,
  });
}
