interface LogoProps {
  className?: string;
  /** Show the "CLAW Federation : Coffee Spot" subtitle beneath the logo */
  showSubtitle?: boolean;
}

export function Logo({ className = "h-7", showSubtitle = false }: LogoProps) {
  return (
    <span
      className={`inline-flex flex-col items-start font-extrabold ${className}`}
      aria-label="CLAW:FE SPOT"
    >
      <span className="inline-flex origin-left items-baseline tracking-tight scale-[1.12]">
        <span className="gradient-text-animated">CLAW</span>
        <span className="text-white">:FE SPOT</span>
      </span>
      {showSubtitle && (
        <span className="mt-0.5 text-[0.36em] font-semibold uppercase tracking-[0.22em]">
          <span className="gradient-text-animated">CLAW</span>
          <span className="text-white">{" Federation : "}</span>
          <span className="gradient-text-animated">Coffee</span>
          <span className="text-white">{" Spot"}</span>
        </span>
      )}
    </span>
  );
}
