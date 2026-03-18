import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (per-IP sliding window)
// Replace with Redis for multi-instance deployments
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 60s
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

function checkRateLimit(ip: string, pathname: string, config: RateLimitConfig): boolean {
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

export function middleware(request: NextRequest) {
  // Only rate-limit POST requests to specific API routes
  if (request.method !== "POST") return NextResponse.next();

  const config = getRateLimitConfig(request.nextUrl.pathname);
  if (!config) return NextResponse.next();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (!checkRateLimit(ip, request.nextUrl.pathname, config)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
