"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

type Persona = "member" | "pilot" | "agent";

const personaTheme: Record<Persona, { active: string; activeBg: string; activeText: string; iconColor: string; indicatorBg: string; indicatorText: string; focusOutline: string }> = {
  member: {
    active: "bg-sky-500/15",
    activeBg: "bg-sky-100 dark:bg-sky-500/15",
    activeText: "text-sky-700 dark:text-sky-400",
    iconColor: "text-sky-700 dark:text-sky-400",
    indicatorBg: "bg-sky-100 dark:bg-sky-500/20",
    indicatorText: "text-sky-700 dark:text-sky-400",
    focusOutline: "focus-visible:outline-sky-400",
  },
  pilot: {
    active: "bg-amber-500/15",
    activeBg: "bg-amber-100 dark:bg-amber-500/15",
    activeText: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-700 dark:text-amber-400",
    indicatorBg: "bg-amber-100 dark:bg-amber-500/20",
    indicatorText: "text-amber-700 dark:text-amber-400",
    focusOutline: "focus-visible:outline-amber-400",
  },
  agent: {
    active: "bg-emerald-500/15",
    activeBg: "bg-emerald-100 dark:bg-emerald-500/15",
    activeText: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-700 dark:text-emerald-400",
    indicatorBg: "bg-emerald-100 dark:bg-emerald-500/20",
    indicatorText: "text-emerald-700 dark:text-emerald-400",
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
  {
    href: "/faq",
    label: "Help & FAQ",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
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
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("sidebar-collapsed", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "1") setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

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
    <aside
      className={`relative z-[2] hidden h-screen shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-[width] duration-300 ease-in-out md:flex ${
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className={`flex items-center pb-3 pt-4 ${collapsed ? "justify-center px-2" : "px-5"}`}>
        <Link href="/" aria-label="Go to home page">
          {collapsed ? (
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
              {/* Left claw */}
              <path d="M6 8 C3 5, 1 8, 4 11 L8 13" stroke="url(#sidebar-crab-g)" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 8 C3 11, 1 8, 4 5 L8 7" stroke="url(#sidebar-crab-g)" strokeWidth="2" strokeLinecap="round" />
              {/* Right claw */}
              <path d="M26 8 C29 5, 31 8, 28 11 L24 13" stroke="url(#sidebar-crab-g)" strokeWidth="2" strokeLinecap="round" />
              <path d="M26 8 C29 11, 31 8, 28 5 L24 7" stroke="url(#sidebar-crab-g)" strokeWidth="2" strokeLinecap="round" />
              {/* Body shell */}
              <ellipse cx="16" cy="17" rx="8" ry="6" stroke="url(#sidebar-crab-g)" strokeWidth="2" fill="none" />
              {/* Eyes */}
              <circle cx="12" cy="12" r="1.5" fill="url(#sidebar-crab-g)" />
              <circle cx="20" cy="12" r="1.5" fill="url(#sidebar-crab-g)" />
              {/* Legs */}
              <path d="M9 19 L4 22" stroke="url(#sidebar-crab-g)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 21 L4 25" stroke="url(#sidebar-crab-g)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 22 L7 27" stroke="url(#sidebar-crab-g)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M23 19 L28 22" stroke="url(#sidebar-crab-g)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M24 21 L28 25" stroke="url(#sidebar-crab-g)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M22 22 L25 27" stroke="url(#sidebar-crab-g)" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="sidebar-crab-g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <Logo className="text-xl" showSubtitle />
          )}
        </Link>
      </div>

      {/* Persona indicator */}
      <div className={`pb-2 ${collapsed ? "px-1.5" : "px-3"}`}>
        <Link
          href="/roles"
          data-onboarding="persona-indicator"
          title={collapsed ? `${personaLabel[persona]} — Switch role` : undefined}
          className={`flex items-center rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-[var(--sidebar-hover)] ${
            collapsed ? "justify-center" : "gap-2.5"
          } ${
            pathname.startsWith("/roles")
              ? `${theme.activeBg} ${theme.activeText}`
              : "text-[var(--sidebar-text-muted)]"
          }`}
        >
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${theme.indicatorBg} ${theme.indicatorText}`}>
            {personaIcons[persona]}
          </span>
          {!collapsed && <span className="flex-1">{personaLabel[persona]}</span>}
          {!collapsed && <span className="text-[10px] text-[var(--sidebar-text-muted)]">Switch</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <div className={`pb-2 ${collapsed ? "px-1.5" : "px-3"}`}>
        <button
          onClick={toggleCollapse}
          className={`flex w-full items-center rounded-xl py-2 text-xs font-medium text-[var(--sidebar-text-muted)] transition-all hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="m14 9-3 3 3 3" />
          </svg>
          {!collapsed && "Collapse"}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-2 ${collapsed ? "px-1.5" : "px-3"}`}>
        {!collapsed && (
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-text-muted)]">
            Navigation
          </div>
        )}
        <div className="grid gap-0.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.focusOutline} ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${
                  active
                    ? `${theme.activeBg} ${theme.activeText}`
                    : "text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
                }`}
              >
                <span className={`shrink-0 ${active ? theme.iconColor : ""}`}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>
      </nav>

    </aside>
  );
}
