import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runOpenApi } from "./openapi-utils.ts";

const repoRoot = process.cwd();
const stagedApiContractFilePattern = /^(app\/api(?:\/.*)?\/route\.ts|shared\/schemas\/.*\.ts)$/;

function runGit(args: string[], cwd = repoRoot) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result;
}

function runGitText(args: string[], cwd = repoRoot) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

function toGitPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

const stagedFiles = runGitText(["diff", "--cached", "--name-only", "--diff-filter=ACMRD"])
  .split(/\r?\n/)
  .filter(Boolean);

if (!stagedFiles.some((filePath: string) => stagedApiContractFilePattern.test(filePath))) {
  process.exit(0);
}

console.log(
  "Detected API route/schema changes; regenerating OpenAPI spec from the staged index...",
);

const snapshotDir = mkdtempSync(path.join(tmpdir(), "openapi-staged-index-"));

const cleanup = () => {
  rmSync(snapshotDir, { recursive: true, force: true });
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(1);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(1);
});

runGit(["checkout-index", "--all", "--force", `--prefix=${toGitPath(snapshotDir)}/`]);
symlinkSync(
  path.join(repoRoot, "node_modules"),
  path.join(snapshotDir, "node_modules"),
  process.platform === "win32" ? "junction" : "dir",
);

const openApiStatus = runOpenApi("generate", snapshotDir);

if (openApiStatus !== 0) {
  process.exit(openApiStatus);
}

copyFileSync(
  path.join(snapshotDir, "public", "openapi.json"),
  path.join(repoRoot, "public", "openapi.json"),
);
runGit(["add", "public/openapi.json"]);
