"use client";

import { useState, useEffect, useCallback } from "react";
import { CommandTerminal } from "./CommandTerminal";

/**
 * Global command palette overlay.
 * Opens with Ctrl+K (or Cmd+K on Mac).
 * Mount this once in AppShell.
 */
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      // Escape closes
      if (e.key === "Escape" && isOpen) {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Terminal panel */}
      <div className="relative w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <kbd className="rounded border border-stone-600 bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono">
              Ctrl+K
            </kbd>
            to toggle
          </div>
          <button
            onClick={close}
            className="rounded px-2 py-0.5 text-xs text-stone-500 hover:text-stone-300"
          >
            Close
          </button>
        </div>
        <CommandTerminal className="shadow-2xl shadow-black/40" />
      </div>
    </div>
  );
}

/**
 * Export the open-palette function so Sidebar can trigger it.
 * We use a simple event-based approach.
 */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("claw:open-terminal"));
}

/**
 * Variant that listens for the custom event. Use this as the mounted component.
 */
export function CommandPaletteWithTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    }

    function handleCustomOpen() {
      setIsOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("claw:open-terminal", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("claw:open-terminal", handleCustomOpen);
    };
  }, [isOpen, toggle, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Terminal panel */}
      <div className="relative w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <kbd className="rounded border border-stone-600 bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono">
              Ctrl+K
            </kbd>
            to toggle
          </div>
          <button
            onClick={close}
            className="rounded px-2 py-0.5 text-xs text-stone-500 hover:text-stone-300"
          >
            Close
          </button>
        </div>
        <CommandTerminal className="shadow-2xl shadow-black/40" />
      </div>
    </div>
  );
}
