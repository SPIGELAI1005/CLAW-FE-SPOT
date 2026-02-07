"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

type Persona = "member" | "pilot" | "agent";

const personaTheme: Record<Persona, { active: string; activeBg: string; activeText: string; iconColor: string; indicatorBg: string; indicatorText: string; focusOutline: string }> = {
  member: {
    active: "bg-sky-500/15",
    activeBg: "bg-sky-500/15",
    activeText: "text-sky-400",
    iconColor: "text-sky-400",
    indicatorBg: "bg-sky-500/20",
    indicatorText: "text-sky-400",
    focusOutline: "focus-visible:outline-sky-400",
  },
  pilot: {
    active: "bg-amber-500/15",
    activeBg: "bg-amber-500/15",
    activeText: "text-amber-400",
    iconColor: "text-amber-400",
    indicatorBg: "bg-amber-500/20",
    indicatorText: "text-amber-400",
    focusOutline: "focus-visible:outline-amber-400",
  },
  agent: {
    active: "bg-emerald-500/15",
    activeBg: "bg-emerald-500/15",
    activeText: "text-emerald-400",
    iconColor: "text-emerald-400",
    indicatorBg: "bg-emerald-500/20",
    indicatorText: "text-emerald-400",
    focusOutline: "focus-visible:outline-emerald-400",
  },
};

const personaLabel: Record<Persona, string> = {
  member: "Member",
  pilot: "Pilot",
  agent: "Agent",
};

const personaIcons: Record<Persona, React.ReactNode> = {
  member: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  pilot: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
  ),
  agent: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
  ),
};

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    ),
  },
  {
    href: "/spots",
    label: "SPOTs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
  },
  {
    href: "/agents",
    label: "Agents",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
    ),
  },
  {
    href: "/vault",
    label: "Audit Vault",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
  },
  {
    href: "/cli",
    label: "CLI",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Sidebar() {
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

  // Re-fetch persona when navigating back from /roles (user may have switched)
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

  const theme = personaTheme[persona];

  return (
    <aside className="hidden h-screen w-[var(--sidebar-width)] shrink-0 flex-col bg-[var(--sidebar-bg)] md:flex" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="flex h-16 items-center px-5">
        <Link href="/" aria-label="Go to home page">
          <Logo className="text-xl" />
        </Link>
      </div>

      {/* Persona indicator */}
      <div className="px-3 pb-2">
        <Link
          href="/roles"
          data-onboarding="persona-indicator"
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-[var(--sidebar-hover)] ${
            pathname.startsWith("/roles")
              ? `${theme.activeBg} ${theme.activeText}`
              : "text-[var(--sidebar-text-muted)]"
          }`}
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${theme.indicatorBg} ${theme.indicatorText}`}>
            {personaIcons[persona]}
          </span>
          <span className="flex-1">{personaLabel[persona]}</span>
          <span className="text-[10px] text-[var(--sidebar-text-muted)]">Switch</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-text-muted)]">
          Navigation
        </div>
        <div className="grid gap-0.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.focusOutline} ${
                  active
                    ? `${theme.activeBg} ${theme.activeText}`
                    : "text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
                }`}
              >
                <span className={active ? theme.iconColor : ""}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacer */}
      <div className="px-4 pb-3" />
    </aside>
  );
}
