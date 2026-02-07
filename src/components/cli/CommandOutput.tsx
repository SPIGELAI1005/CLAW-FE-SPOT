"use client";

import { useState } from "react";
import type { CommandResult } from "@/lib/cli/types";

interface CommandOutputProps {
  command: string;
  result: CommandResult;
}

const statusColors: Record<string, string> = {
  success: "text-emerald-400",
  error: "text-rose-400",
  info: "text-sky-400",
};

const statusIcons: Record<string, string> = {
  success: "✓",
  error: "✗",
  info: "ℹ",
};

export function CommandOutput({ command, result }: CommandOutputProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(result.output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group">
      {/* Input echo */}
      <div className="flex items-center gap-2 text-amber-400/80">
        <span className="select-none text-stone-500">$</span>
        <span className="font-medium">{command}</span>
      </div>
      {/* Result */}
      <div className="relative mt-1 rounded-lg bg-stone-800/50 px-3 py-2">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] text-stone-500 opacity-0 transition-opacity hover:bg-stone-700 hover:text-stone-300 group-hover:opacity-100"
          title="Copy output"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 select-none text-xs ${statusColors[result.status]}`}>
            {statusIcons[result.status]}
          </span>
          <pre className="flex-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-stone-300">
            {result.output}
          </pre>
        </div>
      </div>
    </div>
  );
}
