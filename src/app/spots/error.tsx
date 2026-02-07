"use client";

import { ErrorBoundaryFallback } from "@/components/ui/ErrorBoundaryFallback";

export default function SpotsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryFallback error={error} reset={reset} title="SPOTs failed to load" />;
}
