import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import {
  reorderCustomListingFieldsResponseSchema,
  reorderCustomListingFieldsSchema,
} from "@/shared/schemas/custom-listing-fields";
import { reorderAdminCustomListingFieldsHandler } from "./handlers";

export const { PUT } = route({
  reorderAdminCustomListingFields: routeOperation({ method: "PUT" })
    .input({
      contentType: "application/json",
      body: reorderCustomListingFieldsSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: reorderCustomListingFieldsResponseSchema,
      },
      { status: 400, contentType: "application/json", body: errorMessageSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(reorderAdminCustomListingFieldsHandler),
});
