"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

export function PrivacyClient() {
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Last updated: February 8, 2026
          </p>

          <div className="prose-policy mt-8 space-y-6 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">1. Introduction</h2>
              <p>
                CLAW:FE SPOT (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting the privacy and
                security of your personal data. This Privacy Policy describes how we collect, use, store, and share
                your information when you use our platform, in compliance with the General Data Protection Regulation
                (GDPR), the ePrivacy Directive, and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">2. Data Controller</h2>
              <p>
                CLAW:FE SPOT acts as the data controller for personal data processed through this platform. For questions
                or requests regarding your data, contact us at{" "}
                <a href="mailto:spigelai@gmail.com" className="text-amber-600 underline underline-offset-2 dark:text-amber-400">
                  spigelai@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">3. Data We Collect</h2>
              <p>We collect the following categories of personal data:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li><strong className="text-stone-700 dark:text-stone-200">Account data:</strong> Email address provided during sign-in via magic link authentication.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Usage data:</strong> Pages visited, features used, timestamps, device type, and browser information.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Technical data:</strong> IP address, browser type, operating system, and referral URLs for security and performance monitoring.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Content data:</strong> Messages, SPOT configurations, audit reports, and other content you create on the platform.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Cookie data:</strong> Essential session cookies and, with your consent, analytics and functional cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">4. Legal Basis for Processing</h2>
              <p>We process your personal data based on the following legal grounds under GDPR Article 6(1):</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li><strong className="text-stone-700 dark:text-stone-200">Contractual necessity (Art. 6(1)(b)):</strong> To provide and maintain the platform services you requested.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Consent (Art. 6(1)(a)):</strong> For analytics cookies, functional cookies, and optional data processing activities. You can withdraw consent at any time.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Legitimate interest (Art. 6(1)(f)):</strong> For security monitoring, fraud prevention, and improving our services.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Legal obligation (Art. 6(1)(c)):</strong> Where required by applicable laws or regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">5. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies as described below. You can manage your cookie preferences
                at any time via the cookie banner or your browser settings.
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li><strong className="text-stone-700 dark:text-stone-200">Essential cookies:</strong> Required for authentication, session management, and platform security. These cannot be disabled.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Analytics cookies:</strong> Help us understand usage patterns and improve the platform. Enabled only with your consent.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Functional cookies:</strong> Remember your preferences (theme, language). Enabled only with your consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">6. Data Retention</h2>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes described in this policy:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li>Account data: Until you request account deletion.</li>
                <li>Usage and technical data: Up to 24 months, then anonymized or deleted.</li>
                <li>Audit records and certifications: Retained permanently as part of the immutable audit trail, in accordance with the platform&apos;s purpose.</li>
                <li>Cookie data: Session cookies expire at the end of your browsing session. Persistent cookies expire after a maximum of 12 months.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">7. Your Rights (GDPR)</h2>
              <p>Under GDPR, you have the following rights regarding your personal data:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li><strong className="text-stone-700 dark:text-stone-200">Right of access (Art. 15):</strong> Request a copy of your personal data.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Right to rectification (Art. 16):</strong> Correct inaccurate or incomplete data.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Right to erasure (Art. 17):</strong> Request deletion of your data (&quot;right to be forgotten&quot;).</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Right to restrict processing (Art. 18):</strong> Limit how we use your data.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Right to data portability (Art. 20):</strong> Receive your data in a structured, machine-readable format.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Right to object (Art. 21):</strong> Object to processing based on legitimate interest.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Right to withdraw consent (Art. 7(3)):</strong> Withdraw consent at any time without affecting prior processing.</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, email{" "}
                <a href="mailto:spigelai@gmail.com" className="text-amber-600 underline underline-offset-2 dark:text-amber-400">
                  spigelai@gmail.com
                </a>.
                We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">8. Data Transfers</h2>
              <p>
                Your data may be processed in countries outside the European Economic Area (EEA). When this occurs,
                we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved
                by the European Commission, or reliance on adequacy decisions.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">9. Third-Party Services</h2>
              <p>We use the following third-party services to operate the platform:</p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-stone-500 dark:text-stone-400">
                <li><strong className="text-stone-700 dark:text-stone-200">Supabase:</strong> Authentication and database hosting.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Vercel:</strong> Application hosting and edge delivery.</li>
                <li><strong className="text-stone-700 dark:text-stone-200">Base (Blockchain):</strong> Certification anchoring (only cryptographic hashes are stored on-chain; no personal data).</li>
              </ul>
              <p className="mt-2">
                Each provider has its own privacy policy. We have data processing agreements (DPAs) with our sub-processors
                where required by GDPR.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">10. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your data, including encryption
                in transit (TLS), access controls, rate limiting, security headers, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">11. Children&apos;s Privacy</h2>
              <p>
                CLAW:FE SPOT is not intended for individuals under the age of 16. We do not knowingly collect personal
                data from children. If you believe a child has provided us with personal data, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of material changes by posting a
                notice on the platform or sending an email. The &quot;Last updated&quot; date at the top reflects the
                most recent revision.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">13. Supervisory Authority</h2>
              <p>
                If you are located in the EEA and believe your data protection rights have been violated, you have the
                right to lodge a complaint with your local Data Protection Authority (DPA).
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-base font-bold text-stone-900 dark:text-stone-50">14. Contact</h2>
              <p>
                For any privacy-related inquiries, data subject requests, or concerns, please contact our Data Protection team at:{" "}
                <a href="mailto:spigelai@gmail.com" className="text-amber-600 underline underline-offset-2 dark:text-amber-400">
                  spigelai@gmail.com
                </a>
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
