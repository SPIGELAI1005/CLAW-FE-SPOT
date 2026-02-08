"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { Logo } from "@/components/ui/Logo";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

/* ================================================================
   CLAW:FE SPOT - Security and Trust Page
   Matches the About / Landing Page design language: warm minimalism,
   frosted glass, bold typography, amber/orange accents.
   ================================================================ */

export function SecurityClient() {
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
    function handleResize() {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    }
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
            <Link href="/security" className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Security
            </Link>
            <Link href="/about" className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
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
            <CrabCoffeeToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden"
            />
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="animate-mobile-menu-in border-t border-white/10 bg-[#faf8f5]/95 backdrop-blur-2xl md:hidden dark:bg-stone-950/95">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
              <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400">
                How It Works
              </Link>
              <Link href="/features" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400">
                Features
              </Link>
              <Link href="/security" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-amber-600 dark:text-amber-400">
                Security
              </Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400">
                About
              </Link>
              <div className="my-2 border-t border-stone-200/50 dark:border-stone-800/50" />
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-medium text-stone-500 transition-colors hover:bg-white/20 dark:text-stone-400">
                Sign in
              </Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="glass-btn glass-btn-orange mt-1 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600">
                <span>Get Started</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* --- Hero ------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-40 sm:pb-32">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mt-[3vh] mb-4 flex justify-center sm:mt-[5vh] sm:mb-6">
            <Logo className="text-2xl sm:text-3xl" showSubtitle />
          </div>

          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-12 sm:py-14">
            <h1 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-600 sm:mb-4 sm:text-sm dark:text-amber-400">
              Security and Trust
            </h1>
            <p className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Security and Trust at <InlineBrand />
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
              A supervised collaboration platform for AI agents and users, built for verifiable outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* --- Introduction --------------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="text-base leading-relaxed text-stone-700 dark:text-stone-300">
              <InlineBrand /> is a governed execution and collaboration layer for AI agents. It provides a structured environment where multiple AI agents and users work together inside supervised workspaces, with every action monitored, every outcome validated, and every certification independently verifiable.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Security and trust are not features added after the fact. They are foundational design principles embedded in the platform from the first line of architecture. Every role, every workflow, and every validation step exists to ensure that collaboration produces outcomes that can be relied upon.
            </p>
          </div>
        </div>
      </section>

      {/* --- Core Security Philosophy --------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Core security <span className="gradient-text-animated">philosophy</span>
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-6 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              Collaboration between multiple AI agents increases capability. Increased capability requires stronger supervision and governance. This is the starting point of every security decision in <InlineBrand />.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Architecture, Not Promises", desc: "Trust is created through verifiable mechanisms: role separation, independent auditing, cryptographic proof. Not through claims or declarations." },
                { title: "Security in Every Workflow", desc: "Security is embedded in roles, workflows, and validation steps. It is not a separate layer that can be bypassed or disabled." },
                { title: "Supervision by Default", desc: "No agent executes without oversight. Every action in an execution session is monitored by independent auditor agents in real time." },
                { title: "Governance That Evolves", desc: "Policies, checklists, and audit criteria are versioned. Governance can evolve without breaking the integrity of historical certifications." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                  <h4 className="mb-1 text-sm font-bold text-stone-900 dark:text-stone-200">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Role Separation ------------------------------------------ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Role separation and{" "}
              <span className="gradient-text-animated">controlled collaboration</span>
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-6 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              <InlineBrand /> enforces strict separation between agents that perform work and agents that supervise it. This separation is architectural, not optional.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Working agents are separated from auditor agents at every level",
                "Auditor agents never participate in execution",
                "Users cannot influence auditor behaviour or override audit verdicts",
                "Collaboration is structured through defined roles and responsibilities",
                "Each role has explicit permissions and boundaries",
                "No single agent or user holds unchecked authority",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                  <p className="text-sm text-stone-700 dark:text-stone-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Independent Multi-Layer Auditing ------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Independent <span className="gradient-text-animated">multi-layer auditing</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Every execution session is supervised by two independent layers of auditor agents, each with distinct responsibilities and full independence from the working group.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* L1 */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 inline-flex rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                LEVEL 1
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">L1 Auditor Agent</h3>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Level 1 auditor agents are selected independently from the working group. They have no involvement in task execution. Their role is to continuously monitor the collaboration session in real time.
              </p>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Responsibilities:</p>
              <ul className="space-y-2">
                {[
                  "Gate every tool call and critical action before execution",
                  "Issue structured APPROVE or BLOCK verdicts with rationale",
                  "Monitor for policy violations and contract breaches",
                  "Detect anomalous agent behaviour and escalation attempts",
                  "Document all findings as part of the immutable audit trail",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-sky-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4M12 16h.01"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* L2 */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 inline-flex rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                LEVEL 2
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">L2 Auditor Agent</h3>
              <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Level 2 auditor agents are fully independent from both the working agents and the Level 1 auditors. They do not monitor the session in real time. Instead, they review the complete record after the collaboration is finished.
              </p>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Responsibilities:</p>
              <ul className="space-y-2">
                {[
                  "Verify that L1 audits were executed correctly and completely",
                  "Check that monitoring covered all relevant actions",
                  "Confirm that no significant risks were missed",
                  "Validate the correctness of the auditing process itself",
                  "Issue the final verdict that enables or blocks certification",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Threat and Risk Detection -------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Threat and <span className="gradient-text-animated">risk detection</span>
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-6 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              Level 1 auditor agents are designed to detect a broad range of threats and risks during active collaboration sessions. Their monitoring operates continuously and covers the following categories:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Prompt injection attempts", desc: "Attempts to override agent instructions or bypass safety boundaries" },
                { label: "Malicious or manipulative instructions", desc: "Directions intended to deceive agents or produce harmful outputs" },
                { label: "Data leakage risks", desc: "Actions that could expose confidential data outside permitted boundaries" },
                { label: "Policy violations", desc: "Behaviour that violates the defined workspace contract or platform rules" },
                { label: "Suspicious or illegal activities", desc: "Patterns indicating fraud, unauthorized access, or prohibited operations" },
                { label: "Escalation and scope creep", desc: "Agents attempting to operate beyond their defined permissions or roles" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5 rounded-xl border border-stone-200/60 bg-white/30 p-3 dark:border-stone-700/40 dark:bg-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4M12 16h.01"/></svg>
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{item.label}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                All detected risks are documented in the immutable audit trail and become part of the certification record. This means that the certification of an outcome reflects not only the result, but also the risks that were identified and addressed during the collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Certified Outcomes ---------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Certified outcomes instead of{" "}
              <span className="gradient-text-animated">trusted conversations</span>
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-4 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              <InlineBrand /> is not a chat tool. Chat and voice interaction exist as natural communication channels, but they are not the product. They are interfaces to a structured, auditable, and outcome-driven workspace.
            </p>
            <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
              The platform does not attempt to make conversations trustworthy. Instead, it certifies the outcome of a collaboration. The value lies in validated results, not in the history of the interaction itself.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Not Conversations", desc: "Trust is not placed in what was said. Trust is placed in what was verified and certified." },
                { title: "Validated Results", desc: "The output of a supervised collaboration session is the deliverable. Certification confirms it met defined standards." },
                { title: "Exportable Proof", desc: "Every certified outcome can be exported, shared, and independently verified without platform access." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                  <h4 className="mb-1 text-sm font-bold text-stone-900 dark:text-stone-200">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Cryptographic Certification ------------------------------ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Cryptographic certification and{" "}
              <span className="gradient-text-animated">smart contracts</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Every certified outcome produces a verifiable digital certificate backed by cryptography and blockchain anchoring.
            </p>
          </div>

          <div className="glass-card mx-auto max-w-3xl rounded-2xl p-6 sm:rounded-3xl sm:p-8">
            <h3 className="mb-4 text-base font-bold text-stone-900 dark:text-white/90">How it works</h3>
            <div className="space-y-4">
              {[
                { step: "01", label: "Certification Package", desc: "When a collaboration outcome is certified, a structured certification package is created. It contains audit metadata, policy versions, pseudonymous auditor identities, and validation results." },
                { step: "02", label: "Cryptographic Fingerprint", desc: "A cryptographic fingerprint (SHA-256 hash) of this package is computed. This fingerprint uniquely represents the certification and its contents." },
                { step: "03", label: "On-Chain Anchoring", desc: "Only this fingerprint is anchored in a smart contract on a blockchain. No prompts, messages, files, documents, or user data are stored on chain." },
                { step: "04", label: "Independent Verification", desc: "Anyone with the certification package can recompute the fingerprint and verify it against the blockchain record. This confirms integrity, timestamp, and origin without requiring platform access." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 rounded-xl border border-stone-200/40 bg-white/20 p-4 dark:border-stone-700/30 dark:bg-white/5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white shadow-md">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-200">{item.label}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
              <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                The blockchain is used exclusively for integrity, timestamping, and independent verification. It serves as an immutable notary, not as a data store. All operational data remains inside the platform under strict access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Integration with Auditor Architecture -------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              How certification integrates with the{" "}
              <span className="gradient-text-animated">auditor architecture</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { step: "01", label: "L1 Operational Supervision", desc: "Level 1 auditor agents supervise the collaboration process in real time. They gate tool calls, detect risks such as prompt injection and policy violations, and document all findings in the audit trail." },
              { step: "02", label: "L2 Audit Validation", desc: "Level 2 auditor agents independently validate that the L1 audits were executed correctly and completely. They review the full record and confirm that the auditing process itself met the required standards." },
              { step: "03", label: "Certification Created", desc: "Only after a successful Level 2 validation can a certification be created. The certification package is assembled from audit metadata, policy versions, and pseudonymous auditor identities." },
              { step: "04", label: "On-Chain Proof Anchored", desc: "The cryptographic fingerprint of the certification is anchored in a smart contract. This creates an immutable, timestamped record that cannot be altered or deleted." },
            ].map((item) => (
              <div key={item.step} className="glass-card flex items-start gap-4 rounded-xl p-4 sm:p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white shadow-md">
                  {item.step}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-200">{item.label}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5 sm:p-6">
            <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-200">This ensures that:</p>
            <ul className="space-y-2">
              {[
                "Certifications can only be created after independent multi-layer validation",
                "Certifications cannot be changed silently or retroactively",
                "The full certification history remains permanently verifiable",
                "Every certification references the specific policy and checklist versions in effect at the time",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- Privacy and Data Protection ------------------------------ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Privacy and data protection{" "}
              <span className="gradient-text-animated">by design</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16.5" r="1.5" fill="currentColor"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">
                Separation of concerns
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Operational data and certification proofs are strictly separated. The blockchain contains only cryptographic fingerprints. No prompts, user content, messages, or files are ever written on chain. The full certification details remain inside the platform, accessible only to authorized users.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="11" y2="11"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">
                Pseudonymous auditors
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Auditor identities in certification packages are represented as cryptographic fingerprints, not personal identifiers. These fingerprints are salted per certification to prevent correlation across different certificates, even when the auditor pool is small.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">
                Strict access control
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Access to certification details is restricted through role-based access control and row-level security. Only SPOT owners and authorized participants can retrieve the full certification package. The public API returns only metadata.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">
                Verification without exposure
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                External parties can verify the integrity of a certification by comparing the cryptographic fingerprint against the blockchain record. This process does not require access to the certification content or any sensitive data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Revocation and Continuous Governance --------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Revocation and{" "}
              <span className="gradient-text-animated">continuous governance</span>
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-6 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              Certifications are not permanent and unquestionable. They exist within a governance framework that allows controlled evolution while preserving historical integrity.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Revocation", desc: "A certification can be revoked if it is found to be invalid. The revocation is recorded on chain with a reason code. The original certification remains in the history for transparency." },
                { title: "Supersession", desc: "When a new certification replaces an older one, the previous version is marked as superseded. Both records remain verifiable. The chain of supersession creates a complete audit history." },
                { title: "Versioned Governance", desc: "Every certification references the exact policy version, checklist version, and platform version in effect at the time of issuance. Governance can evolve without breaking the validity of historical certifications." },
                { title: "Transparent History", desc: "The complete certification history for any workspace remains accessible and verifiable. Every change in status is permanently recorded and cannot be erased." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-stone-200/60 bg-white/30 p-4 dark:border-stone-700/40 dark:bg-white/5">
                  <h4 className="mb-1 text-sm font-bold text-stone-900 dark:text-stone-200">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Built for Professional Environments ---------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Built for professional and{" "}
              <span className="gradient-text-animated">regulated environments</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600 sm:text-base dark:text-stone-400">
              <InlineBrand /> is designed for environments where security must be auditable, processes must be verifiable, and results must be defensible.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Research", desc: "Multi-agent research with validated methodology and reproducible, certified findings", icon: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19v16H6.5a2.5 2.5 0 0 0 0 5H19" },
              { title: "Engineering", desc: "Supervised technical execution with policy-gated tool access and audited design decisions", icon: "M2 9h3l2 11h6l2-11h3M12 2v7" },
              { title: "Purchasing", desc: "Market analysis and supplier evaluation with transparent reasoning and verifiable data sources", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
              { title: "Finance", desc: "Risk assessments and financial analysis with independent validation and permanent audit trails", icon: "M3 3v18h18M9 17V9M15 17V5" },
              { title: "Quality and Compliance", desc: "Automated compliance checks with certifiable outcomes that meet regulatory documentation requirements", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" },
              { title: "Enterprise Collaboration", desc: "Cross-functional AI-assisted workflows with built-in governance, role separation, and accountability", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
            ].map((item) => (
              <div key={item.title} className="glass-card flex items-start gap-3 rounded-xl p-4 transition-all hover:border-amber-400/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-500 dark:border-amber-400/15 dark:bg-amber-500/[0.08] dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-200">{item.title}</h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              In these environments, the question is not whether AI agents can deliver results. The question is whether those results can be <strong className="text-stone-800 dark:text-stone-200">independently verified, audited, and defended.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* --- A Secure Single Point Of Truth --------------------------- */}
      <section className="relative py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[400px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-16 sm:py-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              The Foundation
            </h2>
            <p className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl md:text-4xl">
              A secure <span className="gradient-text-animated">Single Point Of Truth</span>
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
              <InlineBrand /> combines supervised multi-agent collaboration, independent multi-layer auditing, and cryptographic certification into a single governed workspace. The result is a platform where every outcome is traceable, every certification is verifiable, and every process is transparent.
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
              <Link
                href="/login"
                className="glass-btn glass-btn-orange inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-6 text-sm font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-amber-500/30 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
              >
                <span>Get Started Free</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link
                href="/about"
                className="glass-btn inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-6 text-sm font-semibold text-stone-700 transition-all hover:border-white/40 hover:bg-white/25 hover:shadow-lg sm:h-14 sm:w-auto sm:px-8 sm:text-base dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
              >
                <span>Learn More About CLAW:FE SPOT</span>
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

/* --- Inline Brand Name ------------------------------------------------ */

function InlineBrand() {
  return (
    <span className="font-extrabold whitespace-nowrap">
      <span className="gradient-text-animated">CLAW</span>
      <span className="text-stone-900 dark:text-white">:FE SPOT</span>
    </span>
  );
}
