import { TypedNextResponse, type TypedNextRequest } from "next-rest-framework";

import { getCustomListingFieldsService } from "@/lib/custom-listing-fields/custom-listing-field.service";
import { customListingFieldQuerySchema } from "@/shared/schemas/custom-listing-fields";
import type {
  CustomListingFieldListResponse,
  CustomListingFieldQuery,
} from "@/shared/schemas/custom-listing-fields";

export async function getCustomListingFieldsHandler(
  request: TypedNextRequest<"GET", string, unknown, CustomListingFieldQuery>,
) {
  const query = customListingFieldQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const payload = await getCustomListingFieldsService(query);

  return TypedNextResponse.json<CustomListingFieldListResponse, 200, "application/json">(payload);
}
