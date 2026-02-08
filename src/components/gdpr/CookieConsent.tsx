"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/**
 * GDPR-compliant cookie consent banner.
 *
 * - Shows on first visit (no consent stored).
 * - Allows accepting all, rejecting non-essential, or customizing.
 * - Persists choice in localStorage (not a cookie itself, to avoid circular dependency).
 * - Blocks non-essential cookies/scripts until consent is given.
 */

interface CookiePreferences {
  essential: boolean; // always true — required for the app to function
  analytics: boolean;
  functional: boolean;
}

const CONSENT_KEY = "cookie-consent";
const PREFS_KEY = "cookie-preferences";

function getStoredConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "true";
}

function getStoredPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as CookiePreferences) : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    // Small delay to avoid flash on page load
    const timer = setTimeout(() => {
      if (!getStoredConsent()) {
        setIsVisible(true);
      } else {
        const stored = getStoredPreferences();
        if (stored) setPreferences(stored);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const saveConsent = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, "true");
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);

    // Dispatch custom event so other parts of the app can react
    window.dispatchEvent(
      new CustomEvent("cookie-consent-update", { detail: prefs }),
    );
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({ essential: true, analytics: true, functional: true });
  }, [saveConsent]);

  const rejectNonEssential = useCallback(() => {
    saveConsent({ essential: true, analytics: false, functional: false });
  }, [saveConsent]);

  const saveCustom = useCallback(() => {
    saveConsent(preferences);
  }, [saveConsent, preferences]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-stone-200/60 bg-white/95 shadow-2xl shadow-stone-900/10 backdrop-blur-xl dark:border-stone-700/60 dark:bg-stone-900/95 dark:shadow-black/30">
        {/* Main banner */}
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                We value your privacy
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                We use cookies and similar technologies to provide essential site functionality,
                understand how you use our platform, and improve your experience. Some cookies are
                necessary for the site to work, while others help us analyze usage and personalize content.
              </p>
              <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">
                Read our{" "}
                <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-amber-600 dark:hover:text-amber-400">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-amber-600 dark:hover:text-amber-400">
                  Terms of Service
                </Link>{" "}
                for more details.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-medium text-stone-500 underline underline-offset-2 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              {showDetails ? "Hide preferences" : "Customize preferences"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={rejectNonEssential}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                Essential only
              </button>
              <button
                onClick={acceptAll}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>

        {/* Expandable preferences panel */}
        {showDetails && (
          <div className="border-t border-stone-200/60 bg-stone-50/50 px-5 py-4 sm:px-6 dark:border-stone-700/60 dark:bg-stone-800/30">
            <div className="space-y-3">
              {/* Essential cookies - always on */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-amber-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                    Essential cookies
                  </span>
                  <span className="ml-2 rounded-md bg-stone-200/60 px-1.5 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-stone-700/60 dark:text-stone-400">
                    Required
                  </span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                    Authentication, session management, and security. These cannot be disabled.
                  </p>
                </div>
              </label>

              {/* Analytics cookies */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-amber-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                    Analytics cookies
                  </span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                    Help us understand how visitors interact with the platform to improve features and performance.
                  </p>
                </div>
              </label>

              {/* Functional cookies */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, functional: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-amber-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                    Functional cookies
                  </span>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                    Remember your preferences such as theme, language, and display settings for a better experience.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={saveCustom}
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
