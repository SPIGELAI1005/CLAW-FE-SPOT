"use client";

export interface Tab<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  tabs: Tab<T>[];
}

export function Tabs<T extends string>({ value, onChange, tabs }: TabsProps<T>) {
  return (
    <div className="flex gap-1 border-b border-stone-200 dark:border-stone-800" role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
              active
                ? "text-stone-900 dark:text-stone-50"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {tab.count}
              </span>
            )}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-stone-900 dark:bg-stone-50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
