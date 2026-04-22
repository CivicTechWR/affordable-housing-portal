import { route, routeOperation } from "next-rest-framework";

import { errorMessageSchema } from "@/shared/schemas/common";
import { createDraftListingResponseSchema } from "@/shared/schemas/listings";
import { createDraftListingHandler } from "./handlers";

export const { POST } = route({
  createDraftListing: routeOperation({ method: "POST" })
    .outputs([
      { status: 201, contentType: "application/json", body: createDraftListingResponseSchema },
      { status: 401, contentType: "application/json", body: errorMessageSchema },
      { status: 403, contentType: "application/json", body: errorMessageSchema },
    ])
    .handler(createDraftListingHandler),
});
