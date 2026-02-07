"use client";

/**
 * CrabCoffeeToggle — An animated menu toggle that morphs between:
 *   🦀 Crab (closed) → ✕ (transitioning) → ☕ Coffee cup (open)
 *
 * Ties into the CLAW (crab claw) + SPOT (coffee spot) brand identity.
 * Uses CSS transitions on SVG paths for smooth morphing.
 */

interface CrabCoffeeToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function CrabCoffeeToggle({ isOpen, onClick, className = "" }: CrabCoffeeToggleProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm transition-all hover:border-amber-400/30 hover:bg-white/20 active:scale-95 ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        width="22"
        height="22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* ── Crab state (visible when closed) ── */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? "scale(0.5) rotate(90deg)" : "scale(1) rotate(0deg)",
            transformOrigin: "16px 16px",
          }}
        >
          {/* Left claw */}
          <path
            d="M6 8 C3 5, 1 8, 4 11 L8 13"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 8 C3 11, 1 8, 4 5 L8 7"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right claw */}
          <path
            d="M26 8 C29 5, 31 8, 28 11 L24 13"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M26 8 C29 11, 31 8, 28 5 L24 7"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Body shell */}
          <ellipse
            cx="16"
            cy="17"
            rx="8"
            ry="6"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            fill="none"
          />
          {/* Eyes */}
          <circle cx="12" cy="12" r="1.5" fill="url(#crab-gradient)" />
          <circle cx="20" cy="12" r="1.5" fill="url(#crab-gradient)" />
          {/* Legs (3 per side) */}
          <path d="M9 19 L4 22" stroke="url(#crab-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 21 L4 25" stroke="url(#crab-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 22 L7 27" stroke="url(#crab-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M23 19 L28 22" stroke="url(#crab-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 21 L28 25" stroke="url(#crab-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 22 L25 27" stroke="url(#crab-gradient)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── X state (visible during transition — brief flash) ── */}
        <g
          className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: 0,
            transform: "scale(0.8)",
            transformOrigin: "16px 16px",
            animation: isOpen ? "none" : "none",
          }}
        >
          <line x1="10" y1="10" x2="22" y2="22" stroke="url(#crab-gradient)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="10" x2="10" y2="22" stroke="url(#crab-gradient)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* ── Coffee cup state (visible when open) ── */}
        <g
          className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-90deg)",
            transformOrigin: "16px 16px",
          }}
        >
          {/* Cup body */}
          <path
            d="M7 14 L9 26 C9 27.5, 23 27.5, 23 26 L25 14"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Cup rim */}
          <line x1="6" y1="14" x2="26" y2="14" stroke="url(#crab-gradient)" strokeWidth="2" strokeLinecap="round" />
          {/* Handle */}
          <path
            d="M25 16 C29 16, 29 22, 25 22"
            stroke="url(#crab-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Steam curls */}
          <path
            d="M12 11 C12 9, 14 9, 14 7 C14 5, 12 5, 12 3"
            stroke="url(#crab-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            className="animate-[steam-rise_2s_ease-in-out_infinite]"
            style={{ opacity: isOpen ? 0.7 : 0 }}
          />
          <path
            d="M17 10 C17 8, 19 8, 19 6 C19 4, 17 4, 17 2"
            stroke="url(#crab-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            className="animate-[steam-rise_2s_ease-in-out_0.5s_infinite]"
            style={{ opacity: isOpen ? 0.5 : 0 }}
          />
          {/* Saucer */}
          <ellipse
            cx="16"
            cy="28"
            rx="10"
            ry="2"
            stroke="url(#crab-gradient)"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Shared gradient definition */}
        <defs>
          <linearGradient id="crab-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}
