"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { BottomTabs } from "@/components/BottomTabs";
import { TopBar } from "@/components/TopBar";
import { CommandPaletteWithTrigger } from "@/components/cli/CommandPalette";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";

const BARE_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = pathname === "/" || BARE_ROUTES.some((r) => pathname.startsWith(r));


  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--app-bg)] text-stone-900 dark:text-stone-50">
      {/* Subtle animated canvas behind the app */}
      <AnimatedBackground minimal config={{ intensity: "low", nodeCount: 14, motionSpeed: 0.7 }} />
      {/* Skip to main content (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main area with floating top bar — z-[1] above canvas */}
      <div className="relative z-[1] flex flex-1 flex-col overflow-hidden">
        {/* Floating header */}
        <TopBar />

        {/* Main content with top offset for the floating header */}
        <main id="main-content" className="flex-1 overflow-y-auto pb-[var(--bottom-tabs-height)] pt-[var(--topbar-height)] md:pb-0">
          <div className="mx-auto max-w-6xl px-4 pt-[5vh] pb-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <BottomTabs />

      {/* Global command palette (Ctrl+K) */}
      <CommandPaletteWithTrigger />
    </div>
  );
}
