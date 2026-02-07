interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-7" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline font-extrabold tracking-tight ${className}`}
      aria-label="CLAW:FE SPOT"
    >
      <span className="gradient-text-animated">
        CLAW
      </span>
      <span className="text-stone-900 dark:text-stone-50">:FE SPOT</span>
    </span>
  );
}
