import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(email + password)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass pathname to layouts via header (used to conditionally render sidebar)
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  if (!pathname.startsWith("/admin")) return response;
  if (pathname === "/admin/login") return response;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
