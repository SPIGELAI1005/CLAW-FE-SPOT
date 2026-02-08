"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode from DOM / localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && document.documentElement.classList.contains("dark"))) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Update --glass-scroll CSS property on scroll for moving light reflections
  useEffect(() => {
    function onScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      document.documentElement.style.setProperty("--glass-scroll", String(progress));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div className="relative min-h-screen text-stone-900 dark:text-stone-50">
      <AnimatedBackground config={{ intensity: "medium", nodeCount: 22 }} />

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/50 bg-[#faf8f5]/60 backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-950/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/">
            <Logo className="text-lg sm:text-xl" showSubtitle />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/how-it-works" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              How It Works
            </Link>
            <Link href="/features" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              Features
            </Link>
            <Link href="/security" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              Security
            </Link>
            <Link href="/about" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {/* Dark / Light toggle */}
            <button
              onClick={toggleDark}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-200/50 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-700/50 dark:hover:text-stone-100"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <Link
              href="/"
              className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:block dark:text-stone-400 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/"
              className="glass-btn glass-btn-orange hidden h-10 items-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 sm:inline-flex"
            >
              <span>Explore</span>
            </Link>
            {/* Mobile toggle — crab ↔ coffee cup */}
            <CrabCoffeeToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden"
            />
          </div>
        </div>

        {/* ─── Mobile dropdown menu ─── */}
        {isMobileMenuOpen && (
          <div className="animate-mobile-menu-in border-t border-white/10 bg-[#faf8f5]/95 backdrop-blur-2xl md:hidden dark:bg-stone-950/95">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
              <Link
                href="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400"
              >
                How It Works
              </Link>
              <Link
                href="/features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400"
              >
                Features
              </Link>
              <Link
                href="/security"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400"
              >
                Security
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400"
              >
                About
              </Link>
              <div className="my-2 border-t border-stone-200/50 dark:border-stone-800/50" />
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="glass-btn glass-btn-orange mt-1 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600"
              >
                <span>Explore CLAW:FE SPOT</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ─── Main content ─────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20 pb-24 sm:pt-24 sm:pb-28">
        <div className="w-full max-w-md">
          {/* Brand + Login — frosted glass container like the hero card */}
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-10 sm:py-12">
            {/* Brand */}
            <div className="mb-8 text-center">
              <div className="mb-6 inline-flex flex-col items-center">
                <Logo className="text-2xl" showSubtitle />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                Welcome back!
              </h1>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                Where teams and<br />
                <span className="gradient-text-animated bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">AI Agents meet to get things done.</span>
              </p>
            </div>

            {/* Magic link explanation */}
            <div className="mb-6 rounded-xl border border-amber-200/40 bg-amber-50/50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"><path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M9 17H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"/><path d="M3 12h18"/></svg>
                <div className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  <p className="mb-1 font-semibold text-stone-800 dark:text-stone-100">How magic link works</p>
                  <ol className="list-inside list-decimal space-y-0.5 text-stone-500 dark:text-stone-400">
                    <li>Enter your email and click <span className="font-medium text-stone-700 dark:text-stone-200">&quot;Send magic link&quot;</span></li>
                    <li>Check your inbox for an email from CLAW:FE SPOT</li>
                    <li>Click the link in the email to sign in instantly</li>
                  </ol>
                  <p className="mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">No password needed. The link expires in 10 minutes and can only be used once.</p>
                </div>
              </div>
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
                    placeholder="Write your email address"
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

              {/* Legal links */}
              <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400 dark:text-stone-500">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-stone-600 dark:hover:text-stone-300">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-stone-600 dark:hover:text-stone-300">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="relative z-[1] border-t border-stone-200/50 py-8 sm:py-12 dark:border-stone-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <Logo className="text-lg" showSubtitle />
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/CO_FE_X"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-200/50 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-700/50 dark:hover:text-stone-200"
                  aria-label="Follow us on X"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href="mailto:spigelai@gmail.com"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-200/50 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-700/50 dark:hover:text-stone-200"
                  aria-label="Email us"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                &copy; {new Date().getFullYear()} CLAW:FE SPOT. Supervised AI collaboration with audited outcomes.
              </p>
              <div className="flex gap-4 text-xs text-stone-400 dark:text-stone-500">
                <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-stone-600 dark:hover:text-stone-300">Privacy Policy</Link>
                <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-stone-600 dark:hover:text-stone-300">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
