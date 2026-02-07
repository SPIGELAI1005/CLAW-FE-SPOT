import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

type Props =
  | ({
      as?: "button";
      variant?: Variant;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({
      as: "link";
      href: string;
      variant?: Variant;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>);

export function Button(props: Props) {
  const variant = props.variant ?? "primary";
  const base =
    "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white"
      : variant === "secondary"
        ? "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        : "hover:bg-zinc-100 dark:hover:bg-zinc-900";

  if (props.as === "link") {
    const { href, className, children, ...rest } = props;
    return (
      <Link href={href} className={`${base} ${styles} ${className ?? ""}`} {...rest}>
        {children}
      </Link>
    );
  }

  const { className, children, ...rest } = props;
  return (
    <button className={`${base} ${styles} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}

