"use client";

import { ErrorBoundaryFallback } from "@/components/ui/ErrorBoundaryFallback";

export default function NewSpotError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryFallback error={error} reset={reset} title="Could not create SPOT" />;
}
