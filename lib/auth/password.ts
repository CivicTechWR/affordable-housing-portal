import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);

const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash, ...extraSegments] = storedHash.split(":");

  if (!salt || !hash || extraSegments.length > 0) {
    throw new Error("Stored password hash is malformed.");
  }

  if (!/^[0-9a-f]+$/i.test(hash) || hash.length !== KEY_LENGTH * 2) {
    throw new Error("Stored password hash is malformed.");
  }

  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(hash, "hex");

  if (storedKey.length !== derivedKey.length) {
    throw new Error("Stored password hash is malformed.");
  }

  return timingSafeEqual(storedKey, derivedKey);
}
