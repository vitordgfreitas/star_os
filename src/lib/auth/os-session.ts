import { createHash, timingSafeEqual } from "crypto";
import { OS_AUTH_COOKIE, OS_AUTH_MAX_AGE } from "./constants";

export { OS_AUTH_COOKIE, OS_AUTH_MAX_AGE };

function hashPassword(password: string): string {
  return createHash("sha256").update(`star-os:${password}`).digest("hex");
}

export function getExpectedAuthToken(): string | null {
  const password = process.env.OS_ACCESS_PASSWORD;
  if (!password) return null;
  return hashPassword(password);
}

export function verifyAuthToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = getExpectedAuthToken();
  if (!expected) return false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createAuthTokenFromPassword(password: string): string {
  return hashPassword(password);
}
