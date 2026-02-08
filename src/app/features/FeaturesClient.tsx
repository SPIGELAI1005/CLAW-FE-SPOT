"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { Logo } from "@/components/ui/Logo";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

/* ================================================================
   CLAW:FE SPOT - Features Page
   Comprehensive feature overview matching the landing/about/security
   design language: warm minimalism, frosted glass, amber accents.
   ================================================================ */

export function FeaturesClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    function handleResize() { if (window.innerWidth >= 768) setIsMobileMenuOpen(false); }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

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

  return (
    <div className="relative min-h-screen text-stone-900 dark:text-stone-50">
      <AnimatedBackground config={{ intensity: "medium", nodeCount: 22 }} />

      {/* --- Navigation ------------------------------------------------ */}
      <NavHeader isDark={isDark} toggleDark={toggleDark} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* --- Hero ------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-40 sm:pb-32">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mt-[3vh] mb-4 flex justify-center sm:mt-[5vh] sm:mb-6">
            <Logo className="text-2xl sm:text-3xl" showSubtitle />
          </div>
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-12 sm:py-14">
            <h1 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-600 sm:mb-4 sm:text-sm dark:text-amber-400">
              Features
            </h1>
            <p className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Everything you need for{" "}
              <span className="gradient-text-animated">supervised AI execution</span>
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
              <InlineBrand /> combines structured workspaces, contract-based governance, independent auditing, and cryptographic certification into one platform.
            </p>
          </div>
        </div>
      </section>

      {/* --- Core Platform Features ----------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              The <span className="gradient-text-animated">platform</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Core capabilities that make governed AI collaboration possible.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.title} className="glass-card group rounded-2xl p-6 transition-all hover:border-amber-400/20">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-500 backdrop-blur-sm dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-stone-900 dark:text-stone-200">{f.title}</h3>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Governance and Auditing ---------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Governance and <span className="gradient-text-animated">auditing</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Every feature is designed to ensure that collaboration produces trustworthy, verifiable outcomes.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Contract System */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">Contract-based execution</h3>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                No execution without a contract. The contract defines scope, allowed tools, data boundaries, acceptance criteria, and termination conditions. Every agent action is validated against it.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["Scope definition", "Tool allowlists", "Data boundaries", "Acceptance criteria"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 rounded-lg bg-amber-500/5 px-2 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Real-Time L1 Gating */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-500 dark:border-sky-400/15 dark:bg-sky-500/[0.08] dark:text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">Real-time L1 gating</h3>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                The L1 auditor reviews every tool call as it happens. Each action receives a structured APPROVE or BLOCK verdict with documented rationale. No action proceeds without explicit approval.
              </p>

              {/* Mini verdict visualization */}
              <div className="space-y-1.5 rounded-xl border border-stone-200/40 bg-white/20 p-3 font-mono text-[11px] dark:border-stone-700/30 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">APPROVE</span>
                  <span className="text-stone-500 dark:text-stone-400">fetch_data(source=&quot;approved_api&quot;)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-100 px-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">BLOCK</span>
                  <span className="text-stone-500 dark:text-stone-400">send_email(to=&quot;external&quot;) // out of scope</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">APPROVE</span>
                  <span className="text-stone-500 dark:text-stone-400">analyse_results(dataset=&quot;q4_report&quot;)</span>
                </div>
              </div>
            </div>

            {/* L2 Meta-Audit */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">L2 meta-audit</h3>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                An independent L2 auditor reviews the complete immutable log after execution. It validates the L1 auditor&apos;s work, checks contract compliance, and issues the final certification verdict. The auditor of the auditor.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["Full log review", "L1 audit validation", "Contract compliance", "Final certification"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 rounded-lg bg-amber-500/5 px-2 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Certification */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-500 dark:border-emerald-400/15 dark:bg-emerald-500/[0.08] dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16.5" r="1.5" fill="currentColor"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">Cryptographic certification</h3>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Every certified outcome produces a structured certification package. A cryptographic fingerprint (SHA-256) of this package is anchored in a smart contract. No user data goes on chain. The certification is independently verifiable.
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-center sm:gap-2">
                {[
                  { label: "Time-stamped", desc: "Immutable record" },
                  { label: "Tamper-proof", desc: "Cryptographic integrity" },
                  { label: "Exportable", desc: "Self-contained JSON" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-emerald-200/30 bg-emerald-500/5 p-2 dark:border-emerald-800/20">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.label}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Collaboration and Productivity --------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Collaboration and <span className="gradient-text-animated">productivity</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLLAB_FEATURES.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-5 transition-all hover:border-amber-400/20">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                </div>
                <h3 className="mb-1 text-sm font-bold text-stone-900 dark:text-stone-200">{f.title}</h3>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Security Features ---------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              <span className="gradient-text-animated">Security</span> at every layer
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SECURITY_FEATURES.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 transition-all hover:border-amber-400/20">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-500 backdrop-blur-sm dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-stone-900 dark:text-stone-200">{f.title}</h3>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">{f.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/security" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
              Learn more about our security architecture
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Feature Comparison --------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Why <span className="gradient-text-animated">CLAW:FE SPOT</span> is different
            </h2>
          </div>
          <div className="glass-card overflow-hidden rounded-2xl sm:rounded-3xl">
            <p className="px-4 pb-2 pt-4 text-[10px] font-medium uppercase tracking-wider text-stone-400 sm:hidden dark:text-stone-500">Scroll to see all columns</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200/40 dark:border-stone-700/40">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Capability</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Standard AI chat</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">CLAW:FE SPOT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/30 dark:divide-stone-700/30">
                  {COMPARISON.map((row) => (
                    <tr key={row.capability}>
                      <td className="px-6 py-3 text-sm text-stone-700 dark:text-stone-300">{row.capability}</td>
                      <td className="px-6 py-3 text-center text-sm text-stone-500 dark:text-stone-400">{row.standard}</td>
                      <td className="px-6 py-3 text-center text-sm font-medium text-stone-900 dark:text-stone-200">{row.spot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --- Closing -------------------------------------------------- */}
      <section className="relative py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[400px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-16 sm:py-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Built for trust
            </h2>
            <p className="text-xl font-bold leading-snug tracking-tight sm:text-2xl md:text-3xl">
              Every feature exists to make AI collaboration <span className="gradient-text-animated">verifiable</span>.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
              <InlineBrand /> is a governed execution platform where every action is supervised, every outcome is audited, and every certification is independently verifiable.
            </p>
            <div className="mt-10">
              <p className="text-lg font-extrabold tracking-tight sm:text-xl md:text-2xl">
                One table. One truth. Audited outcomes.
                <br />
                <span className="gradient-text-animated">One Single Point Of Truth.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA ------------------------------------------------------ */}
      <section className="relative z-[1] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="glass-card rounded-2xl px-5 py-10 sm:rounded-3xl sm:px-16 sm:py-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Ready to <span className="gradient-text-animated">collaborate with confidence?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:mt-4 sm:text-base dark:text-stone-400">
              Join teams using <InlineBrand /> to produce audited, certified outcomes with AI agents they can trust.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link href="/login" className="glass-btn glass-btn-orange inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-6 text-sm font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-amber-500/30 sm:h-14 sm:w-auto sm:px-8 sm:text-base">
                <span>Get Started Free</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link href="/how-it-works" className="glass-btn inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-6 text-sm font-semibold text-stone-700 transition-all hover:border-white/40 hover:bg-white/25 hover:shadow-lg sm:h-14 sm:w-auto sm:px-8 sm:text-base dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10">
                <span>See How It Works</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --------------------------------------------------- */}
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

/* --- Shared Navigation Header ---------------------------------------- */

function NavHeader({ isDark, toggleDark, isMobileMenuOpen, setIsMobileMenuOpen }: {
  isDark: boolean; toggleDark: () => void; isMobileMenuOpen: boolean; setIsMobileMenuOpen: (fn: (v: boolean) => boolean) => void;
}) {
  const active = "text-sm font-medium text-amber-600 dark:text-amber-400";
  const inactive = "text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100";
  const mActive = "rounded-xl px-4 py-3 text-base font-medium text-amber-600 dark:text-amber-400";
  const mInactive = "rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/50 bg-[#faf8f5]/60 backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-950/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/"><Logo className="text-lg sm:text-xl" showSubtitle /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/how-it-works" className={inactive}>How It Works</Link>
          <Link href="/features" className={active}>Features</Link>
          <Link href="/security" className={inactive}>Security</Link>
          <Link href="/about" className={inactive}>About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-200/50 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-700/50 dark:hover:text-stone-100" title={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle dark mode">
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link href="/login" className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:block dark:text-stone-400 dark:hover:text-white">Sign in</Link>
          <Link href="/login" className="glass-btn glass-btn-orange hidden h-10 items-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 sm:inline-flex"><span>Get Started</span></Link>
          <CrabCoffeeToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((v) => !v)} className="md:hidden" />
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="animate-mobile-menu-in border-t border-white/10 bg-[#faf8f5]/95 backdrop-blur-2xl md:hidden dark:bg-stone-950/95">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(() => false)} className={mInactive}>How It Works</Link>
            <Link href="/features" onClick={() => setIsMobileMenuOpen(() => false)} className={mActive}>Features</Link>
            <Link href="/security" onClick={() => setIsMobileMenuOpen(() => false)} className={mInactive}>Security</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(() => false)} className={mInactive}>About</Link>
            <div className="my-2 border-t border-stone-200/50 dark:border-stone-800/50" />
            <Link href="/login" onClick={() => setIsMobileMenuOpen(() => false)} className="rounded-xl px-4 py-3 text-base font-medium text-stone-500 transition-colors hover:bg-white/20 dark:text-stone-400">Sign in</Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(() => false)} className="glass-btn glass-btn-orange mt-1 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600"><span>Get Started</span></Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/* --- Inline Brand ---------------------------------------------------- */

function InlineBrand() {
  return (
    <span className="font-extrabold whitespace-nowrap">
      <span className="gradient-text-animated">CLAW</span>
      <span className="text-stone-900 dark:text-white">:FE SPOT</span>
    </span>
  );
}

/* --- Feature Data ---------------------------------------------------- */

const PLATFORM_FEATURES = [
  { title: "SPOT Workspaces", description: "Focused collaboration spaces with a topic, goal, defined participants, and a clear lifecycle from discussion to certified execution.", icon: "M12 15c0 1.38-3.58 2.5-8 2.5M4 15v-3c0-1.38 3.58-2.5 8-2.5s8 1.12 8 2.5v3M12 15c4.42 0 8-1.12 8-2.5M8 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" },
  { title: "Two Operational Modes", description: "DISCUSS mode for safe exploration and planning. EXECUTE mode for governed, policy-gated tool execution under real-time L1 supervision.", icon: "M3 3v18h18M9 17V9M15 17V5" },
  { title: "Three Agent Roles", description: "Worker agents execute tasks. L1 auditors gate tool calls in real time. L2 auditors review and certify the complete process. Fully independent.", icon: "M12 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM19 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 8v4M8.5 14.5 12 12M15.5 14.5 12 12" },
  { title: "Persona Switching", description: "Switch between Member, Pilot, and Agent personas. Each persona unlocks a tailored dashboard, navigation, and workflow optimized for the role.", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M17 11h6" },
  { title: "Unified Inbox", description: "All SPOT invites, contract proposals, L1 approval requests, and certification tasks arrive in a single inbox. Filter, accept, or reject with a click.", icon: "M22 12h-6l-2 3H10l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" },
  { title: "Developer CLI", description: "Create agents, deploy pipelines, manage SPOTs, and trigger certifications from the built-in terminal or the Ctrl+K command palette.", icon: "M4 17l6-6-6-6M12 19h8" },
];

const COLLAB_FEATURES = [
  { title: "Multi-Agent Collaboration", description: "Multiple independent AI agents work together inside structured SPOT workspaces. Agents can recruit specialists when they reach limits.", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { title: "Real-Time Messaging", description: "Live chat with typing indicators and presence tracking. Know who is online and what is happening as the collaboration unfolds.", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2ZM8 10h.01M12 10h.01M16 10h.01" },
  { title: "Audit Vault", description: "Browse immutable audit logs across all SPOTs. View L1 verdicts and L2 reports with coverage scores. Export certified outcomes as JSON.", icon: "M3 11h18M3 11v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11M7 11V7a5 5 0 0 1 10 0v4M12 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" },
  { title: "Exportable Certifications", description: "Download full certification packages as self-contained JSON files. Share with stakeholders, compliance teams, or verify independently.", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M12 18v-6M9 15l3 3 3-3" },
  { title: "Policy-Gated Tools", description: "Agents can only invoke tools explicitly allowed by the workspace contract. Every tool call is validated against the policy before execution.", icon: "M3 11h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11ZM7 11V7a5 5 0 0 1 10 0v4M10 16h4" },
  { title: "Structured Verdicts", description: "Every audit decision includes a typed verdict (APPROVE or BLOCK), documented rationale, and confidence scoring for full transparency.", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM9 12l2 2 4-4" },
];

const SECURITY_FEATURES = [
  { title: "Hard Isolation", description: "Each SPOT has isolated memory, tool permissions, and data boundaries. Zero cross-workspace leakage.", icon: "M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z" },
  { title: "Contract-First", description: "No execution without a signed contract. Scope, tools, data, and conditions are explicitly defined before any agent begins work.", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M12 18v-6M9 15l3 3 3-3M8 11h8" },
  { title: "Immutable Logs", description: "Every message, tool call, verdict, and report is append-only. Once written, records cannot be edited or deleted.", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
  { title: "Independent Audit", description: "L1 and L2 auditors are independent from each other and from workers. No single point of compromise or failure.", icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 3v5M12 16v5M3 12h5M16 12h5" },
];

const COMPARISON = [
  { capability: "Multi-agent collaboration", standard: "Single agent", spot: "Multiple independent agents" },
  { capability: "Execution governance", standard: "None", spot: "Contract-based with policy gating" },
  { capability: "Real-time supervision", standard: "None", spot: "Independent L1 auditor" },
  { capability: "Audit trail", standard: "Chat history", spot: "Immutable, append-only log" },
  { capability: "Outcome verification", standard: "Trust the output", spot: "Cryptographic certification" },
  { capability: "Independent review", standard: "None", spot: "L2 meta-audit of the full process" },
  { capability: "Exportable proof", standard: "None", spot: "Self-contained JSON with on-chain anchor" },
  { capability: "Role separation", standard: "None", spot: "Workers, L1, L2 fully independent" },
];
