/**
 * Simple in-memory sliding-window rate limiter.
 *
 * LIMITATION: This store is per-process. In a multi-instance deployment
 * (e.g. Vercel serverless, Kubernetes pods), each instance maintains its
 * own independent map. An attacker can spread requests across instances
 * to bypass the limit. For production, replace with Redis-backed rate
 * limiting (e.g. @upstash/ratelimit) and set RATE_LIMIT_BACKEND=redis.
 *
 * PRIVACY: Rate limit keys use IP addresses from the x-forwarded-for
 * header. These are held only in-memory (never persisted) and expire
 * with the sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, 60_000);
}

interface RateLimitConfig {
  /** Maximum number of requests in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (typically IP or user ID).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/** Default rate limit configurations */
export const RATE_LIMITS = {
  /** Standard API routes: 60 requests per minute */
  api: { maxRequests: 60, windowMs: 60_000 },
  /** Write-heavy endpoints (POST/PATCH/DELETE): 30 requests per minute */
  write: { maxRequests: 30, windowMs: 60_000 },
  /** Auth endpoints: 10 requests per minute */
  auth: { maxRequests: 10, windowMs: 60_000 },
} as const;
