import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup", "/api/auth"];
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/";
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const sessionToken = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionToken;

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
