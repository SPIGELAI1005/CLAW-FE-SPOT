"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { executeCommand, getCompletions, getAllCommands } from "@/lib/cli/registry";
import { CommandOutput } from "./CommandOutput";
import type { CommandResult, CommandMeta } from "@/lib/cli/types";

interface HistoryEntry {
  command: string;
  result: CommandResult;
}

const HISTORY_KEY = "claw-cli-history";
const MAX_HISTORY = 50;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(cmds: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(cmds.slice(-MAX_HISTORY)));
  } catch {
    // ignore storage errors
  }
}

/* ── Command Reference (shown when terminal is empty) ───────────── */

const groupIcons: Record<string, string> = {
  agent: "🤖",
  spot: "📋",
  pipeline: "🔗",
  help: "💡",
  status: "📊",
};

const groupLabels: Record<string, string> = {
  agent: "Agent",
  spot: "SPOT",
  pipeline: "Pipeline",
  help: "Utility",
  status: "Utility",
};

function CommandReference({ onSelect }: { onSelect: (cmd: string) => void }) {
  const allCommands = getAllCommands();

  // Group by resource
  const groups = new Map<string, CommandMeta[]>();
  for (const cmd of allCommands) {
    const group = cmd.signature.split(" ")[0];
    // merge status into help group
    const key = group === "status" ? "help" : group;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(cmd);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold text-stone-400">
          CLAW:FE SPOT Terminal
        </div>
        <div className="mt-0.5 text-[10px] text-stone-600">
          Click a command to pre-fill, or type directly below. Press <span className="text-amber-400">Tab</span> for auto-complete, <span className="text-amber-400">↑↓</span> for history.
        </div>
      </div>

      {Array.from(groups.entries()).map(([group, cmds]) => (
        <div key={group}>
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            <span>{groupIcons[group] ?? "▸"}</span>
            {groupLabels[group] ?? group}
          </div>
          <div className="grid gap-1">
            {cmds.map((cmd) => (
              <button
                key={cmd.signature}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(cmd.usage.split("[")[0].split("<")[0].trim() + " ");
                }}
                className="group flex items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-stone-800/80"
              >
                <code className="shrink-0 rounded bg-stone-800 px-1.5 py-0.5 text-[11px] font-medium text-amber-400 transition-colors group-hover:bg-amber-500/20">
                  {cmd.signature}
                </code>
                <span className="text-[11px] leading-relaxed text-stone-500 group-hover:text-stone-400">
                  {cmd.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-stone-800 pt-2 text-[10px] text-stone-600">
        <span className="text-stone-500">Quick examples:</span>
        <div className="mt-1 space-y-0.5">
          {[
            'agent create --name "Archie" --role maker',
            'spot create --title "Blog" --goal "Write posts"',
            "pipeline create --spot <id> --maker <id> --sentinel <id>",
            "status",
          ].map((ex) => (
            <button
              key={ex}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(ex);
              }}
              className="block w-full rounded px-2 py-0.5 text-left font-mono text-amber-400/60 transition-colors hover:bg-stone-800 hover:text-amber-400"
            >
              $ {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CommandTerminalProps {
  /** If true, renders as an embedded panel (no max-height). */
  embedded?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

export function CommandTerminal({ embedded = false, className = "" }: CommandTerminalProps) {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cmdHistoryRef = useRef<string[]>(loadHistory());

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  // Focus input when terminal is rendered
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;

    setInput("");
    setHistoryIndex(-1);
    setSuggestions([]);
    setIsRunning(true);

    // Save to command history
    cmdHistoryRef.current = [...cmdHistoryRef.current.filter((c) => c !== trimmed), trimmed];
    saveHistory(cmdHistoryRef.current);

    // Handle "clear" specially
    if (trimmed === "clear") {
      setEntries([]);
      setIsRunning(false);
      return;
    }

    try {
      const result = await executeCommand(trimmed);
      setEntries((prev) => [...prev, { command: trimmed, result }]);
    } catch (err) {
      setEntries((prev) => [
        ...prev,
        { command: trimmed, result: { status: "error", output: `Unexpected error: ${String(err)}` } },
      ]);
    } finally {
      setIsRunning(false);
      // Refocus input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isRunning]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // History navigation
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const history = cmdHistoryRef.current;
      if (history.length === 0) return;
      const newIdx = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIdx);
      setInput(history[history.length - 1 - newIdx] ?? "");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
        return;
      }
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setInput(cmdHistoryRef.current[cmdHistoryRef.current.length - 1 - newIdx] ?? "");
      return;
    }

    // Tab completion
    if (e.key === "Tab") {
      e.preventDefault();
      const completions = getCompletions();
      const matches = completions.filter((c) => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0] + " ");
        setSuggestions([]);
      } else if (matches.length > 1) {
        setSuggestions(matches);
      }
      return;
    }

    // Dismiss suggestions on Escape
    if (e.key === "Escape") {
      setSuggestions([]);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setHistoryIndex(-1);
    if (suggestions.length > 0) setSuggestions([]);
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border border-stone-700/50 bg-stone-900 font-mono text-sm ${
        embedded ? "" : "max-h-[500px]"
      } ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-stone-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-2 text-xs text-stone-500">CLAW:FE SPOT Terminal</span>
        {entries.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEntries([]);
            }}
            className="ml-auto text-[10px] text-stone-600 hover:text-stone-400"
          >
            Clear
          </button>
        )}
      </div>

      {/* Output area */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {entries.length === 0 && (
          <CommandReference onSelect={(cmd) => { setInput(cmd); inputRef.current?.focus(); }} />
        )}
        {entries.map((entry, i) => (
          <CommandOutput key={i} command={entry.command} result={entry.result} />
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="animate-pulse">●</span> Running...
          </div>
        )}
      </div>

      {/* Tab suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-stone-800 px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  setInput(s + " ");
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="rounded bg-stone-800 px-2 py-0.5 text-xs text-amber-400 hover:bg-stone-700"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-stone-800 px-4 py-3">
        <span className="select-none text-amber-500">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-stone-200 outline-none placeholder:text-stone-600"
          disabled={isRunning}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
