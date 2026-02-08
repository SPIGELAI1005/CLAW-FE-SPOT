"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Persona } from "@/lib/spotTypes";

interface ProfileResponse {
  persona: string;
}

export function RolesClient() {
  const router = useRouter();
  const [activePersona, setActivePersona] = useState<Persona>("member");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileResponse) => {
        if (data.persona === "member" || data.persona === "pilot" || data.persona === "agent") {
          setActivePersona(data.persona);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectPersona = useCallback(
    async (persona: Persona) => {
      setIsSaving(true);
      try {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona }),
        });
        setActivePersona(persona);
        const destination =
          persona === "member"
            ? "/roles/member"
            : persona === "pilot"
              ? "/roles/pilot"
              : "/roles/agent/new";
        router.push(destination);
      } finally {
        setIsSaving(false);
      }
    },
    [router],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Choose Your Role"
        subtitle="How do you want to use CLAW:FE SPOT? You can switch anytime."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Member */}
        <button
          onClick={() => selectPersona("member")}
          disabled={isSaving}
          className={`group relative overflow-hidden rounded-3xl border-2 p-8 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
            activePersona === "member"
              ? "border-sky-400 bg-sky-50 shadow-lg shadow-sky-500/10 dark:border-sky-500 dark:bg-sky-950/20"
              : "border-stone-200 bg-white hover:border-sky-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-sky-700"
          }`}
        >
          {activePersona === "member" && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
          )}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Member</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            Human participant. Join SPOTs, discuss ideas, review outcomes, and approve decisions. No AI agents needed.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Collaborate", "Review", "Approve"].map((tag) => (
              <span key={tag} className="rounded-full bg-sky-100/60 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                {tag}
              </span>
            ))}
          </div>
          {activePersona === "member" && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
              Active
            </div>
          )}
        </button>

        {/* Pilot */}
        <button
          onClick={() => selectPersona("pilot")}
          disabled={isSaving}
          className={`group relative overflow-hidden rounded-3xl border-2 p-8 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
            activePersona === "pilot"
              ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-500/10 dark:border-amber-500 dark:bg-amber-950/20"
              : "border-stone-200 bg-white hover:border-amber-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-amber-700"
          }`}
        >
          {activePersona === "pilot" && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          )}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Pilot</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            Human operator. Create and manage AI agents, deploy them to SPOTs, monitor performance and trust levels.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Deploy Agents", "Monitor", "Command"].map((tag) => (
              <span key={tag} className="rounded-full bg-amber-100/60 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {tag}
              </span>
            ))}
          </div>
          {activePersona === "pilot" && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
              Active
            </div>
          )}
        </button>

        {/* Agent */}
        <button
          onClick={() => selectPersona("agent")}
          disabled={isSaving}
          className={`group relative overflow-hidden rounded-3xl border-2 p-8 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
            activePersona === "agent"
              ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-500/10 dark:border-emerald-500 dark:bg-emerald-950/20"
              : "border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-700"
          }`}
        >
          {activePersona === "agent" && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          )}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Agent</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            AI entity. Create an agent with a specific role (Maker, Sentinel, or Arbiter) and deploy it into SPOTs.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Maker", "Sentinel", "Arbiter"].map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-100/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {tag}
              </span>
            ))}
          </div>
          {activePersona === "agent" ? (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
              Active
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Create Agent &rarr;
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
