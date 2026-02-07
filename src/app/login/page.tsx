"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground config={{ intensity: "medium", nodeCount: 22 }} />
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  // Show error from URL params (e.g. redirected from callback)
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;
    const messages: Record<string, string> = {
      expired_link:
        "That link has expired or was opened in a different browser. Please request a new magic link below.",
      missing_code:
        "Invalid login link. Please request a new magic link below.",
    };
    setStatus(messages[error] ?? error);
  }, [searchParams]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const supabase = getSupabaseBrowserClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setIsLoading(false);
    if (error) setStatus(error.message);
    else setStatus("Check your email for the magic link.");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground config={{ intensity: "medium", nodeCount: 22 }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home pill */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-stone-500 backdrop-blur-sm transition-all hover:border-amber-400/30 hover:bg-white/20 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 dark:hover:border-amber-400/20 dark:hover:text-amber-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to home
          </Link>
        </div>

        {/* Brand + Login — frosted glass container like the hero card */}
        <div className="rounded-2xl border border-white/[0.085] bg-white/[0.075] px-5 py-8 shadow-2xl shadow-stone-900/[0.04] ring-1 ring-white/[0.04] backdrop-blur-[3px] sm:rounded-3xl sm:px-10 sm:py-12 dark:border-white/[0.035] dark:bg-white/[0.02] dark:shadow-black/15">
          {/* Brand */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-flex flex-col items-center">
              <Logo className="text-2xl" />
              <span className="mt-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-stone-400 dark:text-stone-500">
                <span className="gradient-text-animated">CLAW</span> Federation : <span className="gradient-text-animated">Coffee</span> Spot
              </span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Welcome back!
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/60 dark:text-white/50">
              Where teams and agents meet to get things done.
            </p>
          </div>

          {/* Login form */}
          <div>
            <form onSubmit={signIn} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-stone-900 outline-none backdrop-blur-sm transition-all placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-60"
              >
                {isLoading ? "Sending..." : "Send magic link"}
              </button>
              {status && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    status.includes("Check your email")
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                  }`}
                >
                  {status}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
