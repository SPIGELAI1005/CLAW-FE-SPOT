/**
 * Structured request logging for API routes.
 * Logs method, path, status, duration, and optional user ID.
 */

interface LogContext {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId?: string;
  correlationId: string;
  error?: string;
}

export function logRequest(context: LogContext) {
  const level = context.status >= 500 ? "error" : context.status >= 400 ? "warn" : "info";

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    correlationId: context.correlationId,
    method: context.method,
    path: context.path,
    status: context.status,
    durationMs: context.durationMs,
    ...(context.userId ? { userId: context.userId } : {}),
    ...(context.error ? { error: context.error } : {}),
  };

  // Structured JSON logging
  if (level === "error") {
    console.error(JSON.stringify(logEntry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/** Generate a short correlation ID for request tracing */
export function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
