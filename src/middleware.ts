import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { logRequest, generateCorrelationId } from "@/lib/apiLogger";

function getEnv(): { url: string; anon: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return { url, anon };
}

/** Routes that require authentication: redirect to /login if no session. */
const PROTECTED_PREFIXES = ["/dashboard", "/spots", "/agents", "/inbox", "/vault", "/settings", "/cli", "/roles", "/faq", "/certifications", "/api/admin"];

/** Routes that must stay public (even if they share a prefix with protected ones). */
const PUBLIC_ROUTES = new Set(["/", "/login", "/auth/callback", "/logout", "/about", "/security", "/verify", "/features", "/how-it-works", "/privacy", "/terms"]);

/**
 * Public API exceptions for certification verification:
 *  - GET  /api/certifications/<fingerprint>/public   (verify by fingerprint)
 *  - POST /api/certifications/verify                 (verify by raw JSON)
 * Both are unauthenticated, rate-limited endpoints.
 */
function isPublicApi(pathname: string) {
  if (/^\/api\/certifications\/[^/]+\/public\/?$/.test(pathname)) return true;
  if (pathname === "/api/certifications/verify") return true;
  return false;
}

function isProtected(pathname: string) {
  if (PUBLIC_ROUTES.has(pathname)) return false;
  if (isPublicApi(pathname)) return false;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

/** Security headers applied to every response. */
function applySecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy: send origin only on cross-origin
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions-Policy: disable sensitive APIs
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  // Basic Content-Security-Policy
  // Allow self + Supabase domain + inline styles (Tailwind) + Google Fonts
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseDomain = supabaseUrl
    ? new URL(supabaseUrl).origin
    : "";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `img-src 'self' data: blob:`,
      `connect-src 'self' ${supabaseDomain} https://*.supabase.co wss://*.supabase.co`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
  // Strict-Transport-Security (only effective over HTTPS, harmless on localhost)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = generateCorrelationId();
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  // Rate limiting for API routes
  if (isApiRoute) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const method = request.method;
    const config = method === "GET" ? RATE_LIMITS.api : RATE_LIMITS.write;
    const rateLimitKey = `${ip}:${request.nextUrl.pathname}`;
    const result = checkRateLimit(rateLimitKey, config);

    if (!result.allowed) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
      response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-Correlation-Id", correlationId);

      logRequest({
        method,
        path: request.nextUrl.pathname,
        status: 429,
        durationMs: Date.now() - startTime,
        correlationId,
      });

      return applySecurityHeaders(response);
    }
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (isApiRoute) {
    response.headers.set("X-Correlation-Id", correlationId);
  }

  const env = getEnv();

  // If Supabase env vars are not configured, skip auth checks and pass through.
  if (!env) {
    return applySecurityHeaders(response);
  }

  const supabase = createServerClient(env.url, env.anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session if needed (must be before getUser check).
  await supabase.auth.getUser();

  // Protect routes that require authentication.
  if (isProtected(request.nextUrl.pathname)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);

      const redirect = NextResponse.redirect(redirectUrl);
      // Preserve any refreshed auth cookies.
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return applySecurityHeaders(redirect);
    }
  }

  // Log API requests
  if (isApiRoute) {
    logRequest({
      method: request.method,
      path: request.nextUrl.pathname,
      status: 200,
      durationMs: Date.now() - startTime,
      correlationId,
    });
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icons, brand (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|icons|brand).*)",
  ],
};
