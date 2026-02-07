import { Suspense } from "react";
import { LoginClient } from "./LoginClient";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

function LoginSkeleton() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.085] bg-white/[0.075] px-5 py-8 shadow-2xl shadow-stone-900/[0.04] ring-1 ring-white/[0.04] backdrop-blur-[3px] sm:rounded-3xl sm:px-10 sm:py-12 dark:border-white/[0.035] dark:bg-white/[0.02] dark:shadow-black/15">
          <div className="flex flex-col items-center gap-4">
            <Logo className="text-2xl" />
            <div className="h-6 w-40 animate-pulse rounded-lg bg-white/10" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginClient />
    </Suspense>
  );
}
