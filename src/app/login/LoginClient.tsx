"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
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
    if (!supabase) {
      setIsLoading(false);
      setStatus("Authentication is not configured. Please set Supabase environment variables.");
      return;
    }

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
            className="glass-btn inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/08 px-4 py-1.5 text-xs font-medium text-stone-500 transition-all hover:border-amber-400/30 hover:bg-white/15 hover:text-amber-600 dark:border-white/05 dark:bg-white/03 dark:text-stone-400 dark:hover:border-amber-400/20 dark:hover:text-amber-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span>Back to home</span>
          </Link>
        </div>

        {/* Brand + Login — frosted glass container like the hero card */}
        <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-10 sm:py-12">
          {/* Brand */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-flex flex-col items-center">
              <Logo className="text-2xl" showSubtitle />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Welcome back!
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-white/50">
              Where teams and<br />
              <span className="gradient-text-animated bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">AI Agents meet to get things done.</span>
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
                className="glass-btn glass-btn-orange inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-60"
              >
                <span>{isLoading ? "Sending..." : "Send magic link"}</span>
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
