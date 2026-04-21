import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import {
  adminCustomListingFieldListResponseSchema,
  adminCustomListingFieldQuerySchema,
  createCustomListingFieldResponseSchema,
  createCustomListingFieldSchema,
} from "@/shared/schemas/custom-listing-fields";
import {
  createAdminCustomListingFieldHandler,
  getAdminCustomListingFieldsHandler,
} from "./handlers";

export const { GET, POST } = route({
  getAdminCustomListingFields: routeOperation({ method: "GET" })
    .input({ query: adminCustomListingFieldQuerySchema })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: adminCustomListingFieldListResponseSchema,
      },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(getAdminCustomListingFieldsHandler),

  createAdminCustomListingField: routeOperation({ method: "POST" })
    .input({ contentType: "application/json", body: createCustomListingFieldSchema })
    .outputs([
      {
        status: 201,
        contentType: "application/json",
        body: createCustomListingFieldResponseSchema,
      },
      { status: 400, contentType: "application/json", body: errorMessageSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 409, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(createAdminCustomListingFieldHandler),
});
