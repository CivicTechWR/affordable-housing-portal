import { createHash, randomBytes } from "node:crypto";

export function createOpaqueToken(size = 32) {
  return randomBytes(size).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
