import type { CrabHat, CrabExpression, CrabEyewear } from "./types";

// ── Utility Functions ─────────────────────────────────────────────────

/** Read a CSS custom property (space-separated HSL) and return an hsla() string */
export function getCSSColorValue(varName: string, alpha = 1): string {
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

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ── Draw Round Table (perspective-squashed ellipse) ──────────────────

export function drawTable(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  hue = 28,
) {
  // Shadow ellipse 4px below
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y + 4, radius * 1.05, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fill();
  ctx.restore();

  // Table surface: rx = radius, ry = radius * 0.32 (perspective-squashed)
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.32, 0, 0, Math.PI * 2);

  // Radial gradient from lighter center to darker rim
  const grad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.1, 0, x, y, radius);
  grad.addColorStop(0, `hsla(${hue}, 30%, 40%, 0.85)`);
  grad.addColorStop(1, `hsla(${hue}, 25%, 28%, 0.55)`);
  ctx.fillStyle = grad;
  ctx.fill();

  // 1.5px rim stroke
  ctx.strokeStyle = `hsla(${hue}, 20%, 50%, 0.3)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ── Draw Auditor Station (perspective trapezoid) ─────────────────────

export function drawSquareTable(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
) {
  const w = radius * 2;
  const h = radius * 1.2;
  // Perspective: top edge ×0.88 narrower
  const narrowFactor = 0.88;
  const topW = w * narrowFactor;

  const cornerR = 10; // rounded corner radius

  ctx.save();

  // Shadow offset 6px below (rounded)
  ctx.beginPath();
  ctx.roundRect(cx - w / 2 - 2, cy - h / 2 + 6, w + 4, h, cornerR);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fill();

  // Surface: rounded rectangle with slight perspective (top narrower)
  // We use a path with rounded corners and slight trapezoid inset at top
  ctx.beginPath();
  const topInset = (w - topW) / 2;
  ctx.moveTo(cx - topW / 2 + cornerR, cy - h / 2);
  ctx.lineTo(cx + topW / 2 - cornerR, cy - h / 2);
  ctx.quadraticCurveTo(cx + topW / 2, cy - h / 2, cx + topW / 2 + topInset * 0.3, cy - h / 2 + cornerR);
  ctx.lineTo(cx + w / 2 - cornerR * 0.3, cy + h / 2 - cornerR);
  ctx.quadraticCurveTo(cx + w / 2, cy + h / 2, cx + w / 2 - cornerR, cy + h / 2);
  ctx.lineTo(cx - w / 2 + cornerR, cy + h / 2);
  ctx.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2 + cornerR * 0.3, cy + h / 2 - cornerR);
  ctx.lineTo(cx - topW / 2 - topInset * 0.3, cy - h / 2 + cornerR);
  ctx.quadraticCurveTo(cx - topW / 2, cy - h / 2, cx - topW / 2 + cornerR, cy - h / 2);
  ctx.closePath();

  // Radial gradient (hue 28, brown)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, "hsla(28, 30%, 40%, 0.85)");
  grad.addColorStop(1, "hsla(28, 25%, 28%, 0.55)");
  ctx.fillStyle = grad;
  ctx.fill();

  // 1.5px rim stroke
  ctx.strokeStyle = "hsla(28, 20%, 50%, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ── Draw Coffee Machine ──────────────────────────────────────────────

export function drawCoffeeMachine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
) {
  ctx.save();

  // Dark gray body with rounded corners
  ctx.beginPath();
  ctx.roundRect(x - 9, y - 16, 18, 22, 3);
  ctx.fillStyle = "hsla(0, 0%, 40%, 0.9)";
  ctx.fill();

  // Chrome strip at top
  ctx.fillStyle = "hsla(0, 0%, 72%, 0.85)";
  ctx.fillRect(x - 9, y - 16, 18, 3);

  // Green status panel/screen
  ctx.fillStyle = "hsla(140, 50%, 40%, 0.8)";
  ctx.fillRect(x - 5, y - 11, 10, 5);

  // Gray drip tray
  ctx.fillStyle = "hsla(0, 0%, 50%, 0.7)";
  ctx.fillRect(x - 10, y + 6, 20, 3);

  // White ceramic cup
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 1, 8, 7, 1);
  ctx.fillStyle = "hsla(30, 20%, 92%, 0.9)";
  ctx.fill();

  // Steam wisps (3 curves with sin oscillation)
  for (let i = 0; i < 3; i++) {
    const sx = x - 3 + i * 3;
    const phase = t * 3 + i * 1.2;
    const opacity = 0.3 + Math.sin(phase) * 0.15;

    ctx.beginPath();
    ctx.moveTo(sx, y - 2);
    ctx.quadraticCurveTo(
      sx + Math.sin(phase) * 4,
      y - 10,
      sx + Math.sin(phase * 1.3) * 3,
      y - 18,
    );
    ctx.strokeStyle = `hsla(30, 15%, 80%, ${opacity})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  ctx.restore();
}

// ── Draw Crab (with hat, expression, eyewear, wobble) ────────────────

export function drawCrab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number,
  t: number,
  hat: CrabHat = "none",
  expression: CrabExpression = "normal",
  eyewear: CrabEyewear = "none",
) {
  ctx.save();

  // Body wobble: rotate ±0.08 rad
  const wobble = Math.sin(t * 3) * 0.08;
  ctx.translate(x, y);
  ctx.rotate(wobble);

  // Draw relative to origin (0,0)
  const ox = 0;
  const oy = 0;

  // Body: elliptical (0.55w × 0.4h mapped to size)
  ctx.beginPath();
  ctx.ellipse(ox, oy, size, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Shell highlight
  ctx.beginPath();
  ctx.ellipse(ox - size * 0.15, oy - size * 0.15, size * 0.4, size * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();

  // Claws (animated: sin(t*4) * 0.15)
  const clawAngle = Math.sin(t * 4) * 0.15;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(ox + side * size * 0.9, oy - size * 0.2);
    ctx.rotate(side * (0.5 + clawAngle));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * size * 0.5, -size * 0.3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(side * size * 0.5, -size * 0.3, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }

  // Legs (3 pairs, sin(t*5 + legIndex) * 0.1)
  for (let i = 0; i < 3; i++) {
    const legAngle = Math.sin(t * 5 + i * 1.2) * 0.1;
    for (const side of [-1, 1]) {
      const lx = ox + side * (size * 0.5 + i * size * 0.2);
      const ly = oy + size * 0.3;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + side * size * 0.35, ly + size * 0.4 + legAngle * size);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // ── Expression ─────────────────────────────────────────────────────
  const eyeY = oy - size * 0.15;
  const eyeLX = ox - size * 0.25;
  const eyeRX = ox + size * 0.25;

  if (expression === "happy") {
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY + 1, 2, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY + 1, 2, Math.PI, 0);
    ctx.stroke();
  } else if (expression === "sleepy") {
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(eyeLX - 2, eyeY);
    ctx.lineTo(eyeLX + 2, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeRX - 2, eyeY);
    ctx.lineTo(eyeRX + 2, eyeY);
    ctx.stroke();
  } else if (expression === "surprised") {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.beginPath();
    ctx.arc(eyeLX + 0.3, eyeY, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX + 0.3, eyeY, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Eyewear (drawn over eyes) ──────────────────────────────────────
  if (eyewear === "glasses") {
    const lw = size * 0.03;
    ctx.strokeStyle = "rgba(30, 20, 10, 0.7)";
    ctx.lineWidth = Math.max(lw, 0.8);
    // Left lens
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, 3.2, 0, Math.PI * 2);
    ctx.stroke();
    // Right lens
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, 3.2, 0, Math.PI * 2);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(eyeLX + 3.2, eyeY);
    ctx.lineTo(eyeRX - 3.2, eyeY);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(eyeLX - 3.2, eyeY);
    ctx.lineTo(eyeLX - 3.2 - size * 0.25, eyeY + 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeRX + 3.2, eyeY);
    ctx.lineTo(eyeRX + 3.2 + size * 0.25, eyeY + 1);
    ctx.stroke();
  } else if (eyewear === "monocle") {
    // Gold-rimmed circle on right eye
    ctx.strokeStyle = "hsla(40, 70%, 50%, 0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(eyeRX, eyeY, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    // Dangling chain curve
    ctx.strokeStyle = "hsla(40, 50%, 60%, 0.6)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(eyeRX + 1.5, eyeY + 3.5);
    ctx.quadraticCurveTo(eyeRX + 3, eyeY + size * 0.5, eyeRX + 1, eyeY + size * 0.7);
    ctx.stroke();
  }

  // ── Hat (drawn on top of body + eyes) ──────────────────────────────
  const hatY = oy - size * 0.7;

  if (hat === "tophat") {
    ctx.fillStyle = "rgba(25, 25, 35, 0.85)";
    ctx.fillRect(ox - size * 0.3, hatY - size * 0.55, size * 0.6, size * 0.5);
    ctx.fillRect(ox - size * 0.45, hatY - size * 0.08, size * 0.9, size * 0.12);
    ctx.fillStyle = "rgba(100, 100, 120, 0.4)";
    ctx.fillRect(ox - size * 0.25, hatY - size * 0.18, size * 0.5, size * 0.06);
  } else if (hat === "chef") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(ox - size * 0.28, hatY - size * 0.35, size * 0.56, size * 0.35);
    ctx.beginPath();
    ctx.ellipse(ox, hatY - size * 0.35, size * 0.38, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  } else if (hat === "hardhat") {
    ctx.fillStyle = "hsla(48, 95%, 55%, 0.9)";
    ctx.beginPath();
    ctx.ellipse(ox, hatY - size * 0.15, size * 0.4, size * 0.28, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ox, hatY - size * 0.02, size * 0.5, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "hsla(48, 90%, 70%, 0.6)";
    ctx.fillRect(ox - size * 0.25, hatY - size * 0.25, size * 0.5, size * 0.06);
  } else if (hat === "crown") {
    ctx.fillStyle = "hsla(45, 90%, 50%, 0.9)";
    ctx.beginPath();
    ctx.moveTo(ox - size * 0.35, hatY);
    ctx.lineTo(ox - size * 0.3, hatY - size * 0.35);
    ctx.lineTo(ox - size * 0.1, hatY - size * 0.15);
    ctx.lineTo(ox, hatY - size * 0.45);
    ctx.lineTo(ox + size * 0.1, hatY - size * 0.15);
    ctx.lineTo(ox + size * 0.3, hatY - size * 0.35);
    ctx.lineTo(ox + size * 0.35, hatY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "hsla(0, 70%, 50%, 0.8)";
    ctx.beginPath();
    ctx.arc(ox, hatY - size * 0.1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "hsla(210, 70%, 50%, 0.8)";
    ctx.beginPath();
    ctx.arc(ox - size * 0.18, hatY - size * 0.06, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ox + size * 0.18, hatY - size * 0.06, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Draw Expression Emoji Indicator ──────────────────────────────────

export function drawExpressionEmoji(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  expression: CrabExpression,
  crabSize: number,
) {
  let emoji: string;
  if (expression === "happy") emoji = "😄";
  else if (expression === "surprised") emoji = "😲";
  else if (expression === "sleepy") emoji = "😴";
  else emoji = "💬";

  const fontSize = Math.max(crabSize * 0.9, 6);
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x + crabSize * 0.7, y - crabSize * 0.8);
  ctx.restore();
}

// ── Draw Person ──────────────────────────────────────────────────────

export function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number,
) {
  // Body circle
  ctx.beginPath();
  ctx.arc(x, y + size * 0.2, size * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Head circle
  ctx.beginPath();
  ctx.arc(x, y - size * 0.45, size * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Eye highlight (white, 30% opacity per spec)
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.5, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fill();
}

// ── Draw Chat Bubble ─────────────────────────────────────────────────

export function drawChatBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  alpha: number,
) {
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 9px 'Inter', system-ui, sans-serif";
  const metrics = ctx.measureText(text);
  const pw = metrics.width + 14;
  const ph = 18;
  const bx = x - pw / 2;
  const by = y - ph;

  // Bubble background (0.92 opacity)
  ctx.beginPath();
  ctx.roundRect(bx, by, pw, ph, 6);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  // 0.8px border in warm muted color
  ctx.strokeStyle = "hsla(30, 20%, 60%, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Tail triangle pointing down
  ctx.beginPath();
  ctx.moveTo(x - 3, by + ph);
  ctx.lineTo(x, by + ph + 4);
  ctx.lineTo(x + 3, by + ph);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();

  // Text (9px Inter, dark)
  ctx.fillStyle = "rgba(40,30,20,0.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, by + ph / 2);

  ctx.restore();
}

// ── Draw Audit Badge ─────────────────────────────────────────────────

export function drawAuditBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  icon: "check" | "warning" | "policy",
  alpha: number,
) {
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 10px 'Inter', system-ui, sans-serif";
  const metrics = ctx.measureText(text);
  const iconSize = 10;
  const pw = iconSize + metrics.width + 16;
  const ph = 20;
  const bx = x - pw / 2;
  const by = y - ph / 2;

  // Rounded rect (6px radius) with colored background
  ctx.beginPath();
  ctx.roundRect(bx, by, pw, ph, 6);

  if (icon === "check") {
    ctx.fillStyle = "rgba(220,252,231,0.95)";
  } else if (icon === "warning") {
    ctx.fillStyle = "rgba(254,243,199,0.95)";
  } else {
    ctx.fillStyle = "rgba(219,234,254,0.95)";
  }
  ctx.fill();
  // 1px border
  if (icon === "check") ctx.strokeStyle = "hsla(142, 40%, 60%, 0.4)";
  else if (icon === "warning") ctx.strokeStyle = "hsla(38, 50%, 60%, 0.4)";
  else ctx.strokeStyle = "hsla(215, 40%, 60%, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Icon (10px area on left)
  const iconX = bx + 11;
  const iconY = by + ph / 2;

  if (icon === "check") {
    ctx.beginPath();
    ctx.arc(iconX, iconY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "hsla(142, 60%, 40%, 0.9)";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(iconX - 2.5, iconY);
    ctx.lineTo(iconX - 0.5, iconY + 2);
    ctx.lineTo(iconX + 3, iconY - 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (icon === "warning") {
    ctx.beginPath();
    ctx.moveTo(iconX, iconY - 4.5);
    ctx.lineTo(iconX + 5, iconY + 3.5);
    ctx.lineTo(iconX - 5, iconY + 3.5);
    ctx.closePath();
    ctx.fillStyle = "hsla(38, 90%, 50%, 0.9)";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 7px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", iconX, iconY + 0.5);
  } else {
    ctx.fillStyle = "hsla(215, 60%, 50%, 0.9)";
    ctx.fillRect(iconX - 3.5, iconY - 4, 7, 8);
    ctx.fillStyle = "white";
    ctx.fillRect(iconX - 2, iconY - 2.5, 4, 1);
    ctx.fillRect(iconX - 2, iconY, 3, 1);
  }

  // Text (bold 10px Inter)
  ctx.font = "bold 10px 'Inter', system-ui, sans-serif";
  if (icon === "check") ctx.fillStyle = "hsla(142, 50%, 25%, 0.9)";
  else if (icon === "warning") ctx.fillStyle = "hsla(38, 60%, 25%, 0.9)";
  else ctx.fillStyle = "hsla(215, 50%, 25%, 0.9)";

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, bx + iconSize + 10, by + ph / 2);

  ctx.restore();
}

// ── Draw Table Counter (hue-aware, responsive font) ──────────────────

export function drawCounter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  hue: number,
  isMobile: boolean,
) {
  ctx.save();
  const fontSize = isMobile ? 13 : 16;
  ctx.font = `bold ${fontSize}px 'Inter', system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `hsla(${hue}, 15%, 95%, 0.85)`;
  ctx.fillText(Math.floor(value).toString(), x, y);
  ctx.restore();
}
