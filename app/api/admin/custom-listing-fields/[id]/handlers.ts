import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { mapDomainErrorToHttpResponse } from "@/lib/http/map-domain-error";
import {
  deleteAdminCustomListingFieldByIdService,
  getAdminCustomListingFieldByIdService,
  updateAdminCustomListingFieldByIdService,
} from "@/lib/custom-listing-fields/custom-listing-field-admin.service";
import type {
  CustomListingFieldByIdResponse,
  CustomListingFieldParams,
  DeleteCustomListingFieldResponse,
  UpdateCustomListingFieldInput,
  UpdateCustomListingFieldResponse,
} from "@/shared/schemas/custom-listing-fields";

type CustomListingFieldRouteContext = {
  params: CustomListingFieldParams;
};

export async function getAdminCustomListingFieldByIdHandler(
  _request: TypedNextRequest<"GET">,
  { params }: CustomListingFieldRouteContext,
) {
  const result = await getAdminCustomListingFieldByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<CustomListingFieldByIdResponse, 200, "application/json">(
    result.value,
    { status: 200 },
  );
}

export async function updateAdminCustomListingFieldByIdHandler(
  request: TypedNextRequest<"PUT", "application/json", UpdateCustomListingFieldInput>,
  { params }: CustomListingFieldRouteContext,
) {
  const body = await request.json();
  const result = await updateAdminCustomListingFieldByIdService({
    fieldId: params.id,
    payload: body,
  });

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<UpdateCustomListingFieldResponse, 200, "application/json">(
    result.value,
    { status: 200 },
  );
}

export async function deleteAdminCustomListingFieldByIdHandler(
  _request: TypedNextRequest<"DELETE">,
  { params }: CustomListingFieldRouteContext,
) {
  const result = await deleteAdminCustomListingFieldByIdService(params.id);

  if (!result.ok) {
    return mapDomainErrorToHttpResponse(result.error);
  }

  return TypedNextResponse.json<DeleteCustomListingFieldResponse, 200, "application/json">(
    result.value,
    { status: 200 },
  );
}
