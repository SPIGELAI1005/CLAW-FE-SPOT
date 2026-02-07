"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * CLAW-FE SPOT Animated Background — Layer 1
 *
 * Three subtle animation layers rendered on a single <canvas>:
 *   A) Steam Flow – slow Perlin-ish wisps suggesting coffee warmth
 *   B) Node Network – drifting dots with thin connecting lines (SPOT tables)
 *   C) Audit Pulse – faint expanding rings (certification / audit gates)
 *
 * Honors `prefers-reduced-motion`: freezes to a static warm gradient.
 */

export interface ClawfeBgConfig {
  intensity?: "low" | "medium";
  nodeCount?: number;
  motionSpeed?: number;
  enableSteam?: boolean;
}

const DEFAULTS: Required<ClawfeBgConfig> = {
  intensity: "low",
  nodeCount: 18,
  motionSpeed: 1,
  enableSteam: true,
};

function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getCSSColor(varName: string, alpha = 1): string {
  if (typeof document === "undefined") return `hsla(30,10%,70%,${alpha})`;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return `hsla(30,10%,70%,${alpha})`;
  const parts = raw.split(/\s+/);
  if (parts.length >= 3) {
    return `hsla(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }
  return `hsla(${raw}, ${alpha})`;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Pulse {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  maxRadius: number;
}

export default function ClawfeAnimatedBackground({
  config,
}: {
  config?: ClawfeBgConfig;
}) {
  const cfg = { ...DEFAULTS, ...config };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const drawStaticGradient = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.7,
      );
      grad.addColorStop(0, getCSSColor("--warm-glow", 1));
      grad.addColorStop(1, getCSSColor("--vignette", 1));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    if (prefersReduced) {
      drawStaticGradient(ctx, W(), H());
      return () => window.removeEventListener("resize", resize);
    }

    const intensityAlpha = cfg.intensity === "medium" ? 1 : 0.6;

    // Nodes
    const nodeCount = Math.max(6, Math.min(cfg.nodeCount, 30));
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.3 * cfg.motionSpeed,
      vy: (Math.random() - 0.5) * 0.3 * cfg.motionSpeed,
      radius: 2 + Math.random() * 2,
    }));

    // Pulses
    const pulses: Pulse[] = [];
    let nextPulse = 3000 + Math.random() * 4000;
    const CONNECTION_DIST = 180;

    // Steam particles
    const steamParticles: {
      x: number;
      y: number;
      life: number;
      maxLife: number;
    }[] = [];
    if (cfg.enableSteam) {
      const count = Math.floor((W() * H()) / 60000);
      for (let i = 0; i < Math.min(count, 40); i++) {
        steamParticles.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          life: Math.random() * 400,
          maxLife: 300 + Math.random() * 200,
        });
      }
    }

    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const w = W();
      const h = H();

      drawStaticGradient(ctx, w, h);

      // A) Steam layer
      if (cfg.enableSteam) {
        for (const p of steamParticles) {
          p.life += dt * 0.01 * cfg.motionSpeed;
          if (p.life > p.maxLife) {
            p.life = 0;
            p.x = Math.random() * w;
            p.y = Math.random() * h;
          }

          const t = now * 0.00008 * cfg.motionSpeed;
          const nx = noise2D(p.x * 0.003 + t, p.y * 0.003);
          const ny = noise2D(p.x * 0.003, p.y * 0.003 + t);
          p.x += (nx - 0.5) * 0.6 * cfg.motionSpeed;
          p.y +=
            (ny - 0.5) * 0.4 * cfg.motionSpeed - 0.15 * cfg.motionSpeed;

          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;

          const lifeRatio = p.life / p.maxLife;
          const fadeIn = Math.min(lifeRatio * 4, 1);
          const fadeOut = Math.max(1 - (lifeRatio - 0.6) / 0.4, 0);
          const alpha = fadeIn * fadeOut * 0.06 * intensityAlpha;

          ctx.beginPath();
          ctx.arc(p.x, p.y, 30 + lifeRatio * 20, 0, Math.PI * 2);
          ctx.fillStyle = getCSSColor("--steam", alpha);
          ctx.fill();
        }
      }

      // B) Node network
      for (const node of nodes) {
        node.x += node.vx * (dt * 0.06);
        node.y += node.vy * (dt * 0.06);
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));
      }

      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha =
              (1 - dist / CONNECTION_DIST) * 0.15 * intensityAlpha;
            ctx.strokeStyle = getCSSColor("--node-line", alpha);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = getCSSColor("--coffee", 0.2 * intensityAlpha);
        ctx.fill();
      }

      // C) Audit pulse layer
      nextPulse -= dt;
      if (nextPulse <= 0) {
        pulses.push({
          x: w * (0.15 + Math.random() * 0.7),
          y: h * (0.15 + Math.random() * 0.7),
          age: 0,
          maxAge: 3000 + Math.random() * 2000,
          maxRadius: 40 + Math.random() * 50,
        });
        nextPulse = 6000 + Math.random() * 6000;
        if (pulses.length > 4) pulses.shift();
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.age += dt;
        if (p.age > p.maxAge) {
          pulses.splice(i, 1);
          continue;
        }
        const progress = p.age / p.maxAge;
        const r = lerp(8, p.maxRadius, progress);
        const alpha = (1 - progress) * 0.12 * intensityAlpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = getCSSColor("--audit-ring", alpha);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (progress < 0.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = getCSSColor("--audit-ring", alpha * 0.5);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [
    cfg.intensity,
    cfg.nodeCount,
    cfg.motionSpeed,
    cfg.enableSteam,
    prefersReduced,
    drawStaticGradient,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
