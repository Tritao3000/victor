import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// --- Rate limiting (merged from middleware.ts) ---

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) rateLimitStore.delete(key);
  }
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/bookings": { windowMs: 60_000, maxRequests: 5 },
  "/api/payments/create-intent": { windowMs: 60_000, maxRequests: 10 },
  "/api/payments/refund": { windowMs: 60_000, maxRequests: 10 },
  "/api/reviews": { windowMs: 60_000, maxRequests: 3 },
};

function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  for (const [route, config] of Object.entries(RATE_LIMITS)) {
    if (pathname === route || pathname === route + "/") return config;
  }
  return null;
}

function checkRateLimit(
  ip: string,
  pathname: string,
  config: RateLimitConfig,
): boolean {
  cleanup();

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// --- i18n + auth routing ---

const intlMiddleware = createMiddleware(routing);

const publicRoutes = ["/", "/login", "/signup", "/services", "/providers"];
const authRoutes = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip everything for Next.js internals
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // API routes: apply rate limiting, skip i18n
  if (pathname.startsWith("/api")) {
    if (request.method === "POST") {
      const rlConfig = getRateLimitConfig(pathname);
      if (rlConfig) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        if (!checkRateLimit(ip, pathname, rlConfig)) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 },
          );
        }
      }
    }
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
  matcher: [
    "/api/:path*",
    "/((?!trpc|_next|_vercel|.*\\..*).*)",
    "/",
  ],
};
