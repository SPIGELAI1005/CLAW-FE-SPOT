"use client";

import dynamic from "next/dynamic";
import type { ClawfeBgConfig } from "./ClawfeAnimatedBackground";

const ClawfeAnimatedBackground = dynamic(
  () => import("./ClawfeAnimatedBackground"),
  { ssr: false },
);

const SpotTableVisualization = dynamic(
  () => import("./SpotTableVisualization"),
  { ssr: false },
);

interface AnimatedBackgroundProps {
  /** Show only the base atmosphere layer (no tables/agents) */
  minimal?: boolean;
  /** Config passed to the atmosphere layer */
  config?: ClawfeBgConfig;
}

/**
 * Combined animated background with two stacked canvas layers.
 * Layer 1 (z-0): ClawfeAnimatedBackground — steam, nodes, pulses
 * Layer 2 (z-0): SpotTableVisualization — tables, agents, chat, verdicts
 *
 * Use `minimal` for the app shell (just atmosphere, no scene clutter).
 * Use full mode for the landing page.
 */
export function AnimatedBackground({
  minimal = false,
  config,
}: AnimatedBackgroundProps) {
  return (
    <>
      <ClawfeAnimatedBackground config={config} />
      {!minimal && <SpotTableVisualization />}
    </>
  );
}
