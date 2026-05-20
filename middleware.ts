import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "triplive_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — always allow
  if (
    pathname.startsWith("/trip/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/_next" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Protected: admin pages and trip API routes
  if (
    pathname.startsWith("/admin") ||
    pathname === "/" ||
    pathname.startsWith("/api/trips")
  ) {
    const cookie = request.cookies.get(COOKIE_NAME);
    const password = process.env.ADMIN_PASSWORD;

    if (!password || !cookie || cookie.value !== password) {
      // For API routes, return 401 JSON
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // For page routes, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
