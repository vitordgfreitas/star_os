import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OS_AUTH_COOKIE } from "@/lib/auth/constants";
import { PROTECTED_PATH_PREFIXES } from "@/lib/nav-config";

async function hashPasswordEdge(password: string): Promise<string> {
  const data = new TextEncoder().encode(`star-os:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyTokenEdge(token: string): Promise<boolean> {
  const password = process.env.OS_ACCESS_PASSWORD;
  if (!password || !token) return false;
  const expected = await hashPasswordEdge(password);
  return token === expected;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(OS_AUTH_COOKIE)?.value;
  const authenticated = await verifyTokenEdge(token ?? "");

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/contratos",
    "/contratos/:path*",
    "/ordens",
    "/ordens/:path*",
    "/cadastrar",
    "/cadastrar/:path*",
  ],
};
