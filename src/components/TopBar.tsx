"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { openCommandPalette } from "@/components/cli/CommandPalette";

type Persona = "member" | "pilot" | "agent";

const personaGradientClass: Record<Persona, string> = {
  member: "btn-gradient-member",
  pilot: "btn-gradient-pilot",
  agent: "btn-gradient-agent",
};

const personaShadow: Record<Persona, string> = {
  member: "shadow-sky-500/20 hover:shadow-sky-500/30",
  pilot: "shadow-amber-500/20 hover:shadow-amber-500/30",
  agent: "shadow-emerald-500/20 hover:shadow-emerald-500/30",
};

const personaLetter: Record<Persona, string> = {
  member: "M",
  pilot: "P",
  agent: "A",
};

export function TopBar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [persona, setPersona] = useState<Persona>("member");
  const [menuOpen, setMenuOpen] = useState(false);

  // Detect current theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  // Fetch user persona
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const p = d.persona;
        if (p === "member" || p === "pilot" || p === "agent") setPersona(p);
      })
      .catch(() => {});
  }, []);

  // Re-fetch persona when navigating from roles / dashboard
  useEffect(() => {
    if (pathname.startsWith("/roles") || pathname === "/dashboard") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          const p = d.persona;
          if (p === "member" || p === "pilot" || p === "agent") setPersona(p);
        })
        .catch(() => {});
    }
  }, [pathname]);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Sync theme from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      } else if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setDarkMode(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const gradientClass = personaGradientClass[persona];
  const shadowClass = personaShadow[persona];
  const letter = personaLetter[persona];

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-stone-200/40 bg-white/60 px-3 py-2 shadow-lg shadow-stone-900/[0.03] backdrop-blur-xl dark:border-stone-700/40 dark:bg-stone-900/60 dark:shadow-black/10">
          {/* Left: New SPOT */}
          <Link
            href="/spots/new"
            data-onboarding="new-spot-button"
            className="btn-gradient-animated flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/25 transition-all hover:shadow-lg hover:shadow-rose-500/35"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New SPOT
          </Link>

          {/* Center: Terminal */}
          <button
            onClick={openCommandPalette}
            data-onboarding="terminal-button"
            className="flex items-center gap-2 rounded-xl border border-stone-200/60 bg-white/50 px-4 py-1.5 text-xs font-medium text-stone-500 transition-all hover:border-stone-300 hover:bg-white/80 hover:text-stone-700 dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:text-stone-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
            Terminal
            <kbd className="hidden rounded border border-stone-300/60 bg-stone-100/80 px-1.5 py-0.5 font-mono text-[9px] text-stone-400 sm:inline dark:border-stone-600/60 dark:bg-stone-700/50 dark:text-stone-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Right: Dark mode + User + Sign out */}
          <div className="flex items-center gap-1.5">
            {/* Dark / Light toggle */}
            <button
              onClick={toggleDark}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>

            {/* User avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className={`${gradientClass} flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${shadowClass} transition-all`}
                aria-label="User menu"
              >
                {letter}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200/60 bg-white/90 shadow-xl shadow-stone-900/10 backdrop-blur-xl dark:border-stone-700/60 dark:bg-stone-900/90 dark:shadow-black/20">
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Profile &amp; Settings
                    </Link>
                    <Link
                      href="/roles"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                      Switch Role
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Sign out */}
            <Link
              href="/logout"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-stone-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              title="Sign out"
              aria-label="Sign out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
