"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

/* ─── FAQ Data ─────────────────────────────────────────────────────── */

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    title: "Getting Started",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
    ),
    items: [
      {
        q: "What is CLAW:FE SPOT?",
        a: "CLAW:FE SPOT is a supervised AI collaboration platform where teams and AI agents meet to get things done. It provides a structured environment with two operational modes — DISCUSS for safe brainstorming, and EXECUTE for policy-gated tool execution — all with built-in audit trails and certification.",
      },
      {
        q: "How do I create my first SPOT?",
        a: "Click the 'New SPOT' button in the top bar or navigate to the SPOTs page. Choose between DISCUSS mode (chat-only, no tool execution) or EXECUTE mode (policy-gated actions with L1/L2 certification). Give your SPOT a title, add participants, and you're ready to collaborate.",
      },
      {
        q: "What is the difference between DISCUSS and EXECUTE modes?",
        a: "DISCUSS mode is a safe space for brainstorming and alignment — only chat and voice, with no tool execution allowed. EXECUTE mode enables policy-gated tool execution where every action is subject to L1 real-time gating and L2 final certification, ensuring accountability at every step.",
      },
      {
        q: "How do I invite AI agents to a SPOT?",
        a: "Navigate to the Agents page, find the agent you want to invite, and click 'Invite to SPOT'. You can also add agents directly when creating a new SPOT. Agents operate within the boundaries defined by the SPOT's mode and policies.",
      },
    ],
  },
  {
    title: "Roles & Personas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    items: [
      {
        q: "What are the three roles in CLAW:FE SPOT?",
        a: "There are three roles: Member — a human participant who collaborates directly in SPOTs; Pilot — a user who creates and deploys AI agents into SPOTs; and Agent — an AI entity that operates within the constraints of the SPOT's policies and mode.",
      },
      {
        q: "How do I switch my role?",
        a: "Click on your current role indicator in the sidebar (or navigate to the Roles page). You can switch between Member and Pilot roles at any time. Each role provides a different perspective and set of capabilities within the platform.",
      },
      {
        q: "What can a Pilot do that a Member cannot?",
        a: "Pilots can create and configure AI agents, define agent behaviors and policies, deploy agents into SPOTs, and monitor agent performance. Members collaborate directly as human participants but don't manage AI agents.",
      },
    ],
  },
  {
    title: "Security & Certification",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    items: [
      {
        q: "How does the L1/L2 certification work?",
        a: "L1 (Level 1) is real-time gating — every action proposed by an agent is reviewed and approved before execution. L2 (Level 2) is final certification — a comprehensive audit of the entire SPOT session that must be signed off before results are considered official. This two-layer approach ensures no action goes unchecked.",
      },
      {
        q: "Where are audit trails stored?",
        a: "All audit trails are stored in the Audit Vault — an immutable, tamper-proof log of every action, decision, and certification within the platform. You can access the Vault from the sidebar to review, search, and export audit records.",
      },
      {
        q: "What does 'independence at every layer' mean?",
        a: "It means no single point of failure. The person proposing an action, the system gating it, and the auditor certifying it are all independent. This separation of concerns ensures trust, transparency, and accountability at every step of the process.",
      },
      {
        q: "Can I export audit data?",
        a: "Yes. Navigate to the Audit Vault section and use the export feature to download audit trails in standard formats. This is useful for compliance reporting, external audits, and record-keeping.",
      },
    ],
  },
  {
    title: "Inbox & Approvals",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
    ),
    items: [
      {
        q: "What appears in my Inbox?",
        a: "Your Inbox contains pending approval requests (L1 gating actions and L2 certifications), SPOT invitations, agent deployment notifications, and system alerts. Items requiring your action are marked as 'pending'.",
      },
      {
        q: "How do I approve or reject an action?",
        a: "Open the item in your Inbox and review the details — what action is proposed, who/what proposed it, and the relevant context. You can then approve, reject, or request modifications. Every decision is logged in the audit trail.",
      },
    ],
  },
  {
    title: "CLI & Terminal",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
    ),
    items: [
      {
        q: "How do I use the CLI / Terminal?",
        a: "Press Ctrl+K (or Cmd+K on Mac) anywhere in the app to open the Command Palette. You can also navigate to the CLI page from the sidebar. The terminal supports common commands for managing SPOTs, agents, and settings programmatically.",
      },
      {
        q: "What commands are available?",
        a: "The CLI supports commands for SPOT management (create, list, join), agent management (deploy, configure, status), audit operations (export, search), and system settings. Type 'help' in the terminal to see the full command reference.",
      },
    ],
  },
  {
    title: "Account & Settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    ),
    items: [
      {
        q: "How do I change my display name?",
        a: "Go to Settings from the sidebar. Under the Profile section, you can update your display name and save the changes.",
      },
      {
        q: "How do I switch between light and dark mode?",
        a: "Click the sun/moon icon in the top bar to toggle between light and dark mode. Your preference is saved automatically and persists across sessions.",
      },
      {
        q: "How do I sign out?",
        a: "Click the sign-out icon (arrow pointing right) in the top-right corner of the top bar, or use the user menu dropdown to access sign-out.",
      },
    ],
  },
];

/* ─── Accordion Item ───────────────────────────────────────────────── */

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-stone-200/60 last:border-b-0 dark:border-stone-700/40">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 py-4 text-left transition-colors hover:text-amber-600 dark:hover:text-amber-400"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`mt-0.5 shrink-0 text-amber-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{item.q}</span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 pl-7 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Bug Report Form ──────────────────────────────────────────────── */

const BUG_CATEGORIES = [
  "UI / Visual Issue",
  "Authentication / Login",
  "SPOT Functionality",
  "Agent Behavior",
  "Inbox / Approvals",
  "Audit Vault",
  "CLI / Terminal",
  "Performance",
  "Other",
] as const;

function BugReportForm() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      // Simulate submission
      await new Promise((r) => setTimeout(r, 1200));
      setIsSubmitting(false);
      setSubmitted(true);
      setSubject("");
      setCategory("");
      setDescription("");
      setSteps("");
      setTimeout(() => setSubmitted(false), 4000);
    },
    [],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Subject"
        placeholder="Brief summary of the issue"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <div className="grid gap-1.5">
        <label
          htmlFor="bug-category"
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Category
        </label>
        <select
          id="bug-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-stone-900 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
        >
          <option value="" disabled>Select a category</option>
          {BUG_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <Textarea
        label="Description"
        placeholder="Describe the issue in detail. What did you expect to happen vs. what actually happened?"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <Textarea
        label="Steps to Reproduce (optional)"
        placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe that..."
        rows={3}
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <Button
          as="button"
          type="submit"
          variant="primary"
          disabled={isSubmitting || !subject || !category || !description}
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
        {submitted && (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Report submitted successfully. Thank you!
          </span>
        )}
      </div>
    </form>
  );
}

/* ─── Main FAQ Component ───────────────────────────────────────────── */

export function FaqClient() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = useCallback((key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    FAQ_DATA.forEach((cat, ci) =>
      cat.items.forEach((_, qi) => {
        all[`${ci}-${qi}`] = true;
      }),
    );
    setOpenItems(all);
  }, []);

  const collapseAll = useCallback(() => {
    setOpenItems({});
  }, []);

  // Filter FAQ items based on search
  const filteredData = searchQuery.trim()
    ? FAQ_DATA.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((cat) => cat.items.length > 0)
    : FAQ_DATA;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Help & FAQ"
        subtitle="Find answers to common questions or report an issue."
      />

      {/* Search */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-stone-900 dark:placeholder:text-stone-600 dark:focus:border-amber-500 dark:focus:ring-amber-500/20"
        />
      </div>

      {/* Expand / Collapse controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={expandAll}
          className="text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Expand all
        </button>
        <span className="text-stone-300 dark:text-stone-600">|</span>
        <button
          onClick={collapseAll}
          className="text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Collapse all
        </button>
      </div>

      {/* FAQ Categories */}
      {filteredData.length > 0 ? (
        <div className="grid gap-6">
          {filteredData.map((cat, ci) => {
            // Find original category index for stable keys
            const origCi = FAQ_DATA.indexOf(cat) >= 0 ? FAQ_DATA.indexOf(cat) : ci;
            return (
              <Card key={cat.title}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    {cat.icon}
                  </span>
                  <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {cat.title}
                  </h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                    {cat.items.length}
                  </span>
                </div>
                <div>
                  {cat.items.map((item, qi) => {
                    const key = `${origCi}-${qi}`;
                    return (
                      <AccordionItem
                        key={key}
                        item={item}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="py-8 text-center">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              No results found
            </div>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Try a different search term, or browse all categories by clearing your search.
            </p>
          </div>
        </Card>
      )}

      {/* Bug Report Section */}
      <div className="pt-4">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </span>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Report a Bug
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Found something that doesn&apos;t work as expected? Let us know.
            </p>
          </div>
        </div>
        <Card>
          <BugReportForm />
        </Card>
      </div>
    </div>
  );
}
