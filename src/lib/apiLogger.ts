/**
 * Structured request logging for API routes.
 *
 * PRIVACY: No user IDs, secrets, or PII are included in log entries.
 * Only method, path, status, duration, and correlation ID are logged.
 * If caller identification is needed for debugging, pass a one-way
 * hash of the user ID (never the raw UUID).
 */

interface LogContext {
  method: string;
  path: string;
  status: number;
  durationMs: number;
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
