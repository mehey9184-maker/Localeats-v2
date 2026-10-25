/**
 * Canvas Rendering Engine for LocalEats Promo Clips Studio
 * Renders 1920x1080 30fps frames with authentic LocalEats customer app
 * and merchant dashboard UI components.
 */

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  frame: number;
  totalFrames: number;
  progress: number; // 0 to 1
  timeSeconds: number;
}

// 1. Core Canvas Geometry & Utility Helpers
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | number[]
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    // Fallback for environments lacking ctx.roundRect
    const r = typeof radius === "number" ? radius : radius[0] || 0;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
  ctx.closePath();
}

export function drawLandscapeBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  activeStep: number,
  categoryBadge: string = "AUTHENTIC TOWNSHIP FOOD APP"
) {
  // Deep premium dark studio gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, "#090d16");
  bgGrad.addColorStop(0.5, "#0d131f");
  bgGrad.addColorStop(1, "#070a10");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft ambient brand glow (LocalEats warm orange top-left and right)
  const glow1 = ctx.createRadialGradient(250, 180, 10, 250, 180, 600);
  glow1.addColorStop(0, "rgba(234, 88, 12, 0.12)");
  glow1.addColorStop(1, "rgba(234, 88, 12, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, w, h);

  const glow2 = ctx.createRadialGradient(1450, 540, 20, 1450, 540, 700);
  glow2.addColorStop(0, "rgba(249, 115, 22, 0.08)");
  glow2.addColorStop(1, "rgba(249, 115, 22, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid mesh lines for clean tech aesthetic
  ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
  ctx.lineWidth = 1;
  for (let x = 60; x < w; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 60; y < h; y += 120) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Top header studio watermark
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("LOCALEATS SA • PROMOTIONAL PRODUCT SHOWCASE", 90, 60);

  // Category badge top-right
  ctx.save();
  const badgeText = categoryBadge.toUpperCase();
  ctx.font = "900 11px system-ui, -apple-system, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 30;
  drawRoundedRect(ctx, w - 90 - badgeW, 42, badgeW, 28, 14);
  ctx.fillStyle = "rgba(234, 88, 12, 0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(234, 88, 12, 0.35)";
  ctx.stroke();
  ctx.fillStyle = "#fb923c";
  ctx.fillText(badgeText, w - 90 - badgeW + 15, 60);
  ctx.restore();
}

export function drawPresentationSidebar(
  ctx: CanvasRenderingContext2D,
  clipNumber: number,
  title: string,
  subtitle: string,
  highlights: string[]
) {
  const startX = 90;
  const startY = 160;

  // Step indicator pill
  ctx.save();
  const stepLabel = `CLIP ${clipNumber.toString().padStart(2, "0")} OF 06`;
  ctx.font = "900 12px system-ui, -apple-system, sans-serif";
  const stepW = ctx.measureText(stepLabel).width + 26;
  drawRoundedRect(ctx, startX, startY, stepW, 28, 14);
  ctx.fillStyle = "rgba(249, 115, 22, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "rgba(249, 115, 22, 0.5)";
  ctx.stroke();
  ctx.fillStyle = "#ffedd5";
  ctx.fillText(stepLabel, startX + 13, startY + 18);
  ctx.restore();

  // Main Section Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 44px system-ui, -apple-system, sans-serif";
  const words = title.split(" ");
  let line1 = "";
  let line2 = "";
  if (words.length > 3) {
    line1 = words.slice(0, 3).join(" ");
    line2 = words.slice(3).join(" ");
  } else {
    line1 = title;
  }
  ctx.fillText(line1, startX, startY + 80);
  if (line2) {
    ctx.fillText(line2, startX, startY + 135);
  }

  // Accent divider line
  const divY = line2 ? startY + 160 : startY + 110;
  const lineGrad = ctx.createLinearGradient(startX, divY, startX + 400, divY);
  lineGrad.addColorStop(0, "#ea580c");
  lineGrad.addColorStop(0.7, "#f97316");
  lineGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(startX, divY, 260, 4);

  // Subtitle / Description text
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 17px system-ui, -apple-system, sans-serif";
  ctx.fillText(subtitle, startX, divY + 38);

  // Feature highlight bullet cards
  const cardStartY = divY + 80;
  highlights.slice(0, 3).forEach((item, idx) => {
    const cy = cardStartY + idx * 72;
    drawRoundedRect(ctx, startX, cy, 540, 58, 16);
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    // Icon circle
    drawRoundedRect(ctx, startX + 12, cy + 11, 36, 36, 12);
    ctx.fillStyle = "rgba(234, 88, 12, 0.2)";
    ctx.fill();

    // Checkmark
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX + 23, cy + 29);
    ctx.lineTo(startX + 28, cy + 35);
    ctx.lineTo(startX + 38, cy + 23);
    ctx.stroke();

    // Text
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.fillText(item, startX + 60, cy + 34);
  });

  // Step Progression Dots at bottom
  const dotsY = 960;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("SYNTHESIA WORKFLOW PROGRESSION", startX, dotsY - 14);

  for (let i = 1; i <= 6; i++) {
    const dotX = startX + (i - 1) * 36;
    ctx.beginPath();
    ctx.arc(dotX + 8, dotsY + 8, i === clipNumber ? 9 : 6, 0, Math.PI * 2);
    if (i === clipNumber) {
      ctx.fillStyle = "#f97316";
      ctx.fill();
      ctx.strokeStyle = "#ffedd5";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (i < clipNumber) {
      ctx.fillStyle = "#10b981";
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();
    }
  }
}

// 2. High-Fidelity Mobile Phone Mockup Frame
export interface PhoneBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  innerX: number;
  innerY: number;
  innerWidth: number;
  innerHeight: number;
}

export function getPhoneBounds(canvasW: number, canvasH: number): PhoneBounds {
  const width = 420;
  const height = 860;
  const x = canvasW - width - 120; // Positioned right-side of landscape showcase
  const y = (canvasH - height) / 2 + 15;
  const border = 14;

  return {
    x,
    y,
    width,
    height,
    innerX: x + border,
    innerY: y + border,
    innerWidth: width - border * 2,
    innerHeight: height - border * 2,
  };
}

export function drawPhoneFrame(ctx: CanvasRenderingContext2D, bounds: PhoneBounds) {
  const { x, y, width, height, innerX, innerY, innerWidth, innerHeight } = bounds;

  // Outer drop shadow for realistic 3D depth
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 25;
  drawRoundedRect(ctx, x, y, width, height, 54);
  ctx.fillStyle = "#020408";
  ctx.fill();
  ctx.restore();

  // Premium titanium border styling
  ctx.save();
  drawRoundedRect(ctx, x, y, width, height, 54);
  const borderGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  borderGrad.addColorStop(0, "#475569");
  borderGrad.addColorStop(0.5, "#1e293b");
  borderGrad.addColorStop(1, "#334155");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Phone Screen Clip Area
  ctx.save();
  drawRoundedRect(ctx, innerX, innerY, innerWidth, innerHeight, 42);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
  // (Screen content rendered inside here by caller)
  ctx.restore();

  // Phone Dynamic Island / Camera Notch (drawn over screen top)
  const islandW = 124;
  const islandH = 30;
  const islandX = innerX + (innerWidth - islandW) / 2;
  const islandY = innerY + 12;

  drawRoundedRect(ctx, islandX, islandY, islandW, islandH, 15);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // Camera lens reflection dot
  ctx.beginPath();
  ctx.arc(islandX + islandW - 20, islandY + 15, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(islandX + islandW - 20, islandY + 15, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  // Phone Home Bar indicator at bottom
  const barW = 140;
  const barH = 5;
  const barX = innerX + (innerWidth - barW) / 2;
  const barY = innerY + innerHeight - 10;
  drawRoundedRect(ctx, barX, barY, barW, barH, 2.5);
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fill();
}

// 3. Desktop Browser Frame for Merchant Dashboard
export function drawDesktopBrowserFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  urlText: string = "https://merchant.localeats.co.za/orders"
) {
  // Window shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 25;
  drawRoundedRect(ctx, x, y, w, h, 20);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.restore();

  // Outer border
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 20);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Top Titlebar
  const barH = 52;
  ctx.save();
  drawRoundedRect(ctx, x, y, w, barH, [20, 20, 0, 0]);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  // Window dots (Mac-style)
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x + 24, y + 26, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(x + 44, y + 26, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(x + 64, y + 26, 6, 0, Math.PI * 2);
  ctx.fill();

  // URL Bar in center
  const urlW = Math.min(650, w - 240);
  const urlX = x + (w - urlW) / 2;
  drawRoundedRect(ctx, urlX, y + 10, urlW, 32, 10);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Padlock icon
  ctx.fillStyle = "#10b981";
  ctx.font = "12px system-ui";
  ctx.fillText("🔒", urlX + 12, y + 31);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText(urlText, urlX + 36, y + 31);
  ctx.restore();
}

// 4. Interactive Cursor / Touch Ripple Effect
export function drawTouchCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isClicking: boolean = false,
  clickAge: number = 0 // 0 to 1
) {
  ctx.save();
  if (isClicking) {
    // Expanding touch ripple wave
    const radius = 18 + clickAge * 28;
    const alpha = Math.max(0, 0.6 - clickAge * 0.6);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(234, 88, 12, ${alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 1.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Cursor pointer dot / glass circle
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.arc(x, y, isClicking ? 13 : 16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fill();
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Core inner amber dot
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ea580c";
  ctx.fill();
  ctx.restore();
}

// 5. Procedural Delicious Kota Illustration (Clean vector canvas rendering)
export function drawKotaIllustration(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  const scale = size / 100;
  ctx.scale(scale, scale);

  // Quarter Loaf Bread Base (Golden toasted crust)
  ctx.beginPath();
  ctx.moveTo(-45, 15);
  ctx.lineTo(-40, 40);
  ctx.quadraticCurveTo(0, 48, 40, 40);
  ctx.lineTo(45, 15);
  ctx.closePath();
  ctx.fillStyle = "#c27803";
  ctx.fill();
  ctx.strokeStyle = "#854d0e";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Melted Yellow Cheddar Cheese dripping
  ctx.beginPath();
  ctx.moveTo(-42, 10);
  ctx.quadraticCurveTo(-20, 24, 0, 12);
  ctx.quadraticCurveTo(20, 28, 42, 10);
  ctx.lineTo(40, 18);
  ctx.quadraticCurveTo(20, 36, 0, 22);
  ctx.quadraticCurveTo(-20, 32, -40, 18);
  ctx.closePath();
  ctx.fillStyle = "#facc15";
  ctx.fill();

  // Sliced Pink Russian Sausage
  ctx.beginPath();
  ctx.ellipse(-15, 2, 22, 10, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = "#e11d48";
  ctx.fill();
  ctx.strokeStyle = "#9f1239";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Golden Hot Chips (Slap chips bursting)
  ctx.fillStyle = "#fde047";
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 2;

  // Chip 1
  ctx.fillRect(-28, -25, 9, 32);
  ctx.strokeRect(-28, -25, 9, 32);

  // Chip 2 (tilted)
  ctx.save();
  ctx.translate(-8, -12);
  ctx.rotate(0.2);
  ctx.fillRect(-4, -18, 9, 36);
  ctx.strokeRect(-4, -18, 9, 36);
  ctx.restore();

  // Chip 3 (tilted right)
  ctx.save();
  ctx.translate(14, -10);
  ctx.rotate(-0.18);
  ctx.fillRect(-4, -16, 9, 34);
  ctx.strokeRect(-4, -16, 9, 34);
  ctx.restore();

  // Fried Egg with vibrant yolk
  ctx.beginPath();
  ctx.ellipse(12, 6, 18, 12, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, 5, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ea580c";
  ctx.fill();

  // House Relish / Atchar Specks
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(-18, -4, 4, 4);
  ctx.fillRect(4, 10, 4, 4);
  ctx.fillRect(-5, 8, 3, 3);

  // Bread Top Cap
  ctx.beginPath();
  ctx.moveTo(-44, -18);
  ctx.quadraticCurveTo(0, -42, 44, -18);
  ctx.lineTo(40, -10);
  ctx.quadraticCurveTo(0, -32, -40, -10);
  ctx.closePath();
  ctx.fillStyle = "#d97706";
  ctx.fill();
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();
}
