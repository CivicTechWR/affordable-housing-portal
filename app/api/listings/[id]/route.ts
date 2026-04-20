import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import {
  deleteListingResponseSchema,
  listingByIdResponseSchema,
  listingParamsSchema,
  updateListingResponseSchema,
  updateListingSchema,
} from "@/shared/schemas/listings";
import {
  deleteListingByIdHandler,
  getListingByIdHandler,
  updateListingByIdHandler,
} from "./handlers";

export const { GET, PUT, DELETE } = route({
  getListingById: routeOperation({ method: "GET" })
    .input({ params: listingParamsSchema })
    .outputs([
      { status: 200, contentType: "application/json", body: listingByIdResponseSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
      { status: 400, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(getListingByIdHandler),

  updateListingById: routeOperation({ method: "PUT" })
    .input({
      params: listingParamsSchema,
      contentType: "application/json",
      body: updateListingSchema,
    })
    .outputs([
      { status: 200, contentType: "application/json", body: updateListingResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
      { status: 400, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(updateListingByIdHandler),

  deleteListingById: routeOperation({ method: "DELETE" })
    .input({ params: listingParamsSchema })
    .outputs([
      { status: 200, contentType: "application/json", body: deleteListingResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(deleteListingByIdHandler),
});
