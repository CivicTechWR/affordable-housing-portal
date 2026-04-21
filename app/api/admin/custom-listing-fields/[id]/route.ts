import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import {
  customListingFieldByIdResponseSchema,
  customListingFieldParamsSchema,
  updateCustomListingFieldResponseSchema,
  updateCustomListingFieldSchema,
} from "@/shared/schemas/custom-listing-fields";
import {
  getAdminCustomListingFieldByIdHandler,
  updateAdminCustomListingFieldByIdHandler,
} from "./handlers";

export const { GET, PUT } = route({
  getAdminCustomListingFieldById: routeOperation({ method: "GET" })
    .input({ params: customListingFieldParamsSchema })
    .outputs([
      { status: 200, contentType: "application/json", body: customListingFieldByIdResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(getAdminCustomListingFieldByIdHandler),

  updateAdminCustomListingFieldById: routeOperation({ method: "PUT" })
    .input({
      params: customListingFieldParamsSchema,
      contentType: "application/json",
      body: updateCustomListingFieldSchema,
    })
    .outputs([
      {
        status: 200,
        contentType: "application/json",
        body: updateCustomListingFieldResponseSchema,
      },
      { status: 400, contentType: "application/json", body: errorMessageSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
      { status: 409, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(updateAdminCustomListingFieldByIdHandler),
});
