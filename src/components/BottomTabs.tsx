"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Persona = "member" | "pilot" | "agent";

const personaActiveColor: Record<Persona, string> = {
  member: "text-sky-600 dark:text-sky-400",
  pilot: "text-amber-600 dark:text-amber-400",
  agent: "text-emerald-600 dark:text-emerald-400",
};

const personaFocusOutline: Record<Persona, string> = {
  member: "focus-visible:outline-sky-400",
  pilot: "focus-visible:outline-amber-400",
  agent: "focus-visible:outline-emerald-400",
};

const tabs = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    ),
  },
  {
    href: "/spots",
    label: "SPOTs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
    ),
  },
  {
    href: "/vault",
    label: "Vault",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
  },
  {
    href: "/settings",
    label: "More",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function BottomTabs() {
  const pathname = usePathname();
  const [persona, setPersona] = useState<Persona>("member");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const p = d.persona;
        if (p === "member" || p === "pilot" || p === "agent") setPersona(p);
      })
      .catch(() => {});
  }, []);

  // Re-fetch when navigating to roles or dashboard
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

  const activeColor = personaActiveColor[persona];
  const focusOutline = personaFocusOutline[persona];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[var(--bottom-tabs-height)] items-center justify-around border-t border-stone-200/60 bg-white/90 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/90 md:hidden" role="navigation" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            aria-label={tab.label}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${focusOutline} ${
              active
                ? activeColor
                : "text-stone-400 dark:text-stone-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
