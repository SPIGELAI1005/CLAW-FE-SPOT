"use client";

import { useCallback, useRef } from "react";

export type Segment<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  segments,
}: {
  value: T;
  onChange: (value: T) => void;
  segments: Array<Segment<T>>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = -1;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (index + 1) % segments.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (index - 1 + segments.length) % segments.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = segments.length - 1;
      }

      if (nextIndex >= 0) {
        onChange(segments[nextIndex].value);
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[nextIndex]?.focus();
      }
    },
    [onChange, segments],
  );

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="View options"
      className="inline-flex rounded-2xl border border-stone-200 bg-white p-1 shadow-sm dark:border-stone-800 dark:bg-stone-950"
    >
      {segments.map((s, i) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(s.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`h-9 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400 ${
              active
                ? "bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900"
                : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
