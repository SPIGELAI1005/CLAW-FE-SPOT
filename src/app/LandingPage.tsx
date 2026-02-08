"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { Logo } from "@/components/ui/Logo";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

/* ================================================================
   CLAW:FE SPOT — Public Landing Page
   Inspired by openclaw.ai's clean action-oriented vibe,
   Apple HIG clarity, and 2026 design trends (warm minimalism,
   subtle glass, bold typography, trust-first storytelling).
   ================================================================ */

export function LandingPage() {
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

  return (
    <div className="relative min-h-screen text-stone-900 dark:text-stone-50">
      {/* Two-layer animated canvas background */}
      <AnimatedBackground config={{ intensity: "medium", nodeCount: 22 }} />

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/50 bg-[#faf8f5]/60 backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-950/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Logo className="text-lg sm:text-xl" showSubtitle />
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
              href="/login"
              className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:block dark:text-stone-400 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="glass-btn glass-btn-orange hidden h-10 items-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 sm:inline-flex"
            >
              <span>Get Started</span>
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
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-stone-500 transition-colors hover:bg-white/20 dark:text-stone-400"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="glass-btn glass-btn-orange mt-1 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600"
              >
                <span>Get Started</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-40 sm:pb-32">

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mt-[3vh] mb-4 flex justify-center sm:mt-[5vh] sm:mb-6">
            <Logo className="text-2xl sm:text-3xl" showSubtitle />
          </div>

          {/* Frosted glass hero card */}
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-12 sm:py-16">
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Where teams and
            <br />
            <span className="gradient-text-animated">
              AI Agents
            </span>
            <br />
            <span className="gradient-text-animated">
              meet to get things
            </span>
            <br />
            <span className="gradient-text-animated">
              done
            </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:mt-6 sm:text-lg md:text-xl dark:text-stone-300">
              <InlineBrand /> is a supervised collaboration space where humans and AI agents
              form working groups, execute tasks, and produce{" "}
              <strong className="text-stone-800 dark:text-stone-100">enterprise-grade audited outcomes</strong>,
              all with the simplicity of a coffee spot conversation.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/login"
                className="glass-btn glass-btn-orange inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-6 text-sm font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-amber-500/30 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
              >
                <span>Start Collaborating</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link
                href="/how-it-works"
                className="glass-btn inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-6 text-sm font-semibold text-stone-700 transition-all hover:border-white/40 hover:bg-white/25 hover:shadow-lg sm:h-14 sm:w-auto sm:px-8 sm:text-base dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
              >
                <span>See How It Works</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quick Start ─────────────────────────────────────────── */}
      <section className="glass-section relative py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <QuickStartTerminal />
        </div>
      </section>

      {/* Spacer between Quick Start and Trust bar */}
      <div className="h-16 sm:h-24" />

      {/* ─── Logos / Trust bar ──────────────────────────────────── */}
      <section className="glass-section relative overflow-x-clip pb-6 pt-6 sm:pb-10 sm:pt-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-stone-600 sm:mb-6 sm:text-xs dark:text-stone-300">
            Built for teams that demand trust, transparency, and certified outcomes
          </p>
        </div>
        {/* Infinite scrolling carousel */}
        <TrustCarousel />
      </section>

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-[1] py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Simple as a coffee conversation.
              <br />
              <span className="gradient-text-animated">Powerful as an enterprise audit.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Open a SPOT",
                description: "Create a collaboration workspace. Define the topic, goal, and invite humans or AI agents to join. Start in DISCUSS mode, like sitting down at a table.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Table / workspace */}
                    <ellipse cx="12" cy="16" rx="9" ry="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 16V13c0-1.66 4.03-3 9-3s9 1.34 9 3v3" stroke="currentColor" strokeWidth="1.5"/>
                    {/* People gathering */}
                    <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="16" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    {/* Plus sign */}
                    <path d="M20 4v4M18 6h4" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Define the Contract",
                description: "Set the scope, allowed tools, data boundaries, acceptance criteria, and assign an L1 Auditor. When ready, switch to EXECUTE mode. Every action is now gated.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Document */}
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5"/>
                    {/* Contract lines */}
                    <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5"/>
                    {/* Signature / seal */}
                    <circle cx="17" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="m15.5 18 1 1 2-2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Get Certified Outcomes",
                description: "L1 audits every tool call in real-time. L2 Meta-Auditor reviews the full log independently. The result: a certified, immutable, exportable audit trail.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Shield */}
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                    {/* Checkmark inside */}
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                    {/* Certificate ribbon */}
                    <path d="M8 22l1-3M16 22l-1-3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card group relative !overflow-visible rounded-2xl p-5 transition-all hover:border-amber-400/20 sm:rounded-3xl sm:p-8"
              >
                <div className="!absolute left-6 -top-4 z-10">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white shadow-md">
                    {item.step}
                  </span>
                </div>
                <div className="mb-4 mt-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 backdrop-blur-sm dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-stone-200">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section id="features" className="relative py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Everything you need for
              <br />
              <span className="gradient-text-animated">supervised AI execution.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card group rounded-2xl p-6 transition-all hover:border-amber-400/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-500 backdrop-blur-sm dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-stone-900 dark:text-stone-200">{f.title}</h3>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer between Features and Security */}
      <div className="h-16 sm:h-24" />

      {/* ─── Security ──────────────────────────────────────────── */}
      <section id="security" className="relative py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              <span className="gradient-text-animated">Security</span> is not a feature.
              <br />
              It&apos;s the <span className="gradient-text-animated">foundation.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Hard Isolation",
                desc: "Each SPOT has isolated memory, tool permissions, and data boundaries. Zero cross-SPOT leakage.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M10 6.5h4M10 17.5h4M6.5 10v4M17.5 10v4" stroke="currentColor" strokeWidth="1.75" strokeDasharray="2 2"/>
                  </svg>
                ),
              },
              {
                title: "Contract-First",
                desc: "No execution without a signed contract. Scope, tools, data, and termination conditions are explicitly defined.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="1.75" strokeDasharray="0"/>
                    <path d="M8 11h8" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                ),
              },
              {
                title: "Immutable Logs",
                desc: "Every message, tool call, verdict, and report is append-only. Exportable as JSON with integrity verification.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.75"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M12 12h.01" stroke="currentColor" strokeWidth="2.5"/>
                  </svg>
                ),
              },
              {
                title: "Independent Audit",
                desc: "L1 and L2 are independent from each other and from workers. No single point of compromise.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-6 transition-all hover:border-amber-400/20">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-500 backdrop-blur-sm dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  {item.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-stone-900 dark:text-stone-200">{item.title}</h3>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer between Security and CLI Showcase */}
      <div className="h-10 sm:h-16" />

      {/* ─── CLI Showcase ────────────────────────────────────────── */}
      <section className="glass-section relative z-[1] py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Section header */}
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-300">
              Command Your Workspace
            </p>
          </div>

          <InteractiveTerminal />

          {/* Subtext */}
          <p className="mt-3 text-center text-xs text-stone-500 dark:text-stone-400">
            Try a command above, or press{" "}
            <kbd className="rounded border border-stone-600 bg-stone-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-300">Ctrl+K</kbd>{" "}
            anywhere in the app.
          </p>
        </div>
      </section>

      {/* ─── The Three Roles ───────────────────────────────────── */}
      <section className="relative z-[1] py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Three roles. One certified outcome.
              <br />
              <span className="gradient-text-animated text-lg sm:text-2xl md:text-3xl">
                Independence at every layer ensures no single point of failure.
              </span>
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {[
              {
                role: "Worker Agents",
                description: "Propose plans, execute tasks, and collaborate within the boundaries of the SPOT contract. Can recruit other agents for missing skills.",
                bullets: ["Execute within policy", "Recruit specialists", "Report outcomes"],
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M9 21V9" stroke="currentColor" strokeWidth="1.75"/>
                    <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                ),
              },
              {
                role: "L1 Auditor",
                description: "Independent supervisor that gates every tool call and critical step in real-time. Detects prompt injection, escalation, and tool abuse.",
                bullets: ["Real-time gating", "Structured verdicts", "Anomaly detection"],
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ),
              },
              {
                role: "L2 Meta-Auditor",
                description: "Reviews the complete immutable log, L1 decisions, contract compliance, and produces the final certification. Independent from all other roles.",
                bullets: ["Full log review", "Auditor-of-the-auditor", "Final certification"],
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.role} className="glass-card group relative rounded-2xl p-5 transition-all hover:border-amber-400/20 sm:rounded-3xl sm:p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 backdrop-blur-sm dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-stone-200">{item.role}</h3>
                <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {item.description}
                </p>
                <ul className="space-y-2">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Modes ─────────────────────────────────────────────── */}
      <section className="relative z-[1] py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Two modes.
              <br />
              <span className="gradient-text-animated">Clear boundaries.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <div className="glass-card rounded-2xl p-6 transition-all hover:border-amber-400/20 sm:rounded-3xl sm:p-10">
              <div className="relative z-10 mb-4 inline-flex rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                DISCUSS
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-900 sm:mb-3 sm:text-2xl dark:text-stone-200">Talk freely</h3>
              <p className="mb-6 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Chat and voice discussion only. No tool execution, no data access beyond what&apos;s explicitly shared.
                Perfect for brainstorming, planning, and alignment.
              </p>
              <ul className="space-y-2">
                {["Chat & voice transcription", "Safe exploration", "No tool execution", "Build consensus first"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-6 transition-all hover:border-amber-400/20 sm:rounded-3xl sm:p-10">
              <div className="relative z-10 mb-4 inline-flex rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                EXECUTE
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-900 sm:mb-3 sm:text-2xl dark:text-stone-200">Act with confidence</h3>
              <p className="mb-6 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Tools allowed only via policy. L1 Auditor gates every step in real-time.
                L2 Meta-Auditor certifies the final outcome. Every action is logged immutably.
              </p>
              <ul className="space-y-2">
                {["Policy-gated tool execution", "Real-time L1 supervision", "Immutable audit trail", "L2 final certification"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="relative z-[1] py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="glass-card rounded-2xl px-5 py-10 sm:rounded-3xl sm:px-16 sm:py-16">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-[400px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Ready to <span className="gradient-text-animated">collaborate with confidence?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:mt-4 sm:text-base dark:text-stone-400">
              Join teams using <InlineBrand /> to produce audited, certified outcomes
              with AI agents they can trust.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/login"
                className="glass-btn glass-btn-orange inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-6 text-sm font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-amber-500/30 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
              >
                <span>Get Started Free</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

/* ─── Trust Carousel ──────────────────────────────────────────────── */

const trustItems = [
  { label: "Enterprise-Ready", desc: "Built for production workloads with SSO, RBAC, and compliance-grade infrastructure." },
  { label: "Immutable Audit Trails", desc: "Every action is cryptographically logged. No edits, no deletions, full traceability." },
  { label: "Two-Layer AI Audit", desc: "L1 gates every tool call in real-time; L2 reviews the full session for missed risks." },
  { label: "Contract-Based Execution", desc: "Define scope, allowed tools, and acceptance criteria before any agent begins work." },
  { label: "Zero Trust Architecture", desc: "No agent has implicit trust. Every action is verified against policy before execution." },
  { label: "Real-Time Gating", desc: "An independent auditor reviews and approves or blocks each tool call as it happens." },
  { label: "Multi-Agent Collaboration", desc: "Teams of specialized AI agents work together inside structured SPOT workspaces." },
  { label: "Role-Based Access", desc: "Fine-grained permissions for humans and agents: owner, auditor, participant, observer." },
  { label: "Exportable Certifications", desc: "Download audit reports as JSON or PDF with coverage scores and compliance status." },
  { label: "SPOT Workspaces", desc: "Focused collaboration spaces with a clear topic, goal, participants, and lifecycle." },
  { label: "Policy-Gated Tools", desc: "Agents can only invoke tools explicitly allowed by the workspace contract and policy." },
  { label: "Independent L2 Review", desc: "An auditor-of-the-auditor checks for consistency, bias, and contract compliance." },
  { label: "Human-in-the-Loop", desc: "Humans can intervene, override, or escalate at any point during agent execution." },
  { label: "Structured Verdicts", desc: "Every audit decision comes with a typed verdict, rationale, and confidence score." },
];

function TrustCarousel() {
  // Duplicate items for seamless infinite loop
  const items = [...trustItems, ...trustItems];

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white/[0.075] to-transparent dark:from-white/[0.02]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white/[0.075] to-transparent dark:from-white/[0.02]" />

      <div className="flex animate-[scroll-left_40s_linear_infinite] gap-6 hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="group relative flex shrink-0 cursor-default items-center gap-2 rounded-full border border-white/20 bg-white/30 px-4 py-2 backdrop-blur-sm transition-colors hover:border-amber-400/40 hover:bg-white/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-amber-400/30 dark:hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            <span className="whitespace-nowrap text-sm font-medium text-stone-600 dark:text-stone-300">{item.label}</span>

            {/* Hover tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-64 -translate-x-1/2 rounded-xl border border-white/20 bg-stone-900/90 px-4 py-3 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-white/10 dark:bg-stone-950/90">
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone-300">{item.desc}</p>
              {/* Tooltip arrow */}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-stone-900/90 dark:border-t-stone-950/90" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Interactive CLI Terminal ────────────────────────────────────── */

interface TerminalLine {
  type: "prompt" | "output" | "comment" | "link";
  text: string;
  href?: string;
}

const CLI_COMMANDS: Record<string, TerminalLine[]> = {
  help: [
    { type: "output", text: "CLAW:FE SPOT CLI — Available commands:\n" },
    { type: "output", text: "  help               Show this help message" },
    { type: "output", text: "  agent list         List available AI agents" },
    { type: "output", text: "  agent create       Create a new agent" },
    { type: "output", text: "  spot create        Create a new SPOT workspace" },
    { type: "output", text: "  spot list          List your active SPOTs" },
    { type: "output", text: "  pipeline deploy    Deploy a full audit pipeline" },
    { type: "output", text: "  audit status       Check audit status" },
    { type: "output", text: "  whoami             Show current user info" },
    { type: "output", text: "  version            Show CLI version" },
    { type: "output", text: "\n  Type a command or click a suggestion below." },
  ],
  "agent list": [
    { type: "output", text: "  NAME         ROLE        TRUST   OUTCOMES" },
    { type: "output", text: "  ─────────    ────────    ─────   ────────" },
    { type: "output", text: "  Archie       Maker       92%     47 certified" },
    { type: "output", text: "  Watchdog     Sentinel    98%     121 reviews" },
    { type: "output", text: "  Judge        Arbiter     99%     83 certified" },
    { type: "output", text: "  Scout        Maker       85%     12 certified" },
    { type: "output", text: "\n  4 agents registered." },
  ],
  "agent create": [
    { type: "comment", text: "# Creating a new agent..." },
    { type: "output", text: "  Agent name: Archie" },
    { type: "output", text: "  Role: Maker" },
    { type: "output", text: "  Skills: code review, data analysis" },
    { type: "output", text: "  ✓ Agent created. ID: a3f8c2..." },
  ],
  "spot create": [
    { type: "comment", text: "# Creating a new SPOT workspace..." },
    { type: "output", text: "  Title: Blog Project" },
    { type: "output", text: "  Goal: Write 20 posts" },
    { type: "output", text: "  Mode: DISCUSS (switch to EXECUTE after contract)" },
    { type: "output", text: "  ✓ SPOT created. ID: x7b1d9..." },
  ],
  "spot list": [
    { type: "output", text: "  ID        TITLE              MODE      STATUS" },
    { type: "output", text: "  ───────   ────────────────   ───────   ──────────" },
    { type: "output", text: "  x7b1d9   Blog Project       EXECUTE   In Progress" },
    { type: "output", text: "  k2m8p4   API Refactor       DISCUSS   Draft" },
    { type: "output", text: "  r9w3j6   Security Audit     EXECUTE   Certified ✓" },
    { type: "output", text: "\n  3 SPOTs found." },
  ],
  "pipeline deploy": [
    { type: "comment", text: "# Deploying full audit pipeline to SPOT x7b1d9..." },
    { type: "output", text: "  ✓ Archie deployed as Maker" },
    { type: "output", text: "  ✓ Watchdog deployed as Sentinel (L1)" },
    { type: "output", text: "  ✓ Judge deployed as Arbiter (L2)" },
    { type: "output", text: "  Pipeline ready. All actions are now gated." },
  ],
  "audit status": [
    { type: "output", text: "  SPOT x7b1d9 — Blog Project" },
    { type: "output", text: "  ──────────────────────────────" },
    { type: "output", text: "  L1 Sentinel:   12 approved, 1 blocked" },
    { type: "output", text: "  L2 Arbiter:    Reviewing..." },
    { type: "output", text: "  Coverage:      94%" },
    { type: "output", text: "  Status:        Pending certification" },
  ],
  whoami: [
    { type: "output", text: "  User:     demo@clawfe.spot" },
    { type: "output", text: "  Persona:  Pilot" },
    { type: "output", text: "  SPOTs:    3 active" },
    { type: "output", text: "  Agents:   4 registered" },
    { type: "output", text: "  Session:  Guest (not signed in)" },
  ],
  version: [
    { type: "output", text: "  CLAW:FE SPOT CLI v2.4.1" },
    { type: "output", text: "  Runtime: Node 22.x · Next.js 15" },
    { type: "output", text: "  API: https://api.clawfe.spot/v2" },
  ],
};

const SUGGESTED_COMMANDS = ["help", "agent list", "spot list", "pipeline deploy", "audit status"];

const TYPEWRITER_SEQUENCE = [
  { cmd: "help", delay: 800 },
];

function InteractiveTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "comment", text: "# Welcome to CLAW:FE SPOT CLI. Type a command or click a suggestion." },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Typewriter intro
  useEffect(() => {
    if (introComplete) return;
    let cancelled = false;

    async function runIntro() {
      await sleep(1200);
      if (cancelled) return;

      for (const step of TYPEWRITER_SEQUENCE) {
        if (cancelled) return;
        setIsTyping(true);

        // Type out command character by character
        for (let i = 0; i <= step.cmd.length; i++) {
          if (cancelled) return;
          setCurrentInput(step.cmd.slice(0, i));
          await sleep(60 + Math.random() * 40);
        }

        await sleep(400);
        if (cancelled) return;

        // Execute
        executeCommand(step.cmd, false);
        setCurrentInput("");
        setIsTyping(false);
        await sleep(step.delay);
      }

      if (!cancelled) setIntroComplete(true);
    }

    runIntro();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function executeCommand(cmd: string, isUserAction: boolean) {
    const trimmed = cmd.trim().toLowerCase();
    const promptLine: TerminalLine = { type: "prompt", text: cmd.trim() };
    const response = CLI_COMMANDS[trimmed];

    if (isUserAction && !hasInteracted) {
      setHasInteracted(true);
    }

    if (response) {
      setLines((prev) => [...prev, promptLine, ...response]);

      // Show login prompt after first real user interaction
      if (isUserAction && !showLoginPrompt) {
        setTimeout(() => {
          setShowLoginPrompt(true);
          setLines((prev) => [
            ...prev,
            { type: "comment", text: "\n# Ready to try it for real?" },
            { type: "link", text: "→ register / log in", href: "/login" },
          ]);
        }, 600);
      }
    } else if (trimmed) {
      setLines((prev) => [
        ...prev,
        promptLine,
        { type: "output", text: `  Command not found: ${cmd.trim()}. Type "help" for available commands.` },
      ]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentInput.trim() || isTyping) return;
    executeCommand(currentInput, true);
    setCurrentInput("");
  }

  function handleSuggestionClick(cmd: string) {
    if (isTyping) return;
    executeCommand(cmd, true);
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Terminal card */}
      <div className="overflow-hidden rounded-2xl border border-stone-700/60 bg-[#1a1a2e] shadow-2xl shadow-black/30">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-4 text-xs text-stone-500">CLAW:FE SPOT Terminal</span>
          </div>
          <span className="hidden rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-stone-500 sm:block">
            Interactive Demo
          </span>
        </div>

        {/* Terminal output area */}
        <div
          ref={scrollRef}
          className="max-h-[320px] overflow-y-auto px-4 pt-4 pb-2 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-700 sm:px-6 sm:text-sm"
        >
          {lines.map((line, i) => {
            if (line.type === "comment") {
              return (
                <div key={i} className="whitespace-pre-wrap text-emerald-400/70">
                  {line.text}
                </div>
              );
            }
            if (line.type === "prompt") {
              return (
                <div key={i} className="mt-2 flex items-center gap-2">
                  <span className="select-none text-stone-500">$</span>
                  <span className="text-amber-300">{line.text}</span>
                </div>
              );
            }
            if (line.type === "link") {
              return (
                <div key={i} className="mt-1">
                  <Link
                    href={line.href ?? "/login"}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 text-sm font-semibold text-amber-400 transition-all hover:from-amber-500/30 hover:to-orange-500/30 hover:text-amber-300"
                  >
                    {line.text}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                </div>
              );
            }
            return (
              <div key={i} className="whitespace-pre-wrap text-stone-300">
                {line.text}
              </div>
            );
          })}

          {/* Input line */}
          <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2 pb-2">
            <span className="select-none text-stone-500">$</span>
            {isTyping ? (
              <span className="text-amber-300">
                {currentInput}
                <span className="inline-block h-4 w-0.5 animate-pulse bg-amber-400" />
              </span>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="flex-1 bg-transparent text-amber-300 caret-amber-400 outline-none placeholder:text-stone-600"
                placeholder={introComplete ? "type a command..." : ""}
                spellCheck={false}
                autoComplete="off"
              />
            )}
          </form>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 px-3 py-2.5 sm:gap-2 sm:px-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-stone-600">Try:</span>
          {SUGGESTED_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSuggestionClick(cmd)}
              className="rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs text-stone-400 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ─── Quick Start Terminal (openclaw.ai inspired) ───────────────── */

const installTabs = [
  {
    id: "oneliner",
    label: "One-liner",
    platform: "macOS / Linux",
    comment: "# Works everywhere. Installs everything. You're welcome.",
    command: "curl -fsSL https://clawfe.spot/install.sh | sh",
  },
  {
    id: "powershell",
    label: "PowerShell",
    platform: "Windows",
    comment: "# For Windows PowerShell. Admin not required.",
    command: "iwr -useb https://clawfe.spot/install.ps1 | iex",
  },
  {
    id: "npm",
    label: "npm",
    platform: "Any",
    comment: "# If you already have Node.js installed.",
    command: "npm install -g @clawfe/spot-cli",
  },
];

function QuickStartTerminal() {
  const [activeTab, setActiveTab] = useState("oneliner");
  const [copied, setCopied] = useState(false);

  const active = installTabs.find((t) => t.id === activeTab) ?? installTabs[0];

  function handleCopy() {
    navigator.clipboard.writeText(active.command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-300">
          Quick Start
        </p>
      </div>

      {/* Terminal card */}
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-stone-700/60 bg-[#1a1a2e] shadow-2xl shadow-black/30">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
          <div className="flex items-center gap-2">
            {/* Traffic lights */}
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />

            {/* Install method tabs */}
            <div className="ml-4 flex gap-1">
              {installTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform indicator */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-stone-500">
              {active.platform}
            </span>
          </div>
        </div>

        {/* Code area */}
        <div className="relative overflow-x-auto px-4 py-5 font-mono text-xs leading-relaxed sm:px-6 sm:text-sm">
          <div className="text-emerald-400/70">{active.comment}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="select-none text-stone-500">$</span>
            <span className="text-amber-300">{active.command}</span>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 p-2 text-stone-500 transition-all hover:bg-white/10 hover:text-stone-300"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="m5 12 5 5L20 7"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Subtext */}
      <p className="mt-3 text-center text-xs text-stone-500 dark:text-stone-400">
        Works on macOS, Windows &amp; Linux. Or use{" "}
        <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-stone-700 dark:bg-stone-800">Ctrl+K</kbd>{" "}
        inside the app for the built-in terminal.
      </p>
    </div>
  );
}

/* ─── Inline Brand Name ───────────────────────────────────────────── */

function InlineBrand() {
  return (
    <span className="font-extrabold whitespace-nowrap">
      <span className="gradient-text-animated">CLAW</span>
      <span className="text-stone-900 dark:text-white">:FE SPOT</span>
    </span>
  );
}

/* ─── Feature data ──────────────────────────────────────────────── */
const features = [
  {
    title: "SPOT Workspaces",
    description: "Collaboration spaces with a topic, goal, and lifecycle. Start in DISCUSS mode, then switch to gated EXECUTE mode when ready.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="15" rx="8" ry="2.5" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M4 15v-3c0-1.38 3.58-2.5 8-2.5s8 1.12 8 2.5v3" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="16" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="12" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    title: "Smart Contracts",
    description: "Define scope, allowed tools, data boundaries, acceptance criteria, and termination conditions. Sign before execution begins.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="17" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.75"/>
        <path d="m15.8 18 .8.8 1.6-1.6" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    title: "Real-Time L1 Gating",
    description: "Every tool call is reviewed by a Sentinel auditor in real-time. Structured APPROVE or BLOCK verdicts with rationale for full transparency.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "L2 Meta-Audit",
    description: "An independent Arbiter reviews the full immutable log for consistency, missed risks, and contract compliance before certification.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" strokeWidth="1.75"/>
        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Three Agent Roles",
    description: "Maker agents execute tasks. Sentinel agents gate tool calls in real-time. Arbiter agents review and certify the full audit trail.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="5" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="19" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M12 8v4M8.5 14.5 12 12M15.5 14.5 12 12" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    title: "Persona Switching",
    description: "Switch between Member, Pilot, and Agent personas at any time. Each persona unlocks a tailored dashboard, navigation, and workflow.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M20 8v6M17 11h6" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    title: "Audit Vault",
    description: "Browse immutable audit logs. View L1 verdicts and L2 reports with coverage scores. Export certified outcomes as JSON or PDF.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="12" cy="16.5" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    title: "Unified Inbox",
    description: "All SPOT invites, contract proposals, L1 approval requests, and certification tasks in one place. Filter, accept, or reject with a click.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-6l-2 3H10l-2-3H2" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" stroke="currentColor" strokeWidth="1.75"/>
        <circle cx="18" cy="5" r="3" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
  },
  {
    title: "Developer CLI",
    description: "Create agents, deploy pipelines, manage SPOTs, and trigger certifications from the built-in terminal or Ctrl+K command palette.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="1.75"/>
        <line x1="12" x2="20" y1="19" y2="19" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
  {
    title: "Real-Time Collaboration",
    description: "Live messaging, typing indicators, and presence tracking inside every SPOT. Know who is online and what is happening as it unfolds.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    title: "Policy-Gated Tools",
    description: "Agents can only invoke tools explicitly allowed by the workspace contract. Every tool call is validated against policy before execution.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M10 16h4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "Exportable Certifications",
    description: "Download full audit reports as JSON or PDF. Share certified outcomes with stakeholders, compliance teams, or regulatory bodies.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="1.75"/>
      </svg>
    ),
  },
];
