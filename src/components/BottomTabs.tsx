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

const personaPillBg: Record<Persona, string> = {
  member: "bg-gradient-to-r from-sky-400 to-blue-500",
  pilot: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
  agent: "bg-gradient-to-r from-emerald-400 to-green-500",
};

const personaGlowBg: Record<Persona, string> = {
  member: "bg-sky-100/70 dark:bg-sky-900/30",
  pilot: "bg-amber-100/70 dark:bg-amber-900/30",
  agent: "bg-emerald-100/70 dark:bg-emerald-900/30",
};

/* ── Icon Components ───────────────────────────────────────────────── */
/* Each icon has an outline (inactive) and a filled (active) variant.  */
/* Active variants use a translucent fill + bolder strokes.            */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* House body */}
      <path
        d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill={active ? "currentColor" : "none"}
        opacity={active ? 0.15 : 1}
        stroke="currentColor"
        strokeWidth={active ? "1.75" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door */}
      <path
        d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
        fill={active ? "currentColor" : "none"}
        opacity={active ? 0.25 : 1}
        stroke="currentColor"
        strokeWidth={active ? "1.75" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        <>
          {/* Coffee steam wisps on the chimney area — brand accent */}
          <path d="M10.5 8c0-.7.6-.7.6-1.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
          <path d="M13 7.5c0-.6.5-.6.5-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/>
        </>
      )}
    </svg>
  );
}

function SpotsIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Table board */}
      <rect
        width="18" height="18" x="3" y="3" rx="3"
        fill={active ? "currentColor" : "none"}
        opacity={active ? 0.12 : 1}
        stroke="currentColor"
        strokeWidth={active ? "1.75" : "1.5"}
      />
      {/* Horizontal divider */}
      <path d="M3 9h18" stroke="currentColor" strokeWidth={active ? "1.75" : "1.5"} strokeLinecap="round"/>
      {/* Vertical divider */}
      <path d="M9 21V9" stroke="currentColor" strokeWidth={active ? "1.75" : "1.5"} strokeLinecap="round"/>
      {active && (
        <>
          {/* Coffee ring / spot accent — ties to "SPOT" brand */}
          <circle cx="15.5" cy="15.5" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3" strokeDasharray="2 2"/>
          <circle cx="15.5" cy="15.5" r="1" fill="currentColor" opacity="0.25"/>
        </>
      )}
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Tray body */}
      <path
        d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        fill={active ? "currentColor" : "none"}
        opacity={active ? 0.12 : 1}
        stroke="currentColor"
        strokeWidth={active ? "1.75" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner shelf */}
      <path
        d="M22 12h-6l-2 3h-4l-2-3H2"
        stroke="currentColor"
        strokeWidth={active ? "1.75" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        /* Notification dot accent */
        <circle cx="17" cy="7" r="2" fill="currentColor" opacity="0.35"/>
      )}
    </svg>
  );
}

function VaultIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Shield */}
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
        fill={active ? "currentColor" : "none"}
        opacity={active ? 0.12 : 1}
        stroke="currentColor"
        strokeWidth={active ? "1.75" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth={active ? "2" : "1.75"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        /* Certified glow ring */
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.2"/>
      )}
    </svg>
  );
}

function MoreIcon({ active }: { active: boolean }) {
  /* Brand crab icon — ties into CLAW identity */
  const sw = active ? "1.5" : "1.25";
  const legOpacity = active ? 0.8 : 0.55;
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      {/* Body */}
      <ellipse
        cx="12" cy="13.5" rx="5.5" ry="4"
        fill={active ? "currentColor" : "none"}
        opacity={active ? 0.12 : 1}
        stroke="currentColor"
        strokeWidth={sw}
      />
      {/* Left claw */}
      <path d="M4.5 7.5C3 5.5 2 8 4 9.5L6.5 11" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      <path d="M4.5 7.5C3 9.5 2 7 4 5.5L6.5 7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      {/* Right claw */}
      <path d="M19.5 7.5C21 5.5 22 8 20 9.5L17.5 11" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      <path d="M19.5 7.5C21 9.5 22 7 20 5.5L17.5 7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      {/* Eyes */}
      <circle cx="10" cy="10.5" r={active ? "1.2" : "1"} fill="currentColor" opacity={active ? 1 : 0.65}/>
      <circle cx="14" cy="10.5" r={active ? "1.2" : "1"} fill="currentColor" opacity={active ? 1 : 0.65}/>
      {/* Legs — 2 per side */}
      <path d="M7.5 15L4.5 17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity={legOpacity}/>
      <path d="M7 16.5L4.5 19.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity={legOpacity}/>
      <path d="M16.5 15L19.5 17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity={legOpacity}/>
      <path d="M17 16.5L19.5 19.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity={legOpacity}/>
    </svg>
  );
}

/* ── Tab config ────────────────────────────────────────────────────── */

const tabs = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/spots", label: "SPOTs", Icon: SpotsIcon },
  { href: "/inbox", label: "Inbox", Icon: InboxIcon },
  { href: "/vault", label: "Vault", Icon: VaultIcon },
  { href: "/settings", label: "More", Icon: MoreIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/settings") {
    return pathname.startsWith("/settings") || pathname.startsWith("/faq") || pathname.startsWith("/cli") || pathname.startsWith("/roles") || pathname.startsWith("/agents");
  }
  return pathname.startsWith(href);
}

/* ── Component ─────────────────────────────────────────────────────── */

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
  const pillBg = personaPillBg[persona];
  const glowBg = personaGlowBg[persona];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Frosted glass bar */}
      <div className="flex h-[var(--bottom-tabs-height)] items-end justify-around border-t border-stone-200/40 bg-white/70 px-1 pb-2 pt-1 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-stone-700/30 dark:bg-stone-950/70 dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
              className={`relative flex w-16 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${focusOutline} ${
                active
                  ? activeColor
                  : "text-stone-400 active:scale-95 dark:text-stone-500"
              }`}
            >
              {/* Active glow backdrop */}
              {active && (
                <span className={`absolute inset-x-1 -top-0.5 bottom-1 -z-10 rounded-2xl ${glowBg} transition-all duration-300`} />
              )}

              {/* Icon */}
              <span className={`flex h-6 items-center justify-center transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                <tab.Icon active={active} />
              </span>

              {/* Label */}
              <span className={`text-[10px] leading-tight transition-all duration-200 ${
                active ? "font-bold" : "font-medium"
              }`}>
                {tab.label}
              </span>

              {/* Active indicator pill */}
              {active && (
                <span className={`absolute -bottom-0.5 h-[3px] w-5 rounded-full ${pillBg} shadow-sm transition-all duration-300`} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom safe area fill for notched devices */}
      <div className="bg-white/70 backdrop-blur-2xl dark:bg-stone-950/70" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
    </nav>
  );
}
