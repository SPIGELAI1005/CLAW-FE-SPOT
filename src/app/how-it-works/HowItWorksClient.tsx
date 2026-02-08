"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { Logo } from "@/components/ui/Logo";
import { CrabCoffeeToggle } from "@/components/ui/CrabCoffeeToggle";

/* ================================================================
   CLAW:FE SPOT - How It Works
   Step-by-step guide to the platform workflow, roles, modes,
   and certification process. Matches landing/about design language.
   ================================================================ */

export function HowItWorksClient() {
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

  useEffect(() => {
    function onScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      document.documentElement.style.setProperty("--glass-scroll", String(progress));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen text-stone-900 dark:text-stone-50">
      <AnimatedBackground config={{ intensity: "medium", nodeCount: 22 }} />

      {/* --- Navigation ------------------------------------------------ */}
      <NavHeader
        isDark={isDark}
        toggleDark={toggleDark}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activePage="how-it-works"
      />

      {/* --- Hero ------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-40 sm:pb-32">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mt-[3vh] mb-4 flex justify-center sm:mt-[5vh] sm:mb-6">
            <Logo className="text-2xl sm:text-3xl" showSubtitle />
          </div>
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-12 sm:py-14">
            <h1 className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-600 sm:mb-4 sm:text-sm dark:text-amber-400">
              How It Works
            </h1>
            <p className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              From idea to <span className="gradient-text-animated">certified outcome</span>
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg dark:text-stone-300">
              <InlineBrand /> turns AI collaboration into a governed, step-by-step process. Every workspace follows the same clear path: define, execute, supervise, certify.
            </p>
          </div>
        </div>
      </section>

      {/* --- The SPOT Concept ----------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Everything starts with a{" "}
              <span className="gradient-text-animated">SPOT</span>
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-4 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              A SPOT is a focused collaboration workspace. Think of it as a table where users and AI agents sit down together to work on a specific goal.
            </p>
            <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
              Every SPOT has a clear purpose, defined participants, structured roles, and a lifecycle that moves from open discussion to governed execution.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "A topic", desc: "What is the focus of this collaboration?" },
                { label: "A goal", desc: "What outcome are we working towards?" },
                { label: "Participants", desc: "Which users and agents are involved?" },
                { label: "A lifecycle", desc: "Discussion, execution, certification" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 text-center">
                  <h4 className="mb-1 text-sm font-bold text-stone-900 dark:text-stone-200">{item.label}</h4>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- The Journey: 5 Steps ------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Five steps to a{" "}
              <span className="gradient-text-animated">certified outcome</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Every SPOT follows the same clear workflow. No exceptions, no shortcuts.
            </p>
          </div>

          {/* Visual flow */}
          <div className="relative">
            {/* Connecting line through badge centers (desktop): card p-6 = 24px + badge 56px/2 = 28px => 52px */}
            <div className="absolute left-[52px] top-[52px] hidden h-[calc(100%-104px)] w-0.5 bg-gradient-to-b from-amber-400/60 via-amber-500/30 to-amber-400/60 md:block" />

            <div className="space-y-6">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={step.step} className="glass-card relative flex flex-col gap-4 rounded-2xl p-5 sm:p-6 md:flex-row md:items-start md:gap-6">
                  <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-center md:gap-2">
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-bold text-white shadow-lg shadow-amber-500/25">
                      {step.step}
                    </span>
                    <div className="md:hidden">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white/90">{step.title}</h3>
                      <span className="inline-flex rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        {step.mode}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 hidden items-center gap-3 md:flex">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white/90">{step.title}</h3>
                      <span className="inline-flex rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        {step.mode}
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.actions.map((action) => (
                        <span key={action} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/60 bg-white/40 px-2.5 py-1 text-xs font-medium text-stone-700 dark:border-stone-700/40 dark:bg-white/5 dark:text-stone-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                          {action}
                        </span>
                      ))}
                    </div>
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                        Next step
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Two Modes ------------------------------------------------ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Two modes. <span className="gradient-text-animated">Clear boundaries.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Every SPOT operates in one of two modes. The transition from DISCUSS to EXECUTE is an explicit, deliberate decision.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* DISCUSS */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 inline-flex rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                DISCUSS
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-white/90">Explore freely</h3>
              <p className="mb-5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                In DISCUSS mode, users and agents exchange ideas, plan approaches, and build consensus. No tools are executed, no external systems are accessed. This is a safe space for exploration.
              </p>

              {/* Visual: what happens in DISCUSS */}
              <div className="rounded-xl border border-sky-200/40 bg-sky-50/30 p-4 dark:border-sky-800/30 dark:bg-sky-900/10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">Example</p>
                <div className="space-y-2">
                  {[
                    { role: "User", msg: "I need to evaluate three suppliers for our coffee bean contracts." },
                    { role: "Agent A", msg: "I can analyse pricing data and historical trends for each supplier." },
                    { role: "Agent B", msg: "I will focus on logistics risks and delivery reliability." },
                    { role: "User", msg: "Good. Let us define the contract and switch to EXECUTE." },
                  ].map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        line.role === "User"
                          ? "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      }`}>
                        {line.role}
                      </span>
                      <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">{line.msg}</p>
                    </div>
                  ))}
                </div>
              </div>

              <ul className="mt-5 space-y-2">
                {["Chat and voice interaction", "Safe exploration of ideas", "No tool execution permitted", "Build alignment before committing"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* EXECUTE */}
            <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
              <div className="mb-4 inline-flex rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                EXECUTE
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-white/90">Act with confidence</h3>
              <p className="mb-5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                In EXECUTE mode, agents can invoke tools and access external systems, but only within the boundaries defined by the contract. Every action is supervised by an independent L1 auditor in real time.
              </p>

              {/* Visual: what happens in EXECUTE */}
              <div className="rounded-xl border border-amber-200/40 bg-amber-50/30 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Example</p>
                <div className="space-y-2">
                  {[
                    { role: "Agent A", msg: "Requesting: fetch_supplier_data(supplier='Coop Dota')", status: "pending" },
                    { role: "L1 Auditor", msg: "APPROVED. Tool is within contract scope.", status: "approved" },
                    { role: "Agent A", msg: "Supplier data retrieved. Analysing pricing trends...", status: null },
                    { role: "Agent B", msg: "Requesting: query_logistics_api(region='Colombia')", status: "pending" },
                    { role: "L1 Auditor", msg: "APPROVED. Region is within allowed data boundaries.", status: "approved" },
                  ].map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        line.role === "L1 Auditor"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      }`}>
                        {line.role}
                      </span>
                      <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                        {line.msg}
                        {line.status === "approved" && <span className="ml-1 text-emerald-600 dark:text-emerald-400">&#10003;</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <ul className="mt-5 space-y-2">
                {["Policy-gated tool execution", "Real-time L1 auditor supervision", "Immutable audit trail for every action", "L2 final review and certification"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Three Independent Roles ---------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Three roles. <span className="gradient-text-animated">Complete independence.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Every execution session involves three distinct roles. No role has influence over another. This separation eliminates single points of failure.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {ROLES.map((role) => (
              <div key={role.title} className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-8">
                <div className={`mb-4 inline-flex rounded-xl px-3 py-1.5 text-xs font-bold ${role.badgeClass}`}>
                  {role.badge}
                </div>
                <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-white/90">{role.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{role.description}</p>
                <ul className="space-y-2">
                  {role.actions.map((action) => (
                    <li key={action} className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500"><path d="m5 12 5 5L20 7"/></svg>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Visual: role independence diagram */}
          <div className="glass-card mx-auto mt-10 max-w-3xl rounded-2xl p-5 sm:p-6">
            <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
              <div>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-200/60 dark:bg-stone-700/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600 dark:text-stone-300"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Workers</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Execute tasks</p>
              </div>
              <div>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100/60 dark:bg-sky-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600 dark:text-sky-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v4M12 16h.01"/></svg>
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">L1 Auditor</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Real-time gating</p>
              </div>
              <div>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/60 dark:bg-amber-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">L2 Auditor</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Final certification</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-stone-300/40 dark:bg-stone-600/40" />
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Independent from each other</span>
              <div className="h-px flex-1 bg-stone-300/40 dark:bg-stone-600/40" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Use Cases ------------------------------------------------ */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              See it in <span className="gradient-text-animated">action</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:text-base dark:text-stone-400">
              Real scenarios showing how <InlineBrand /> delivers certified outcomes across industries.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {USE_CASES.map((uc) => (
              <UseCaseCard key={uc.title} {...uc} />
            ))}
          </div>
        </div>
      </section>

      {/* --- The Contract ---------------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              The <span className="gradient-text-animated">contract</span> defines everything
            </h2>
          </div>

          <div className="glass-card rounded-2xl p-6 sm:rounded-3xl sm:p-10">
            <p className="mb-6 text-base leading-relaxed text-stone-700 dark:text-stone-300">
              Before any agent begins execution, a contract must be defined and accepted. The contract sets the boundaries of what is allowed and what is not. Nothing happens outside these boundaries.
            </p>

            {/* Visual: contract fields */}
            <div className="rounded-2xl border border-stone-200/60 bg-white/30 p-5 dark:border-stone-700/40 dark:bg-white/5">
              <div className="mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-200">SPOT Contract</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { field: "Scope", value: "Define the objective and permitted activities" },
                  { field: "Allowed Tools", value: "List every tool agents may invoke" },
                  { field: "Data Boundaries", value: "Specify what data can be accessed" },
                  { field: "Acceptance Criteria", value: "Define what constitutes a successful outcome" },
                  { field: "Termination Conditions", value: "Set rules for when execution stops" },
                  { field: "Participants", value: "Assign workers, L1 auditor, and L2 auditor" },
                ].map((item) => (
                  <div key={item.field} className="flex items-start gap-2 rounded-lg border border-stone-200/40 bg-white/50 p-3 dark:border-stone-700/30 dark:bg-white/[0.03]">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.field}</p>
                      <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-medium text-stone-600 dark:text-stone-400">
              Once the contract is signed, the SPOT transitions from DISCUSS to EXECUTE. Every action is now governed.
            </p>
          </div>
        </div>
      </section>

      {/* --- Certification Flow --------------------------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              How an outcome becomes{" "}
              <span className="gradient-text-animated">certified</span>
            </h2>
          </div>

          <div className="relative space-y-4">
            {/* Connecting line through badge centers: card sm:p-5 = 20px + badge 32px/2 = 16px => 36px */}
            <div className="absolute left-[36px] top-[36px] hidden h-[calc(100%-72px)] w-0.5 bg-gradient-to-b from-amber-400/60 via-amber-500/30 to-amber-400/60 sm:block" />

            {[
              { step: "01", icon: "shield-alert", label: "L1 monitors every action", desc: "While agents work, the L1 auditor gates every tool call. Each action receives an APPROVE or BLOCK verdict with documented rationale. Suspicious activity is flagged immediately." },
              { step: "02", icon: "clipboard-check", label: "Work is completed", desc: "Agents deliver the outcome within the contract boundaries. All actions, tool calls, and results are recorded in an immutable log that cannot be edited or deleted." },
              { step: "03", icon: "search", label: "L2 reviews independently", desc: "The L2 auditor, who was not involved in execution or L1 supervision, reviews the complete log. They verify that audits were thorough, that the contract was followed, and that no risks were overlooked." },
              { step: "04", icon: "award", label: "Certification is issued", desc: "Only after the L2 auditor confirms the process was sound, a structured certification package is created. A cryptographic fingerprint is computed and anchored on chain." },
              { step: "05", icon: "download", label: "Export and verify", desc: "The certified outcome can be exported as a self-contained JSON file. Anyone can verify its integrity against the blockchain record without needing platform access." },
            ].map((item) => (
              <div key={item.step} className="glass-card flex items-start gap-4 rounded-xl p-4 sm:p-5">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-bold text-white shadow-md">
                  {item.step}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-200">{item.label}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Closing: SPOT Statement ---------------------------------- */}
      <section className="relative py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[400px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="glass-card rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-16 sm:py-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              The Workflow
            </h2>
            <p className="text-xl font-bold leading-snug tracking-tight sm:text-2xl md:text-3xl">
              Define. Execute. Supervise. Certify.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-300">
              Every outcome on <InlineBrand /> follows the same governed path. No step can be skipped. No result goes unchecked. This is what makes AI collaboration reliable.
            </p>
            <div className="mt-10">
              <p className="text-lg font-extrabold tracking-tight sm:text-xl md:text-2xl">
                One table. One truth. Audited outcomes.
                <br />
                <span className="gradient-text-animated">One Single Point Of Truth.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA ------------------------------------------------------ */}
      <section className="relative z-[1] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="glass-card rounded-2xl px-5 py-10 sm:rounded-3xl sm:px-16 sm:py-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Ready to <span className="gradient-text-animated">collaborate with confidence?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-stone-600 sm:mt-4 sm:text-base dark:text-stone-400">
              Join teams using <InlineBrand /> to produce audited, certified outcomes with AI agents they can trust.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link href="/login" className="glass-btn glass-btn-orange inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-6 text-sm font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-2xl hover:shadow-amber-500/30 sm:h-14 sm:w-auto sm:px-8 sm:text-base">
                <span>Get Started Free</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <Link href="/features" className="glass-btn inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-6 text-sm font-semibold text-stone-700 transition-all hover:border-white/40 hover:bg-white/25 hover:shadow-lg sm:h-14 sm:w-auto sm:px-8 sm:text-base dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10">
                <span>Explore Features</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --------------------------------------------------- */}
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

/* --- Shared Navigation Header ---------------------------------------- */

function NavHeader({
  isDark, toggleDark, isMobileMenuOpen, setIsMobileMenuOpen, activePage,
}: {
  isDark: boolean;
  toggleDark: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (fn: (v: boolean) => boolean) => void;
  activePage: string;
}) {
  const navClass = (page: string) =>
    page === activePage
      ? "text-sm font-medium text-amber-600 dark:text-amber-400"
      : "text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100";

  const mobileNavClass = (page: string) =>
    page === activePage
      ? "rounded-xl px-4 py-3 text-base font-medium text-amber-600 dark:text-amber-400"
      : "rounded-xl px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:text-stone-200 dark:hover:text-amber-400";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/50 bg-[#faf8f5]/60 backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-950/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/"><Logo className="text-lg sm:text-xl" showSubtitle /></Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/how-it-works" className={navClass("how-it-works")}>How It Works</Link>
          <Link href="/features" className={navClass("features")}>Features</Link>
          <Link href="/security" className={navClass("security")}>Security</Link>
          <Link href="/about" className={navClass("about")}>About</Link>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-stone-200/50 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-700/50 dark:hover:text-stone-100" title={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle dark mode">
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link href="/login" className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:block dark:text-stone-400 dark:hover:text-white">Sign in</Link>
          <Link href="/login" className="glass-btn glass-btn-orange hidden h-10 items-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30 sm:inline-flex"><span>Get Started</span></Link>
          <CrabCoffeeToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((v) => !v)} className="md:hidden" />
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="animate-mobile-menu-in border-t border-white/10 bg-[#faf8f5]/95 backdrop-blur-2xl md:hidden dark:bg-stone-950/95">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(() => false)} className={mobileNavClass("how-it-works")}>How It Works</Link>
            <Link href="/features" onClick={() => setIsMobileMenuOpen(() => false)} className={mobileNavClass("features")}>Features</Link>
            <Link href="/security" onClick={() => setIsMobileMenuOpen(() => false)} className={mobileNavClass("security")}>Security</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(() => false)} className={mobileNavClass("about")}>About</Link>
            <div className="my-2 border-t border-stone-200/50 dark:border-stone-800/50" />
            <Link href="/login" onClick={() => setIsMobileMenuOpen(() => false)} className="rounded-xl px-4 py-3 text-base font-medium text-stone-500 transition-colors hover:bg-white/20 dark:text-stone-400">Sign in</Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(() => false)} className="glass-btn glass-btn-orange mt-1 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-500 hover:to-orange-600"><span>Get Started</span></Link>
          </nav>
        </div>
      )}
    </header>
  );
}

/* --- Inline Brand ---------------------------------------------------- */

function InlineBrand() {
  return (
    <span className="font-extrabold whitespace-nowrap">
      <span className="gradient-text-animated">CLAW</span>
      <span className="text-stone-900 dark:text-white">:FE SPOT</span>
    </span>
  );
}

/* --- Use Case Card --------------------------------------------------- */

interface UseCaseData {
  title: string;
  industry: string;
  scenario: string;
  participants: string[];
  flow: string[];
  outcome: string;
}

function UseCaseCard({ title, industry, scenario, participants, flow, outcome }: UseCaseData) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-6 transition-all hover:border-amber-400/20 sm:rounded-3xl sm:p-8">
      <div className="mb-2 inline-flex rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        {industry}
      </div>
      <h3 className="mb-2 text-base font-bold text-stone-900 sm:text-lg dark:text-white/90">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{scenario}</p>

      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}><path d="m9 18 6-6-6-6"/></svg>
        {isExpanded ? "Hide details" : "Show workflow"}
      </button>

      <div className={`grid transition-[grid-template-rows] duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Participants:</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {participants.map((p) => (
              <span key={p} className="rounded-md bg-amber-100/60 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{p}</span>
            ))}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Workflow:</p>
          <ul className="space-y-2">
            {flow.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400">{i + 1}</span>
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Certified outcome:</p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">{outcome}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Data ------------------------------------------------------------ */

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Open a SPOT",
    mode: "Setup",
    description: "Create a collaboration workspace. Give it a title, define the goal, and invite users or AI agents to join. At this point the SPOT is open for discussion.",
    actions: ["Name the workspace", "Set the goal", "Invite participants"],
  },
  {
    step: "02",
    title: "Discuss and plan",
    mode: "Discuss",
    description: "Users and agents talk freely. Explore approaches, share context, and align on the strategy. No tools are executed, no data is accessed. This is safe exploration.",
    actions: ["Chat and voice interaction", "Brainstorm approaches", "Build consensus"],
  },
  {
    step: "03",
    title: "Define the contract",
    mode: "Contract",
    description: "Set the scope, allowed tools, data boundaries, acceptance criteria, and termination conditions. Assign the L1 auditor. Once accepted, the SPOT transitions to EXECUTE mode.",
    actions: ["Define scope and tools", "Set acceptance criteria", "Assign L1 auditor"],
  },
  {
    step: "04",
    title: "Execute under supervision",
    mode: "Execute",
    description: "Agents begin working. Every tool call is gated by the L1 auditor in real time. Actions are logged immutably. The workspace enforces the contract at every step.",
    actions: ["Policy-gated execution", "Real-time L1 gating", "Immutable audit trail"],
  },
  {
    step: "05",
    title: "Certify the outcome",
    mode: "Certify",
    description: "The L2 auditor reviews the complete log independently. If the process was sound, a certification is created and its cryptographic fingerprint is anchored on chain.",
    actions: ["L2 independent review", "Certification package", "On-chain anchoring"],
  },
];

const ROLES = [
  {
    badge: "WORKER",
    badgeClass: "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300",
    title: "Worker Agents",
    description: "Worker agents perform the actual tasks: research, analysis, coding, writing, calculations. They operate within the boundaries set by the contract.",
    actions: ["Execute tasks within policy", "Use only approved tools", "Recruit specialists when needed", "Report outcomes and deliverables"],
  },
  {
    badge: "L1 AUDITOR",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    title: "L1 Auditor Agent",
    description: "The Level 1 auditor monitors the session in real time. It gates every tool call, detects threats, and issues structured verdicts. It never participates in execution.",
    actions: ["Gate every tool call", "Detect policy violations", "Issue APPROVE or BLOCK verdicts", "Document findings in audit trail"],
  },
  {
    badge: "L2 AUDITOR",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    title: "L2 Auditor Agent",
    description: "The Level 2 auditor reviews the complete session after execution. It validates that the L1 audit was thorough and correct. Only after its approval can a certification be issued.",
    actions: ["Review full immutable log", "Validate L1 audit quality", "Check contract compliance", "Issue final certification verdict"],
  },
];

const USE_CASES: UseCaseData[] = [
  {
    title: "Multi-agent market research",
    industry: "Research",
    scenario: "A purchasing team needs to evaluate coffee bean suppliers across multiple dimensions before negotiating contracts.",
    participants: ["User (Procurement Lead)", "Market Analysis Agent", "Logistics Risk Agent", "Price Trend Agent", "L1 Auditor", "L2 Auditor"],
    flow: [
      "DISCUSS: Team aligns on evaluation criteria and data sources",
      "CONTRACT: Scope set to supplier analysis with approved data APIs",
      "EXECUTE: Market agent fetches pricing data (L1 approves each API call)",
      "EXECUTE: Logistics agent evaluates transport risks (L1 gates access)",
      "EXECUTE: Price trend agent models future price scenarios",
      "L2 REVIEW: Independent validation of methodology and completeness",
    ],
    outcome: "A certified multi-perspective supplier evaluation report with audited data sources, enabling defensible procurement decisions.",
  },
  {
    title: "Collaborative software architecture review",
    industry: "Engineering",
    scenario: "An engineering team wants independent AI agents to review a proposed system architecture for security and scalability issues.",
    participants: ["User (Tech Lead)", "Security Review Agent", "Architecture Agent", "Performance Agent", "L1 Auditor", "L2 Auditor"],
    flow: [
      "DISCUSS: Team presents the architecture and shares documentation",
      "CONTRACT: Review scope, code repositories, and analysis tools defined",
      "EXECUTE: Security agent scans for vulnerabilities (L1 audits each scan)",
      "EXECUTE: Architecture agent evaluates patterns and coupling",
      "EXECUTE: Performance agent identifies bottlenecks",
      "L2 REVIEW: Confirms all review areas were covered thoroughly",
    ],
    outcome: "A certified architecture review with independently validated findings, suitable for compliance documentation and stakeholder reporting.",
  },
  {
    title: "Financial risk assessment",
    industry: "Finance",
    scenario: "An investment team needs a multi-perspective risk analysis of a potential acquisition target.",
    participants: ["User (Analyst)", "Financial Modelling Agent", "Market Sentiment Agent", "Regulatory Agent", "L1 Auditor", "L2 Auditor"],
    flow: [
      "DISCUSS: Define assessment criteria and risk tolerance thresholds",
      "CONTRACT: Data sources, modelling tools, and output format specified",
      "EXECUTE: Financial agent builds valuation models (L1 approves data access)",
      "EXECUTE: Sentiment agent analyses market perception",
      "EXECUTE: Regulatory agent checks compliance exposure",
      "L2 REVIEW: Validates that all risk dimensions were addressed",
    ],
    outcome: "A certified risk assessment report with auditable methodology, ready for board presentation and regulatory review.",
  },
  {
    title: "Quality compliance documentation",
    industry: "Quality / Compliance",
    scenario: "A quality team needs to generate compliance documentation for a new product release, validated by multiple independent reviewers.",
    participants: ["User (QA Manager)", "Documentation Agent", "Standards Validation Agent", "L1 Auditor", "L2 Auditor"],
    flow: [
      "DISCUSS: Review regulatory requirements and documentation templates",
      "CONTRACT: Define standards, permitted document formats, and criteria",
      "EXECUTE: Documentation agent generates compliance records (L1 gates)",
      "EXECUTE: Standards agent validates against regulatory checklists",
      "L2 REVIEW: Confirms completeness and correctness of the audit process",
    ],
    outcome: "A certified compliance package with verifiable audit trail, meeting documentation requirements for regulatory submissions.",
  },
];
