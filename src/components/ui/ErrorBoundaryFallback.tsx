"use client";

import { Button } from "@/components/ui/Button";

interface ErrorBoundaryFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function ErrorBoundaryFallback({
  error,
  reset,
  title = "Something went wrong",
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-bold text-stone-900 dark:text-stone-100">
        {title}
      </h2>
      <p className="mb-6 max-w-md text-sm text-stone-500 dark:text-stone-400">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button as="button" variant="primary" onClick={reset}>
          Try again
        </Button>
        <Button as="link" href="/dashboard" variant="ghost">
          Go to Dashboard
        </Button>
      </div>
      {error.digest && (
        <p className="mt-4 font-mono text-[10px] text-stone-400">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
