import { spawnSync } from "node:child_process";
import path from "node:path";

export type OpenApiCommand = "generate" | "validate";

export function runOpenApi(command: OpenApiCommand, cwd: string): number {
  const nextRestFrameworkCliPath = path.resolve(
    cwd,
    "node_modules/next-rest-framework/dist/cli/index.js",
  );

  const result = spawnSync(
    process.execPath,
    ["--import=tsx", nextRestFrameworkCliPath, command, "--configPath", "/api/docs"],
    {
      cwd,
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}
