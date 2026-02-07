"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/">
            <div className="mb-5 flex justify-center">
              <Logo className="text-2xl" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Where teams and agents meet to get things done.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-amber-900/5 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/80">
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
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-stone-950 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
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

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
