import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import { listingEditorResponseSchema, listingParamsSchema } from "@/shared/schemas/listings";
import { getListingEditorByIdHandler } from "./handlers";

export const { GET } = route({
  getListingEditorById: routeOperation({ method: "GET" })
    .input({ params: listingParamsSchema })
    .outputs([
      { status: 200, contentType: "application/json", body: listingEditorResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
      { status: 404, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(getListingEditorByIdHandler),
});
