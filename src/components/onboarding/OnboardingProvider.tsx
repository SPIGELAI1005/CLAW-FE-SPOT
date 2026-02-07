"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to CLAW:FE SPOT",
    description:
      "This is your Dashboard — the central hub for all your supervised AI collaborations. Let us show you around.",
    targetSelector: "[data-onboarding='dashboard-title']",
    placement: "bottom",
  },
  {
    id: "create-spot",
    title: "Create a SPOT",
    description:
      "Start a new Supervised Process of Operation & Trust. Click 'New SPOT' to define goals, invite agents, and set up contracts.",
    targetSelector: "[data-onboarding='new-spot-button']",
    placement: "bottom",
  },
  {
    id: "roles",
    title: "Choose Your Role",
    description:
      "Switch between Member, Pilot, or Agent persona. Each persona gives you different tools and navigation colors.",
    targetSelector: "[data-onboarding='persona-indicator']",
    placement: "right",
  },
  {
    id: "terminal",
    title: "CLI Terminal",
    description:
      "Power users can use the built-in terminal for agent pipelines, SPOT management, and advanced operations. Press Ctrl+K to open.",
    targetSelector: "[data-onboarding='terminal-button']",
    placement: "bottom",
  },
];

const STORAGE_KEY = "claw_onboarding_completed";

interface OnboardingContextValue {
  isActive: boolean;
  currentStep: number;
  step: OnboardingStep | null;
  totalSteps: number;
  next: () => void;
  skip: () => void;
  restart: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  isActive: false,
  currentStep: 0,
  step: null,
  totalSteps: 0,
  next: () => {},
  skip: () => {},
  restart: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        // Delay onboarding start to let the page render
        const timer = setTimeout(() => setIsActive(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, []);

  const next = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsActive(false);
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
  }, []);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const step = isActive ? ONBOARDING_STEPS[currentStep] ?? null : null;

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        step,
        totalSteps: ONBOARDING_STEPS.length,
        next,
        skip,
        restart,
      }}
    >
      {children}
      {isActive && step && <OnboardingTooltip step={step} stepIndex={currentStep} total={ONBOARDING_STEPS.length} onNext={next} onSkip={skip} />}
    </OnboardingContext.Provider>
  );
}

/* ── Tooltip UI ───────────────────────────────────────────────────── */
function OnboardingTooltip({
  step,
  stepIndex,
  total,
  onNext,
  onSkip,
}: {
  step: OnboardingStep;
  stepIndex: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function updatePosition() {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        const placement = step.placement ?? "bottom";
        let top = 0;
        let left = 0;

        if (placement === "bottom") {
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2;
        } else if (placement === "top") {
          top = rect.top - 12;
          left = rect.left + rect.width / 2;
        } else if (placement === "right") {
          top = rect.top + rect.height / 2;
          left = rect.right + 12;
        } else {
          top = rect.top + rect.height / 2;
          left = rect.left - 12;
        }

        // Clamp to viewport
        top = Math.max(20, Math.min(top, window.innerHeight - 200));
        left = Math.max(20, Math.min(left, window.innerWidth - 340));

        setPosition({ top, left });
      } else {
        // If element not found, center the tooltip
        setPosition({
          top: window.innerHeight / 2 - 80,
          left: window.innerWidth / 2 - 160,
        });
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [step]);

  if (!position) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
        onClick={onSkip}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-80 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-700 dark:bg-stone-900"
        style={{ top: position.top, left: position.left }}
        role="dialog"
        aria-label={`Onboarding step ${stepIndex + 1} of ${total}`}
      >
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {stepIndex + 1}
          </div>
          <span className="text-[10px] font-medium text-stone-400">
            Step {stepIndex + 1} of {total}
          </span>
        </div>

        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          {step.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="mt-4 flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex
                  ? "w-4 bg-amber-500"
                  : i < stepIndex
                    ? "w-1.5 bg-amber-300"
                    : "w-1.5 bg-stone-200 dark:bg-stone-700"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={onSkip}
            className="text-xs font-medium text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            Skip tour
          </button>
          <button
            onClick={onNext}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
          >
            {stepIndex === total - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
