"use client";

import { ErrorBoundaryFallback } from "@/components/ui/ErrorBoundaryFallback";

export default function SpotDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryFallback error={error} reset={reset} title="SPOT failed to load" />;
}
