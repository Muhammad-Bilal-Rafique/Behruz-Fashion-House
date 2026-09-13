import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-token";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid } = await verifyAdminSessionToken(sessionCookie);

  // 1. Handle login page access
  if (pathname === "/admin/login") {
    if (valid) {
      // If already authenticated, redirect straight to dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    // Allow unauthenticated admin to view login page
    return NextResponse.next();
  }

  // 2. Allow any explicit public admin auth APIs if added
  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // 3. For all other /admin/* and /api/admin/* paths, enforce authentication
  if (!valid) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session expired or invalid." },
        { status: 401 }
      );
    }

    // Redirect to login with callback URL
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
