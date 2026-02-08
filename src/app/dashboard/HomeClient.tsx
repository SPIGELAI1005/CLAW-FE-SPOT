"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { SpotCard } from "@/components/spot/SpotCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFetch, mapDbSpot } from "@/lib/useFetch";
import type { Spot, Persona } from "@/lib/spotTypes";

/* Professional coffee SVG icons — one per time of day */
function EspressoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam wisps */}
      <path d="M22 12c0-4 4-6 4-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M22 12c0-4 4-6 4-10;M22 14c-1-4 5-6 3-10;M22 12c0-4 4-6 4-10" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M30 10c0-3 3-5 3-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3">
        <animate attributeName="d" values="M30 10c0-3 3-5 3-8;M30 12c1-3 2-5 4-8;M30 10c0-3 3-5 3-8" dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Cup */}
      <rect x="14" y="22" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
      {/* Handle */}
      <path d="M42 28c4 0 7 2 7 6s-3 6-7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Coffee surface */}
      <ellipse cx="28" cy="28" rx="11" ry="2.5" fill="currentColor" fillOpacity="0.15" />
      {/* Saucer */}
      <ellipse cx="28" cy="50" rx="18" ry="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}

function LatteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam */}
      <path d="M26 14c-1-4 3-7 2-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
        <animate attributeName="d" values="M26 14c-1-4 3-7 2-11;M26 16c1-4 2-7 4-11;M26 14c-1-4 3-7 2-11" dur="3.2s" repeatCount="indefinite" />
      </path>
      <path d="M34 12c0-3 2-5 1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25">
        <animate attributeName="d" values="M34 12c0-3 2-5 1-9;M34 14c-1-3 3-5 2-9;M34 12c0-3 2-5 1-9" dur="2.8s" repeatCount="indefinite" />
      </path>
      {/* Tall glass */}
      <path d="M18 20h24l-3 32H21z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.06" />
      {/* Milk layer */}
      <path d="M20 34h20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
      {/* Latte art (leaf) */}
      <path d="M28 24c-3 2-4 4-2 6 2-2 5-3 6-1-1-3-2-5-4-5z" fill="currentColor" fillOpacity="0.2" />
      {/* Saucer */}
      <ellipse cx="30" cy="54" rx="16" ry="3.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}

function CappuccinoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam */}
      <path d="M24 16c0-4 3-6 3-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
        <animate attributeName="d" values="M24 16c0-4 3-6 3-10;M24 18c-1-4 4-6 2-10;M24 16c0-4 3-6 3-10" dur="2.6s" repeatCount="indefinite" />
      </path>
      <path d="M32 14c1-3 2-6 1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3">
        <animate attributeName="d" values="M32 14c1-3 2-6 1-9;M32 16c-1-3 3-6 2-9;M32 14c1-3 2-6 1-9" dur="3s" repeatCount="indefinite" />
      </path>
      {/* Wide cup */}
      <path d="M12 24h32l-4 24H16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      {/* Handle */}
      <path d="M44 28c4 0 6 3 6 6s-2 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Foam top — rounded */}
      <ellipse cx="28" cy="24" rx="16" ry="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      {/* Cocoa sprinkle dots */}
      <circle cx="24" cy="23" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="30" cy="22" r="0.6" fill="currentColor" opacity="0.25" />
      <circle cx="27" cy="25" r="0.7" fill="currentColor" opacity="0.2" />
      <circle cx="33" cy="24" r="0.5" fill="currentColor" opacity="0.25" />
      {/* Saucer */}
      <ellipse cx="28" cy="50" rx="18" ry="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}

interface ProfileResponse {
  persona?: string;
}

interface SpotsResponse {
  spots: Record<string, unknown>[];
}

interface InboxResponse {
  items: Record<string, unknown>[];
}

export function HomeClient() {
  const { text: greeting, coffee } = getGreeting();

  const CoffeeIcon =
    coffee === "espresso" ? EspressoIcon
    : coffee === "latte" ? LatteIcon
    : CappuccinoIcon;
  const { data: profileData } = useFetch<ProfileResponse>("/api/profile");
  const { data: spotsData, isLoading: isSpotsLoading } = useFetch<SpotsResponse>("/api/spots");
  const { data: inboxData, isLoading: isInboxLoading } = useFetch<InboxResponse>("/api/inbox");

  const persona: Persona = (profileData?.persona === "pilot" ? "pilot" : "member");

  const spots: Spot[] = (spotsData?.spots ?? []).map(mapDbSpot) as Spot[];
  const activeSpots = spots.filter((s) => s.status === "active" || s.status === "draft");
  const pendingItems = (inboxData?.items ?? []).filter(
    (item) => (item.status as string) === "pending",
  );
  const certifiedCount = spots.filter((s) => s.certificationStatus === "certified").length;
  const discussCount = spots.filter((s) => s.mode === "discuss").length;
  const executeCount = spots.filter((s) => s.mode === "execute").length;

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-100 to-white px-8 py-10 shadow-xl dark:from-stone-900 dark:to-stone-950">
        {/* Full animated background (tables, crabs, steam) — shifted right with gradient fade */}
        <div className="absolute inset-y-0 left-[30%] right-0 z-0 opacity-50 dark:opacity-70" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 30%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%)" }}>
          <AnimatedBackground
            config={{ intensity: "medium", nodeCount: 12, motionSpeed: 0.8, enableSteam: true }}
            canvasClassName="absolute inset-0 h-full w-full pointer-events-none"
            compact
          />
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 text-sm font-medium text-amber-600 dark:text-amber-400/80">
              Your daily brief
            </div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white" data-onboarding="dashboard-title">
              {greeting}
              <CoffeeIcon className="inline-block h-9 w-9 text-amber-600 dark:text-amber-400" />
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-300">
              {isSpotsLoading
                ? "Loading your workspace..."
                : `You have ${activeSpots.length} active SPOT${activeSpots.length !== 1 ? "s" : ""}, ${pendingItems.length} pending approval${pendingItems.length !== 1 ? "s" : ""}${certifiedCount > 0 ? `, and ${certifiedCount} certified` : ""}. Let's make progress.`}
            </p>
          </div>
        </div>
      </div>

      {/* Your Role */}
      <section>
        <Link href="/roles" className="group block">
          <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg ${
            persona === "pilot"
              ? "border-amber-200/60 bg-gradient-to-r from-amber-50 to-white dark:border-amber-800/30 dark:from-amber-950/20 dark:to-stone-900"
              : "border-sky-200/60 bg-gradient-to-r from-sky-50 to-white dark:border-sky-800/30 dark:from-sky-950/20 dark:to-stone-900"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  persona === "pilot"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400"
                }`}>
                  {persona === "pilot" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </span>
                <div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-50">
                    You are a {persona === "pilot" ? "Pilot" : "Member"}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {persona === "pilot"
                      ? "You create and deploy AI agents into SPOTs."
                      : "You collaborate directly in SPOTs as a human participant."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-medium text-stone-400 group-hover:text-stone-600 sm:inline dark:group-hover:text-stone-300">
                  Switch role
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Modes */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* DISCUSS */}
        <Link href="/spots?filter=discuss" className="group h-full">
          <div className="relative h-full overflow-hidden rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-white p-6 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-sky-500/5 dark:border-sky-800/30 dark:from-sky-950/20 dark:to-stone-900">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-200/20 blur-2xl dark:bg-sky-500/5" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>
                  </span>
                  <div>
                    <span className="inline-flex rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      DISCUSS
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  Chat &amp; voice only. No tool execution. Safe space for brainstorming and alignment.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {isSpotsLoading ? "—" : discussCount}
                </div>
                <div className="text-[10px] font-medium text-stone-400">active</div>
              </div>
            </div>
          </div>
        </Link>

        {/* EXECUTE */}
        <Link href="/spots?filter=execute" className="group h-full">
          <div className="relative h-full overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-6 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-amber-500/5 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-stone-900">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/20 blur-2xl dark:bg-amber-500/5" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5h3L12 7"/><path d="M10 14v-3"/><path d="M14 14v-3"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  </span>
                  <div>
                    <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      EXECUTE
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  Policy-gated tool execution. L1 real-time gating. L2 final certification.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {isSpotsLoading ? "—" : executeCount}
                </div>
                <div className="text-[10px] font-medium text-stone-400">active</div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Active SPOTs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </span>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Active SPOTs
            </h2>
          </div>
          <Link
            href="/spots"
            className="text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
          >
            View all →
          </Link>
        </div>
        {isSpotsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : activeSpots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeSpots.slice(0, 6).map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active SPOTs"
            description="Create your first SPOT to get started."
            actionLabel="New SPOT"
            actionHref="/spots/new"
          />
        )}
      </section>

      {/* Pending Approvals */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </span>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Pending Approvals
          </h2>
          {pendingItems.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {pendingItems.length}
            </span>
          )}
        </div>
        {isInboxLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : pendingItems.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingItems.slice(0, 4).map((item) => (
              <Card key={item.id as string} className="group relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400" />
                <div className="flex items-start justify-between pt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {(item.type as string)?.includes("l2") ? "L2" : "L1"}
                      </span>
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {item.title as string}
                      </span>
                    </div>
                    {item.description ? (
                      <div className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                        {String(item.description)}
                      </div>
                    ) : null}
                  </div>
                  <Link
                    href="/inbox"
                    className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md dark:bg-stone-100 dark:text-stone-900"
                  >
                    Review
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="py-2 text-center text-sm text-stone-400">
              All caught up — no pending approvals.
            </p>
          </Card>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z"/></svg>
          </span>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Recent SPOTs
          </h2>
        </div>
        <Card>
          {spots.length > 0 ? (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {spots.slice(0, 5).map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      spot.certificationStatus === "certified"
                        ? "bg-emerald-400"
                        : spot.mode === "execute"
                          ? "bg-amber-400"
                          : "bg-sky-400"
                    }`}
                  />
                  <div className="flex-1 text-sm text-stone-700 dark:text-stone-300">
                    {spot.title}
                  </div>
                  <div className="text-xs text-stone-400">
                    {spot.mode.toUpperCase()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-sm text-stone-400">
              No activity yet.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}

function getGreeting(): { text: string; coffee: "espresso" | "latte" | "cappuccino" } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", coffee: "espresso" };
  if (hour < 17) return { text: "Good afternoon", coffee: "latte" };
  return { text: "Good evening", coffee: "cappuccino" };
}
