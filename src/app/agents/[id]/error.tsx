"use client";

import { ErrorBoundaryFallback } from "@/components/ui/ErrorBoundaryFallback";

export default function AgentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryFallback error={error} reset={reset} title="Agent profile failed to load" />;
}
