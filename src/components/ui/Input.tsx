import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function InputInner({ label, error, id, className = "", ...props }, ref) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = error ? `${inputId}-error` : undefined;
    return (
      <div className="grid gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition-all placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-stone-700 dark:bg-stone-900 dark:placeholder:text-stone-600 dark:focus:border-amber-500 dark:focus:ring-amber-500/20 ${className}`}
          {...props}
        />
        {error && (
          <div id={errorId} className="text-xs text-rose-600 dark:text-rose-400" role="alert">{error}</div>
        )}
      </div>
    );
  },
);
