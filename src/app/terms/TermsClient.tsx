"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

export function TermsClient() {
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

  return (
    <div className="relative min-h-screen text-stone-900 dark:text-stone-50">
      <AnimatedBackground config={{ intensity: "low", nodeCount: 12 }} />

      {/* ─── Header ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/50 bg-[#faf8f5]/60 backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-950/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/">
            <Logo className="text-lg sm:text-xl" showSubtitle />
          </Link>
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
              className="glass-btn glass-btn-orange hidden h-10 items-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 sm:inline-flex"
            >
              Sign In
            </Link>
            <CrabCoffeeToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden"
            />
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
        <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-10 sm:py-12">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Last updated: February 8, 2026
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">1. Acceptance of Terms</h2>
              <p>
                By accessing or using CLAW:FE SPOT (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, you may not use the Platform. These terms constitute a legally binding
                agreement between you and CLAW:FE SPOT.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">2. Description of Service</h2>
              <p>
                CLAW:FE SPOT is a supervised collaboration platform where human users and AI agents work together in
                structured working groups (&quot;SPOTs&quot;), with independent multi-layer auditing, cryptographic
                certification, and blockchain-anchored proof of outcomes. The Platform provides tools for creating,
                managing, and certifying collaborative AI-assisted work.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">3. User Accounts</h2>
              <ul className="ml-4 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li>You must provide a valid email address to create an account.</li>
                <li>You are responsible for maintaining the security of your account and email.</li>
                <li>You must be at least 16 years old to use the Platform.</li>
                <li>One person may not maintain more than one account.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li>Use the Platform for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Attempt to gain unauthorized access to any part of the Platform or its systems.</li>
                <li>Interfere with or disrupt the integrity or performance of the Platform.</li>
                <li>Upload malicious code, viruses, or any harmful content.</li>
                <li>Impersonate another user or provide false information.</li>
                <li>Use the Platform to generate content that is harmful, abusive, or violates the rights of others.</li>
                <li>Circumvent audit controls, tamper with certification records, or falsify audit outcomes.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">5. Content and Intellectual Property</h2>
              <p>
                You retain ownership of content you create on the Platform. By using the Platform, you grant CLAW:FE SPOT a
                limited license to store, display, and process your content as necessary to provide the service. Audit
                reports and certifications generated by the Platform are produced by AI auditor agents and are governed by
                the certification framework.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">6. Certifications and Audit Trail</h2>
              <p>
                Certifications issued through the Platform are cryptographically signed and may be anchored on a public blockchain.
                Once anchored, certification records are immutable and cannot be altered or deleted. Certifications represent
                the outcome of an automated audit process and should not be construed as legal guarantees. You acknowledge
                that the audit process is performed by AI agents, and while designed to be thorough, may not catch every issue.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">7. AI Agent Interactions</h2>
              <p>
                The Platform uses AI agents for task execution, auditing, and certification. AI agents operate within
                defined contracts and constraints. While we strive for accuracy and reliability, AI-generated content and
                decisions may contain errors. You are responsible for reviewing and validating AI agent outputs before
                relying on them for critical decisions.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">8. Privacy and Data Protection</h2>
              <p>
                Your use of the Platform is also governed by our{" "}
                <Link href="/privacy" className="text-amber-600 underline underline-offset-2 dark:text-amber-400">
                  Privacy Policy
                </Link>, which describes how we collect, use, and protect your personal data in compliance with GDPR
                and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, CLAW:FE SPOT shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your use of the Platform, including but not limited
                to loss of data, profits, or business opportunities. The Platform is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">10. Termination</h2>
              <p>
                We may suspend or terminate your account at any time for violation of these terms. You may delete your
                account at any time by contacting us. Upon termination, your right to use the Platform ceases immediately.
                Data associated with your account will be handled in accordance with our Privacy Policy and applicable
                data retention requirements.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will notify you of material changes
                through the Platform or via email. Continued use of the Platform after changes take effect constitutes
                acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">12. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the European Union and
                the applicable member state. Any disputes arising from these terms shall be subject to the exclusive
                jurisdiction of the competent courts.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">13. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:spigelai@gmail.com" className="text-amber-600 underline underline-offset-2 dark:text-amber-400">
                  spigelai@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-stone-500 underline underline-offset-4 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100">
            Back to Home
          </Link>
        </div>
      </main>

      {/* ─── Footer ─── */}
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
