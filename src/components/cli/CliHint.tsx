"use client";

import { useState } from "react";

interface CliHintProps {
  commands: { label: string; command: string }[];
}

/**
 * Collapsible "CLI" section showing contextual commands.
 * Used on agent profiles, SPOT panels, and creation forms.
 */
export function CliHint({ commands }: CliHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  function handleCopy(cmd: string) {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  }

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="cli-hint-panel"
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
        CLI Commands
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div id="cli-hint-panel" className="space-y-2 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
          {commands.map((c) => (
            <div key={c.command} className="group">
              <div className="mb-0.5 text-[10px] font-medium text-stone-400">{c.label}</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-stone-900 px-3 py-1.5 font-mono text-[11px] text-amber-300 dark:bg-stone-950">
                  $ {c.command}
                </code>
                <button
                  onClick={() => handleCopy(c.command)}
                  className="rounded px-1.5 py-1 text-[10px] text-stone-400 opacity-0 transition-opacity hover:bg-stone-100 hover:text-stone-600 group-hover:opacity-100 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                  aria-label={`Copy command: ${c.label}`}
                >
                  {copiedCmd === c.command ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
