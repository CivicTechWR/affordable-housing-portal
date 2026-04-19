import { runOpenApi, type OpenApiCommand } from "./openapi-utils.ts";

const command = process.argv[2];

if (command !== "generate" && command !== "validate") {
  console.error("Usage: node --import=tsx scripts/openapi.ts <generate|validate>");
  process.exit(1);
}

process.exit(runOpenApi(command as OpenApiCommand, process.cwd()));
