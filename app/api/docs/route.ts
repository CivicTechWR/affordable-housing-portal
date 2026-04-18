import { docsRoute } from "next-rest-framework";

export const { GET } = docsRoute({
  deniedPaths: ["/api/auth/**"],
  openApiObject: {
    info: {
      title: "Affordable Housing Portal API",
      version: "1.0.0",
      description: "REST API for account management and listings in the Affordable Housing Portal.",
    },
  },
  docsConfig: {
    provider: "redoc",
    title: "Affordable Housing Portal API",
    description: "Generated OpenAPI docs for the Affordable Housing Portal backend routes.",
  },
});
