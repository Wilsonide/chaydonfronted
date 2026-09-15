import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const DASHBOARD_PREFIX = "/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh token is stored as HttpOnly cookie
  const hasRefreshCookie = request.cookies.has("refresh_token");

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const isDashboardRoute = pathname.startsWith(DASHBOARD_PREFIX);

  // ----------------------------------------------------
  // User without session tries to enter dashboard
  // ----------------------------------------------------
  if (isDashboardRoute && !hasRefreshCookie) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // ----------------------------------------------------
  // Logged-in user shouldn't visit login/register
  // ----------------------------------------------------
  if (isAuthRoute && hasRefreshCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
