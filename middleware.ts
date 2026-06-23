import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { decodeSession, canAccess, COOKIE_NAME, STAFF_COOKIE_NAME, decodeStaffSession } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh Supabase session cookies on every request
  let response = NextResponse.next({ request });
  response.headers.set("x-pathname", pathname);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          response.headers.set("x-pathname", pathname);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.getUser();
  }

  // Admin route protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const allCookies = request.cookies.getAll();
    console.log("[middleware] Cookies on admin request:", allCookies.map(c => c.name));
    const token = request.cookies.get(COOKIE_NAME)?.value;
    console.log("[middleware] admin_session token:", token ? "present" : "missing");
    const session = token ? decodeSession(token) : null;
    console.log("[middleware] decoded session:", session ? "valid" : "invalid/none");

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!canAccess(session, pathname)) {
      // Redirect to overview with an error param instead of a blank 403
      return NextResponse.redirect(new URL("/admin?error=forbidden", request.url));
    }

    // Pass role to layouts via header
    response.headers.set("x-admin-role", session.role);
    response.headers.set("x-admin-name", session.fullName);
  }

  // Staff route protection
  if (pathname.startsWith("/staff") && pathname !== "/staff/login") {
    const token = request.cookies.get(STAFF_COOKIE_NAME)?.value;
    const session = token ? decodeStaffSession(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    response.headers.set("x-staff-role", session.role);
    response.headers.set("x-staff-name", session.fullName);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
