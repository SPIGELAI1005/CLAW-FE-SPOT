import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props =
  | ({
      as?: "button";
      variant?: Variant;
      isLoading?: boolean;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({
      as: "link";
      href: string;
      variant?: Variant;
      isLoading?: boolean;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>);

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button(props: Props) {
  const variant = props.variant ?? "primary";
  const isLoading = props.isLoading ?? false;
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800 hover:shadow-md dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-white"
      : variant === "secondary"
        ? "border border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"
        : variant === "danger"
          ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow-md"
          : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800";

  if (props.as === "link") {
    const { href, className, children, isLoading: _, ...rest } = props;
    return (
      <Link href={href} className={`${base} ${styles} ${className ?? ""}`} {...rest}>
        {isLoading && <Spinner />}
        {children}
      </Link>
    );
  }

  const { className, children, disabled, isLoading: _, ...rest } = props;
  return (
    <button
      className={`${base} ${styles} ${className ?? ""}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
