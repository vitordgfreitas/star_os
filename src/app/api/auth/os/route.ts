import { OS_AUTH_COOKIE, OS_AUTH_MAX_AGE, createAuthTokenFromPassword } from "@/lib/auth/os-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(OS_AUTH_COOKIE)?.value;
  const { verifyAuthToken } = await import("@/lib/auth/os-session");

  return NextResponse.json({ authenticated: verifyAuthToken(token) });
}

export async function POST(request: Request) {
  const password = process.env.OS_ACCESS_PASSWORD;

  if (!password) {
    return NextResponse.json(
      { error: "Senha não configurada no servidor. Defina OS_ACCESS_PASSWORD." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const submitted = body?.password as string | undefined;

  if (!submitted || submitted !== password) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = createAuthTokenFromPassword(password);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(OS_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: OS_AUTH_MAX_AGE,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(OS_AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
