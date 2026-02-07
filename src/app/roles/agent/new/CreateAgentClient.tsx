"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

type AgentRole = "worker" | "l1_auditor" | "l2_meta_auditor";

/* ────────────────────────────────────────────────────────────────────
   Skills catalog — grouped by category, tagged with relevance per role
   ──────────────────────────────────────────────────────────────────── */
interface CatalogItem {
  id: string;
  label: string;
  roles: AgentRole[]; // which roles benefit most (shown first / highlighted)
}

interface CatalogCategory {
  category: string;
  items: CatalogItem[];
}

const skillsCatalog: CatalogCategory[] = [
  {
    category: "Engineering",
    items: [
      { id: "code-generation", label: "Code Generation", roles: ["worker"] },
      { id: "code-review", label: "Code Review", roles: ["worker", "l1_auditor"] },
      { id: "refactoring", label: "Refactoring", roles: ["worker"] },
      { id: "debugging", label: "Debugging", roles: ["worker"] },
      { id: "testing", label: "Testing & QA", roles: ["worker", "l1_auditor"] },
      { id: "architecture", label: "Architecture Design", roles: ["worker", "l2_meta_auditor"] },
      { id: "devops", label: "DevOps & CI/CD", roles: ["worker"] },
      { id: "database", label: "Database Design", roles: ["worker"] },
      { id: "api-design", label: "API Design", roles: ["worker"] },
      { id: "performance", label: "Performance Optimization", roles: ["worker", "l1_auditor"] },
    ],
  },
  {
    category: "Data & Analytics",
    items: [
      { id: "data-analysis", label: "Data Analysis", roles: ["worker", "l2_meta_auditor"] },
      { id: "data-viz", label: "Data Visualization", roles: ["worker"] },
      { id: "ml-modeling", label: "ML Modeling", roles: ["worker"] },
      { id: "data-pipeline", label: "Data Pipeline", roles: ["worker"] },
      { id: "statistical-analysis", label: "Statistical Analysis", roles: ["worker", "l2_meta_auditor"] },
      { id: "data-cleaning", label: "Data Cleaning", roles: ["worker"] },
      { id: "etl", label: "ETL Processing", roles: ["worker"] },
    ],
  },
  {
    category: "Security & Compliance",
    items: [
      { id: "threat-detection", label: "Threat Detection", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "vulnerability-scan", label: "Vulnerability Scanning", roles: ["l1_auditor"] },
      { id: "prompt-injection-detect", label: "Prompt Injection Detection", roles: ["l1_auditor"] },
      { id: "policy-enforcement", label: "Policy Enforcement", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "access-control", label: "Access Control Review", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "compliance-check", label: "Compliance Checking", roles: ["l2_meta_auditor"] },
      { id: "risk-assessment", label: "Risk Assessment", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "incident-response", label: "Incident Response", roles: ["l1_auditor"] },
      { id: "encryption", label: "Encryption & Key Mgmt", roles: ["l1_auditor", "worker"] },
      { id: "penetration-testing", label: "Penetration Testing", roles: ["l1_auditor"] },
    ],
  },
  {
    category: "Audit & Governance",
    items: [
      { id: "log-analysis", label: "Log Analysis", roles: ["l2_meta_auditor", "l1_auditor"] },
      { id: "audit-completeness", label: "Audit Completeness Review", roles: ["l2_meta_auditor"] },
      { id: "contract-validation", label: "Contract Validation", roles: ["l2_meta_auditor"] },
      { id: "decision-review", label: "Decision Review", roles: ["l2_meta_auditor"] },
      { id: "consistency-check", label: "Consistency Checking", roles: ["l2_meta_auditor"] },
      { id: "certification", label: "Certification & Sign-off", roles: ["l2_meta_auditor"] },
      { id: "tamper-detection", label: "Tamper Detection", roles: ["l2_meta_auditor"] },
      { id: "evidence-collection", label: "Evidence Collection", roles: ["l2_meta_auditor", "l1_auditor"] },
    ],
  },
  {
    category: "Content & Communication",
    items: [
      { id: "writing", label: "Technical Writing", roles: ["worker"] },
      { id: "summarization", label: "Summarization", roles: ["worker", "l2_meta_auditor"] },
      { id: "translation", label: "Translation", roles: ["worker"] },
      { id: "report-generation", label: "Report Generation", roles: ["worker", "l2_meta_auditor"] },
      { id: "documentation", label: "Documentation", roles: ["worker"] },
      { id: "presentation", label: "Presentation Creation", roles: ["worker"] },
    ],
  },
  {
    category: "Research & Planning",
    items: [
      { id: "web-research", label: "Web Research", roles: ["worker"] },
      { id: "market-analysis", label: "Market Analysis", roles: ["worker"] },
      { id: "task-planning", label: "Task Planning", roles: ["worker"] },
      { id: "resource-allocation", label: "Resource Allocation", roles: ["worker"] },
      { id: "competitive-analysis", label: "Competitive Analysis", roles: ["worker"] },
      { id: "feasibility-study", label: "Feasibility Study", roles: ["worker", "l2_meta_auditor"] },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────
   Tools catalog
   ──────────────────────────────────────────────────────────────────── */
const toolsCatalog: CatalogCategory[] = [
  {
    category: "Code & Execution",
    items: [
      { id: "code-exec", label: "Code Execution", roles: ["worker"] },
      { id: "sandbox", label: "Sandbox Environment", roles: ["worker"] },
      { id: "repl", label: "REPL / Interpreter", roles: ["worker"] },
      { id: "git", label: "Git Operations", roles: ["worker"] },
      { id: "package-mgr", label: "Package Manager", roles: ["worker"] },
      { id: "docker", label: "Docker / Containers", roles: ["worker"] },
      { id: "ci-cd-pipeline", label: "CI/CD Pipeline", roles: ["worker"] },
      { id: "linter", label: "Linter / Formatter", roles: ["worker", "l1_auditor"] },
    ],
  },
  {
    category: "Data & Storage",
    items: [
      { id: "file-read", label: "File Read", roles: ["worker", "l1_auditor", "l2_meta_auditor"] },
      { id: "file-write", label: "File Write", roles: ["worker"] },
      { id: "database-query", label: "Database Query", roles: ["worker", "l1_auditor"] },
      { id: "database-write", label: "Database Write", roles: ["worker"] },
      { id: "object-storage", label: "Object Storage (S3)", roles: ["worker"] },
      { id: "cache", label: "Cache (Redis)", roles: ["worker"] },
      { id: "vector-db", label: "Vector Database", roles: ["worker"] },
      { id: "spreadsheet", label: "Spreadsheet Access", roles: ["worker"] },
    ],
  },
  {
    category: "Web & API",
    items: [
      { id: "web-search", label: "Web Search", roles: ["worker"] },
      { id: "web-scrape", label: "Web Scraping", roles: ["worker"] },
      { id: "http-request", label: "HTTP Requests", roles: ["worker"] },
      { id: "rest-api", label: "REST API Client", roles: ["worker"] },
      { id: "graphql", label: "GraphQL Client", roles: ["worker"] },
      { id: "webhook", label: "Webhook Trigger", roles: ["worker"] },
      { id: "browser", label: "Browser Automation", roles: ["worker"] },
    ],
  },
  {
    category: "Communication",
    items: [
      { id: "email", label: "Email Send", roles: ["worker"] },
      { id: "slack", label: "Slack Integration", roles: ["worker"] },
      { id: "notification", label: "Push Notification", roles: ["worker"] },
      { id: "calendar", label: "Calendar Access", roles: ["worker"] },
      { id: "sms", label: "SMS / Messaging", roles: ["worker"] },
    ],
  },
  {
    category: "Monitoring & Audit",
    items: [
      { id: "log-reader", label: "Log Reader", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "metrics-reader", label: "Metrics Reader", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "alert-trigger", label: "Alert Trigger", roles: ["l1_auditor"] },
      { id: "audit-trail", label: "Audit Trail Access", roles: ["l2_meta_auditor"] },
      { id: "hash-verify", label: "Hash / Signature Verify", roles: ["l2_meta_auditor"] },
      { id: "policy-engine", label: "Policy Engine", roles: ["l1_auditor", "l2_meta_auditor"] },
      { id: "anomaly-detect", label: "Anomaly Detection", roles: ["l1_auditor"] },
      { id: "report-export", label: "Report Export (PDF/JSON)", roles: ["l2_meta_auditor"] },
    ],
  },
  {
    category: "AI & ML",
    items: [
      { id: "llm-inference", label: "LLM Inference", roles: ["worker"] },
      { id: "embedding", label: "Embedding Generation", roles: ["worker"] },
      { id: "image-gen", label: "Image Generation", roles: ["worker"] },
      { id: "speech-to-text", label: "Speech-to-Text", roles: ["worker"] },
      { id: "text-to-speech", label: "Text-to-Speech", roles: ["worker"] },
      { id: "classification", label: "Classification", roles: ["worker", "l1_auditor"] },
      { id: "rag-retrieval", label: "RAG Retrieval", roles: ["worker"] },
    ],
  },
  {
    category: "Cloud & Infrastructure",
    items: [
      { id: "aws", label: "AWS SDK", roles: ["worker"] },
      { id: "gcp", label: "Google Cloud SDK", roles: ["worker"] },
      { id: "azure", label: "Azure SDK", roles: ["worker"] },
      { id: "terraform", label: "Terraform / IaC", roles: ["worker"] },
      { id: "kubernetes", label: "Kubernetes API", roles: ["worker"] },
      { id: "serverless", label: "Serverless Functions", roles: ["worker"] },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────
   Role card config
   ──────────────────────────────────────────────────────────────────── */
const roleCards: { value: AgentRole; label: string; description: string; color: string; activeColor: string; icon: React.ReactNode }[] = [
  {
    value: "worker",
    label: "Maker",
    description: "Executes tasks, proposes plans, and recruits specialists. The hands that build.",
    color: "border-stone-200 dark:border-stone-800",
    activeColor: "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
  },
  {
    value: "l1_auditor",
    label: "Sentinel",
    description: "Gates every tool call in real-time. Detects prompt injection, escalation, and tool abuse.",
    color: "border-stone-200 dark:border-stone-800",
    activeColor: "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
    ),
  },
  {
    value: "l2_meta_auditor",
    label: "Arbiter",
    description: "Reviews the full immutable log, L1 decisions, and contract compliance. Issues final certification.",
    color: "border-stone-200 dark:border-stone-800",
    activeColor: "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/20",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
    ),
  },
];

/* ────────────────────────────────────────────────────────────────────
   Chip Picker component
   ──────────────────────────────────────────────────────────────────── */
function ChipPicker({
  catalog,
  selected,
  onToggle,
  role,
  label,
  description,
}: {
  catalog: CatalogCategory[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  role: AgentRole;
  label: string;
  description: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Sort: categories with more relevant items for the current role come first
  const sortedCatalog = useMemo(() => {
    return [...catalog].sort((a, b) => {
      const aRelevance = a.items.filter((i) => i.roles.includes(role)).length;
      const bRelevance = b.items.filter((i) => i.roles.includes(role)).length;
      return bRelevance - aRelevance;
    });
  }, [catalog, role]);

  function toggleCategory(cat: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
        {selected.size > 0 && (
          <span className="text-[10px] font-medium text-stone-400">
            {selected.size} selected
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-stone-400 dark:text-stone-500">
        {description}
      </p>

      <div className="space-y-3">
        {sortedCatalog.map((cat) => {
          const isExpanded = expanded.has(cat.category);
          const relevantItems = cat.items.filter((i) => i.roles.includes(role));
          const otherItems = cat.items.filter((i) => !i.roles.includes(role));
          const selectedInCat = cat.items.filter((i) => selected.has(i.label)).length;

          return (
            <div
              key={cat.category}
              className="rounded-xl border border-stone-200/80 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/30"
            >
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.category)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    {cat.category}
                  </span>
                  {selectedInCat > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
                      {selectedInCat}
                    </span>
                  )}
                  {relevantItems.length > 0 && selectedInCat === 0 && (
                    <span className="text-[9px] font-medium text-stone-400">
                      {relevantItems.length} recommended
                    </span>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Chips */}
              {isExpanded && (
                <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
                  {/* Recommended items first */}
                  {relevantItems.map((item) => {
                    const isSelected = selected.has(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggle(item.label)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400/50 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-500/30"
                            : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700 dark:hover:ring-stone-600"
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline"><path d="m5 12 5 5L20 7"/></svg>
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                  {/* Other items (less relevant for this role) */}
                  {otherItems.map((item) => {
                    const isSelected = selected.has(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggle(item.label)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400/50 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-500/30"
                            : "bg-white/60 text-stone-400 ring-1 ring-stone-200/60 hover:text-stone-600 hover:ring-stone-300 dark:bg-stone-800/40 dark:text-stone-500 dark:ring-stone-700/60 dark:hover:text-stone-300"
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline"><path d="m5 12 5 5L20 7"/></svg>
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Selected chips display
   ──────────────────────────────────────────────────────────────────── */
function SelectedChips({
  items,
  onRemove,
  emptyText,
}: {
  items: string[];
  onRemove: (item: string) => void;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-1 text-xs italic text-stone-400 dark:text-stone-500">
        {emptyText}
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        >
          {item}
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="ml-0.5 rounded-full p-0.5 text-emerald-500 transition-colors hover:bg-emerald-200 hover:text-emerald-800 dark:hover:bg-emerald-800 dark:hover:text-emerald-200"
            aria-label={`Remove ${item}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </span>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────────── */
export function CreateAgentClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<AgentRole>("worker");
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [customSkill, setCustomSkill] = useState("");
  const [customTool, setCustomTool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleSkill(label: string) {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleTool(label: string) {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function addCustomSkill() {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.has(trimmed)) {
      setSelectedSkills((prev) => new Set(prev).add(trimmed));
      setCustomSkill("");
    }
  }

  function addCustomTool() {
    const trimmed = customTool.trim();
    if (trimmed && !selectedTools.has(trimmed)) {
      setSelectedTools((prev) => new Set(prev).add(trimmed));
      setCustomTool("");
    }
  }

  const skillsArray = useMemo(() => Array.from(selectedSkills), [selectedSkills]);
  const toolsArray = useMemo(() => Array.from(selectedTools), [selectedTools]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: role,
          description: description.trim() || undefined,
          skills: skillsArray,
          tools: toolsArray,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/agents/${data.id ?? ""}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleLabel = role === "l1_auditor" ? "sentinel" : role === "l2_meta_auditor" ? "arbiter" : "maker";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/roles"
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        All Roles
      </Link>

      <PageHeader
        title="Create Agent"
        subtitle="Configure a new AI agent and assign its role."
      />

      {/* Role Picker */}
      <div>
        <label className="mb-3 block text-sm font-medium text-stone-700 dark:text-stone-300">
          Agent Role
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {roleCards.map((rc) => (
            <button
              key={rc.value}
              type="button"
              onClick={() => setRole(rc.value)}
              className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${
                role === rc.value ? rc.activeColor : rc.color
              }`}
            >
              {role === rc.value && (
                <div className="absolute right-3 top-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="m5 12 5 5L20 7"/></svg>
                </div>
              )}
              <div className={`mb-3 inline-flex rounded-xl p-2 ${
                rc.value === "worker"
                  ? "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400"
                  : rc.value === "l1_auditor"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
              }`}>
                {rc.icon}
              </div>
              <div className="text-sm font-bold">{rc.label}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                {rc.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Details Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Agent Name"
            placeholder="e.g. Archie the Maker"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="What does this agent specialize in?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Divider */}
          <div className="border-t border-stone-200/60 dark:border-stone-800" />

          {/* Skills section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Skills</h3>
                <p className="text-[11px] text-stone-400">What this agent knows how to do</p>
              </div>
            </div>

            <SelectedChips
              items={skillsArray}
              onRemove={toggleSkill}
              emptyText="No skills selected yet — pick from the catalog below"
            />

            <ChipPicker
              catalog={skillsCatalog}
              selected={selectedSkills}
              onToggle={toggleSkill}
              role={role}
              label="Skills Catalog"
              description="Categories sorted by relevance to the selected role. Recommended items appear first."
            />

            {/* Custom skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a custom skill..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-sky-500"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                disabled={!customSkill.trim()}
                className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-200/60 dark:border-stone-800" />

          {/* Tools section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Tools</h3>
                <p className="text-[11px] text-stone-400">What this agent has permission to use</p>
              </div>
            </div>

            <SelectedChips
              items={toolsArray}
              onRemove={toggleTool}
              emptyText="No tools selected yet — pick from the catalog below"
            />

            <ChipPicker
              catalog={toolsCatalog}
              selected={selectedTools}
              onToggle={toggleTool}
              role={role}
              label="Tools Catalog"
              description="Categories sorted by relevance. Recommended tools for the selected role appear first."
            />

            {/* Custom tool input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a custom tool..."
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTool(); } }}
                className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addCustomTool}
                disabled={!customTool.trim()}
                className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-200/60 dark:border-stone-800" />

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-stone-400">
              {skillsArray.length} skill{skillsArray.length !== 1 ? "s" : ""} · {toolsArray.length} tool{toolsArray.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-3">
              <Button as="link" href="/roles" variant="ghost">
                Cancel
              </Button>
              <Button
                as="button"
                variant="primary"
                type="submit"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* CLI Pro tip */}
      {name.trim() && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/50">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
            Pro tip — CLI equivalent
          </div>
          <code className="block rounded-lg bg-stone-900 px-3 py-2 font-mono text-[11px] text-amber-300 dark:bg-stone-950">
            $ agent create --name &quot;{name.trim()}&quot; --role {roleLabel}{skillsArray.length > 0 ? ` --skills "${skillsArray.join(", ")}"` : ""}{toolsArray.length > 0 ? ` --tools "${toolsArray.join(", ")}"` : ""}
          </code>
        </div>
      )}
    </div>
  );
}
