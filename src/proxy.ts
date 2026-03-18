import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const publicRoutes = ["/", "/login", "/signup", "/services", "/providers"];
const authRoutes = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes and Next.js internals
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Strip locale prefix to get the actual path for auth checks
  const localePattern = /^\/(en|pt)(\/|$)/;
  const pathnameWithoutLocale = pathname.replace(localePattern, "/");
  const normalizedPathname =
    pathnameWithoutLocale === "" ? "/" : pathnameWithoutLocale;

  const isPublicRoute =
    publicRoutes.some((route) => normalizedPathname.startsWith(route)) ||
    normalizedPathname === "/";
  const isAuthRoute = authRoutes.some((route) =>
    normalizedPathname.startsWith(route),
  );

  const sessionToken = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionToken;

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", normalizedPathname);
    return NextResponse.redirect(loginUrl);
  }

  // Run next-intl middleware for locale detection and routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/"],
};
