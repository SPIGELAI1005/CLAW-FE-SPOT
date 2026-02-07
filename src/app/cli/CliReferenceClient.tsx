"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CommandTerminal } from "@/components/cli/CommandTerminal";
import { getAllCommands } from "@/lib/cli/registry";
import type { CommandMeta } from "@/lib/cli/types";

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group relative">
      <pre className="rounded-xl bg-stone-900 px-4 py-3 font-mono text-xs leading-relaxed text-amber-300 dark:bg-stone-950">
        <code>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-500 opacity-0 transition-opacity hover:text-stone-300 group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function CommandDoc({ cmd }: { cmd: CommandMeta }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <code className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {cmd.signature}
        </code>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400">{cmd.description}</p>
      <div className="text-xs text-stone-500 dark:text-stone-400">
        <span className="font-semibold">Usage:</span>{" "}
        <code className="text-stone-700 dark:text-stone-300">{cmd.usage}</code>
      </div>
      {cmd.examples.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">Examples:</div>
          {cmd.examples.map((ex, i) => (
            <CodeBlock key={i}>{`$ ${ex}`}</CodeBlock>
          ))}
        </div>
      )}
    </div>
  );
}

export function CliReferenceClient() {
  const allCommands = getAllCommands();

  // Group by resource
  const groups = new Map<string, CommandMeta[]>();
  for (const cmd of allCommands) {
    const group = cmd.signature.split(" ")[0];
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(cmd);
  }

  const groupLabels: Record<string, { title: string; description: string }> = {
    agent: { title: "Agent Commands", description: "Create, list, inspect, and deploy AI agents." },
    spot: { title: "SPOT Commands", description: "Manage workspaces: create, configure, and interact." },
    pipeline: { title: "Pipeline Commands", description: "Deploy multiple agents to a SPOT in one command." },
    help: { title: "Utility", description: "Help and status commands." },
    status: { title: "", description: "" },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="CLI Reference"
        subtitle="Control your SPOTs and agents from the command line. Press Ctrl+K anywhere to open the terminal."
      />

      {/* Live terminal */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
          </span>
          <h2 className="text-sm font-semibold">Try it live</h2>
        </div>
        <CommandTerminal embedded className="min-h-[300px]" />
      </section>

      {/* Quick start */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Quick Start
        </div>
        <div className="space-y-3">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Get started with these three commands:
          </p>
          <div className="space-y-2">
            <CodeBlock>{`$ agent create --name "Archie" --role maker --skills "code review,writing"
$ spot create --title "Blog Project" --goal "Write 20 blog posts"
$ agent deploy <agent-id> --spot <spot-id> --role maker`}</CodeBlock>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Or deploy an entire pipeline in one shot:
          </p>
          <CodeBlock>{`$ pipeline create --spot <spot-id> --maker <id> --sentinel <id> --arbiter <id>`}</CodeBlock>
        </div>
      </Card>

      {/* Command reference by group */}
      {Array.from(groups.entries())
        .filter(([key]) => key !== "status") // status is grouped with help
        .map(([key, cmds]) => {
          // Merge status into help group
          const displayCmds = key === "help" ? [...cmds, ...(groups.get("status") ?? [])] : cmds;
          const label = groupLabels[key];

          return (
            <section key={key}>
              {label?.title && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {label.title}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {label.description}
                  </p>
                </div>
              )}
              <div className="space-y-6">
                {displayCmds.map((cmd) => (
                  <Card key={cmd.signature}>
                    <CommandDoc cmd={cmd} />
                  </Card>
                ))}
              </div>
            </section>
          );
        })}

      {/* Keyboard shortcut reference */}
      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Keyboard Shortcuts
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-400">Open terminal</span>
            <kbd className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-mono dark:border-stone-700 dark:bg-stone-800">
              Ctrl+K
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-400">Close terminal</span>
            <kbd className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-mono dark:border-stone-700 dark:bg-stone-800">
              Esc
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-400">Previous command</span>
            <kbd className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-mono dark:border-stone-700 dark:bg-stone-800">
              ↑
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-400">Auto-complete</span>
            <kbd className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-mono dark:border-stone-700 dark:bg-stone-800">
              Tab
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-400">Clear terminal</span>
            <span className="font-mono text-xs text-stone-500">clear</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
