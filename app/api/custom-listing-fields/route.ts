import { route, routeOperation } from "next-rest-framework";

import {
  customListingFieldListResponseSchema,
  customListingFieldQuerySchema,
} from "@/shared/schemas/custom-listing-fields";
import { getCustomListingFieldsHandler } from "./handlers";

export const { GET } = route({
  getCustomListingFields: routeOperation({ method: "GET" })
    .input({ query: customListingFieldQuerySchema })
    .outputs([
      { status: 200, contentType: "application/json", body: customListingFieldListResponseSchema },
    ])
    .handler(getCustomListingFieldsHandler),
});
