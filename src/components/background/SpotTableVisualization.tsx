"use client";

import { useRef, useEffect } from "react";
import {
  easeInOutCubic,
  lerp,
  drawTable,
  drawSquareTable,
  drawCoffeeMachine,
  drawPerson,
  drawCrab,
  drawExpressionEmoji,
  drawChatBubble,
  drawAuditBadge,
  drawCounter,
} from "./spot/drawHelpers";
import {
  Table,
  Agent,
  ChatBubble,
  AuditVerdict,
  PERSON_COLORS,
  CRAB_COLORS,
  TABLE_HUES,
  CHAT_MESSAGES,
  CHAT_EXPRESSION_MAP,
  AUDIT_VERDICTS,
  CRAB_HATS,
  CRAB_EXPRESSIONS,
  CRAB_EYEWEAR,
} from "./spot/types";

/**
 * SPOT Table Visualization — Layer 2
 *
 * Top-down café scene with:
 * - Round SPOT tables with hue-driven gradients and animated counters
 * - Auditor station (perspective trapezoid) at top center
 * - Crabs (with hats, expressions, eyewear) & people orbiting tables
 * - Dynamic expression changes via chat bubbles + emoji indicators
 * - Audit verdict badges spawning near auditor station
 * - Parallax at 0.3× scroll speed
 */

const TOP_OFFSET = 200; // space below the 72px header for the auditor station

export default function SpotTableVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const isMobile = w < 640;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Auditor Station ─────────────────────────────────────────────
    const auditorRadius = isMobile ? 50 : 65;
    const auditorX = w / 2;
    // Center the auditor station in the TOP_OFFSET zone, below the 72px header
    const auditorY = 72 + (TOP_OFFSET - 72) / 2 + 10;

    // ── Round SPOT Tables ───────────────────────────────────────────
    const tableCount = isMobile ? 4 : w < 1024 ? 6 : 9;
    const tableRadius = isMobile ? 40 : w < 1024 ? 50 : 55;
    const tables: Table[] = [];
    const margin = tableRadius * 2.5;
    const cols = Math.ceil(Math.sqrt(tableCount * (w / (h - TOP_OFFSET))));
    const rows = Math.ceil(tableCount / cols);
    const cellW = (w - margin * 2) / cols;
    const cellH = (h - TOP_OFFSET - margin * 2) / rows;

    for (let i = 0; i < tableCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      tables.push({
        x: margin + cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.3,
        y: TOP_OFFSET + margin + cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.3,
        radius: tableRadius + (Math.random() - 0.5) * 10,
        hue: TABLE_HUES[i % TABLE_HUES.length],
        counterTarget: Math.floor(Math.random() * 200),
        counterDisplay: Math.floor(Math.random() * 200),
        nextIncrement: 1500 + Math.random() * 4000,
      });
    }

    // ── Agents ──────────────────────────────────────────────────────
    const agentCount = isMobile ? 20 : w < 1024 ? 35 : 50;
    const agents: Agent[] = [];
    for (let i = 0; i < agentCount; i++) {
      const isCrab = Math.random() < 0.4;
      const tableIndex = Math.floor(Math.random() * tables.length);
      const table = tables[tableIndex];
      const baseExp = isCrab
        ? CRAB_EXPRESSIONS[Math.floor(Math.random() * CRAB_EXPRESSIONS.length)]
        : "normal";
      agents.push({
        type: isCrab ? "crab" : "person",
        color: isCrab
          ? CRAB_COLORS[Math.floor(Math.random() * CRAB_COLORS.length)]
          : PERSON_COLORS[Math.floor(Math.random() * PERSON_COLORS.length)],
        tableIndex,
        angle: Math.random() * Math.PI * 2,
        orbitSpeed: (0.15 + Math.random() * 0.25) * (Math.random() < 0.5 ? 1 : -1),
        orbitRadius: table.radius + 15 + Math.random() * 20,
        migrating: false,
        migrateFrom: { x: 0, y: 0 },
        migrateTo: { x: 0, y: 0 },
        migrateProgress: 0,
        migrateDuration: 0,
        targetTableIndex: tableIndex,
        screenX: 0,
        screenY: 0,
        sizeMultiplier: isCrab ? 0.7 + Math.random() * 0.6 : 1,
        hat: isCrab ? CRAB_HATS[Math.floor(Math.random() * CRAB_HATS.length)] : "none",
        baseExpression: baseExp,
        expression: baseExp,
        eyewear: isCrab ? CRAB_EYEWEAR[Math.floor(Math.random() * CRAB_EYEWEAR.length)] : "none",
      });
    }

    // ── Dedicated Auditor Crabs (pinned, never migrate) ─────────────
    const baristaCrabIdx = agents.length;
    agents.push({
      type: "crab",
      color: "hsla(20, 55%, 42%, 0.85)",
      tableIndex: -1, // pinned to auditor station
      angle: 0,
      orbitSpeed: 0.1,
      orbitRadius: auditorRadius + 15,
      migrating: false,
      migrateFrom: { x: 0, y: 0 },
      migrateTo: { x: 0, y: 0 },
      migrateProgress: 0,
      migrateDuration: 0,
      targetTableIndex: -1,
      screenX: auditorX - auditorRadius * 0.6,
      screenY: auditorY + 5,
      sizeMultiplier: 1.2,
      hat: "chef",
      baseExpression: "happy",
      expression: "happy",
      eyewear: "none",
      pinned: true,
    });

    const reviewerCrabIdx = agents.length;
    agents.push({
      type: "crab",
      color: "hsla(215, 35%, 42%, 0.85)",
      tableIndex: -1,
      angle: 0,
      orbitSpeed: -0.1,
      orbitRadius: auditorRadius + 15,
      migrating: false,
      migrateFrom: { x: 0, y: 0 },
      migrateTo: { x: 0, y: 0 },
      migrateProgress: 0,
      migrateDuration: 0,
      targetTableIndex: -1,
      screenX: auditorX + auditorRadius * 0.6,
      screenY: auditorY + 5,
      sizeMultiplier: 1.1,
      hat: "tophat",
      baseExpression: "normal",
      expression: "normal",
      eyewear: "monocle",
      pinned: true,
    });

    // ── Chat bubbles ────────────────────────────────────────────────
    const chatBubbles: ChatBubble[] = [];
    let nextChat = 800 + Math.random() * 1500;

    // ── Audit verdicts ──────────────────────────────────────────────
    const verdicts: AuditVerdict[] = [];
    let nextVerdict = 2000 + Math.random() * 3000;

    // ── Migration timer ─────────────────────────────────────────────
    let nextMigration = 1500 + Math.random() * 2000;

    // ── Animation loop ──────────────────────────────────────────────
    let lastTime = performance.now();
    const agentSize = isMobile ? 7 : 9;

    const frame = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const t = now * 0.001;

      ctx.clearRect(0, 0, w, h);

      // ── Draw Auditor Station ────────────────────────────────────
      drawSquareTable(ctx, auditorX, auditorY, auditorRadius);

      // Labels on auditor station surface
      ctx.font = "bold 9px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "hsla(30, 15%, 75%, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕ BARISTA", auditorX - auditorRadius * 0.5, auditorY - auditorRadius * 0.25);
      ctx.fillText("🔍 AUDITOR", auditorX + auditorRadius * 0.5, auditorY - auditorRadius * 0.25);

      // Coffee machine on auditor table surface
      drawCoffeeMachine(ctx, auditorX, auditorY + 5, t);

      // ── Verdicts (spawn near auditor station) ──────────────────
      nextVerdict -= dt;
      if (nextVerdict <= 0 && !prefersReduced) {
        const v = AUDIT_VERDICTS[Math.floor(Math.random() * AUDIT_VERDICTS.length)];
        verdicts.push({
          text: v.text,
          icon: v.icon,
          age: 0,
          maxAge: 3500 + Math.random() * 2000,
          x: auditorX + (Math.random() - 0.5) * auditorRadius * 2,
          floatY: 0,
        });
        if (verdicts.length > 5) verdicts.shift();
        nextVerdict = 2500 + Math.random() * 4000;
      }

      for (let i = verdicts.length - 1; i >= 0; i--) {
        const v = verdicts[i];
        v.age += dt;
        if (v.age > v.maxAge) {
          verdicts.splice(i, 1);
          continue;
        }
        const progress = v.age / v.maxAge;
        const fadeIn = Math.min(progress * 6, 1);
        const fadeOut = Math.max(1 - (progress - 0.7) / 0.3, 0);
        const alpha = fadeIn * fadeOut * 0.85;
        v.floatY = -progress * 30;
        drawAuditBadge(
          ctx,
          v.x,
          auditorY + auditorRadius * 0.6 + 15 + v.floatY,
          v.text,
          v.icon,
          alpha,
        );
      }

      // ── Draw round tables with counters ─────────────────────────
      for (const table of tables) {
        drawTable(ctx, table.x, table.y, table.radius, table.hue);

        table.nextIncrement -= dt;
        if (table.nextIncrement <= 0 && !prefersReduced) {
          table.counterTarget += 1 + Math.floor(Math.random() * 15);
          table.nextIncrement = 1500 + Math.random() * 4000;
        }
        // Smooth lerp toward target (dt * 0.05 per frame)
        table.counterDisplay = lerp(table.counterDisplay, table.counterTarget, 0.05);
        drawCounter(ctx, table.x, table.y, table.counterDisplay, table.hue, isMobile);
      }

      // ── Migrations ──────────────────────────────────────────────
      nextMigration -= dt;
      if (nextMigration <= 0 && !prefersReduced) {
        const available = agents.filter((a) => !a.migrating && !a.pinned);
        if (available.length > 0) {
          const agent = available[Math.floor(Math.random() * available.length)];
          const currentTable = tables[agent.tableIndex];
          if (currentTable) {
            let newIndex = Math.floor(Math.random() * tables.length);
            if (newIndex === agent.tableIndex && tables.length > 1) {
              newIndex = (newIndex + 1) % tables.length;
            }
            const newTable = tables[newIndex];
            const cx = currentTable.x + Math.cos(agent.angle) * agent.orbitRadius;
            const cy = currentTable.y + Math.sin(agent.angle) * agent.orbitRadius;

            agent.migrating = true;
            agent.migrateFrom = { x: cx, y: cy };
            agent.migrateTo = {
              x: newTable.x + Math.cos(agent.angle) * (newTable.radius + 15 + Math.random() * 20),
              y: newTable.y + Math.sin(agent.angle) * (newTable.radius + 15 + Math.random() * 20),
            };
            agent.migrateProgress = 0;
            agent.migrateDuration = 1500 + Math.random() * 2000;
            agent.targetTableIndex = newIndex;
          }
        }
        nextMigration = 800 + Math.random() * 1500;
      }

      // ── Update & draw agents ────────────────────────────────────
      for (let ai = 0; ai < agents.length; ai++) {
        const agent = agents[ai];

        if (agent.pinned) {
          // Auditor crabs: slight orbit around their fixed position
          if (!prefersReduced) {
            agent.angle += agent.orbitSpeed * dt * 0.001;
          }
          const baseX = ai === baristaCrabIdx
            ? auditorX - auditorRadius * 0.6
            : auditorX + auditorRadius * 0.6;
          agent.screenX = baseX + Math.cos(agent.angle) * 5;
          agent.screenY = auditorY + 5 + Math.sin(agent.angle) * 3;
        } else if (agent.migrating) {
          agent.migrateProgress += dt;
          const p = Math.min(agent.migrateProgress / agent.migrateDuration, 1);
          const ep = easeInOutCubic(p);
          agent.screenX = lerp(agent.migrateFrom.x, agent.migrateTo.x, ep);
          agent.screenY = lerp(agent.migrateFrom.y, agent.migrateTo.y, ep);
          agent.screenY += Math.sin(p * Math.PI) * -30;

          if (p >= 1) {
            agent.migrating = false;
            agent.tableIndex = agent.targetTableIndex;
            const table = tables[agent.tableIndex];
            agent.orbitRadius = table.radius + 15 + Math.random() * 20;
            agent.angle = Math.atan2(
              agent.migrateTo.y - table.y,
              agent.migrateTo.x - table.x,
            );
          }
        } else {
          if (!prefersReduced) {
            agent.angle += agent.orbitSpeed * dt * 0.001;
          }
          const table = tables[agent.tableIndex];
          if (table) {
            agent.screenX = table.x + Math.cos(agent.angle) * agent.orbitRadius;
            agent.screenY = table.y + Math.sin(agent.angle) * agent.orbitRadius;
          }
        }

        if (agent.type === "crab") {
          const sz = agentSize * agent.sizeMultiplier;
          drawCrab(
            ctx,
            agent.screenX,
            agent.screenY,
            agent.color,
            sz,
            t,
            agent.hat,
            agent.expression,
            agent.eyewear,
          );
          // Emoji indicator when expression differs from base
          if (agent.expression !== agent.baseExpression) {
            drawExpressionEmoji(ctx, agent.screenX, agent.screenY, agent.expression, sz);
          }
        } else {
          drawPerson(ctx, agent.screenX, agent.screenY, agent.color, agentSize);
        }
      }

      // ── Chat bubbles ────────────────────────────────────────────
      nextChat -= dt;
      if (nextChat <= 0 && !prefersReduced) {
        const nonMigrating = agents
          .map((a, i) => ({ a, i }))
          .filter(({ a }) => !a.migrating);
        if (nonMigrating.length > 0) {
          const pick = nonMigrating[Math.floor(Math.random() * nonMigrating.length)];
          if (!chatBubbles.some((b) => b.agentIndex === pick.i)) {
            const text = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
            chatBubbles.push({
              agentIndex: pick.i,
              text,
              age: 0,
              maxAge: 2000 + Math.random() * 1500,
            });
            if (chatBubbles.length > 6) chatBubbles.shift();

            // Dynamic expression change for crabs
            const agent = agents[pick.i];
            if (agent.type === "crab") {
              const mappedExpr = CHAT_EXPRESSION_MAP[text];
              if (mappedExpr) {
                agent.expression = mappedExpr;
              }
            }
          }
        }
        nextChat = 600 + Math.random() * 1200;
      }

      for (let i = chatBubbles.length - 1; i >= 0; i--) {
        const b = chatBubbles[i];
        b.age += dt;
        if (b.age > b.maxAge) {
          // Revert crab expression to base on bubble expiry
          const agent = agents[b.agentIndex];
          if (agent && agent.type === "crab") {
            agent.expression = agent.baseExpression;
          }
          chatBubbles.splice(i, 1);
          continue;
        }
        const progress = b.age / b.maxAge;
        const fadeIn = Math.min(progress * 8, 1);
        const fadeOut = Math.max(1 - (progress - 0.75) / 0.25, 0);
        const alpha = fadeIn * fadeOut;
        const agent = agents[b.agentIndex];
        if (agent) {
          const floatUp = -progress * 8;
          drawChatBubble(
            ctx,
            agent.screenX,
            agent.screenY - 14 + floatUp,
            b.text,
            alpha,
          );
        }
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
