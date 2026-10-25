import {
  RenderContext,
  drawLandscapeBackdrop,
  drawDesktopBrowserFrame,
  drawRoundedRect,
  drawTouchCursor,
} from "../engine/canvasRenderer";
import { PROMO_CLIPS_CATALOG } from "../mockData";

export function renderClip5Frame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) {
  const w = 1920;
  const h = 1080;
  const progress = Math.min(1, Math.max(0, frame / totalFrames));

  // 1. Showcase Backdrop
  drawLandscapeBackdrop(ctx, w, h, 5, "MERCHANT DASHBOARD • KITCHEN ORDER DESK");

  // 2. Large Desktop Browser Window Frame (1920x1080 Landscape Showpiece)
  const winX = 90;
  const winY = 90;
  const winW = 1740;
  const winH = 920;

  drawDesktopBrowserFrame(ctx, winX, winY, winW, winH, "https://merchant.localeats.co.za/orders");

  // Content Area inside window
  const contentY = winY + 52;
  const contentH = winH - 52;

  ctx.save();
  drawRoundedRect(ctx, winX, contentY, winW, contentH, [0, 0, 20, 20]);
  ctx.clip();

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(winX, contentY, winW, contentH);

  // Merchant Portal Header Bar
  const headH = 70;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(winX, contentY, winW, headH);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.strokeRect(winX, contentY, winW, headH);

  // Logo & Shop Identity
  drawRoundedRect(ctx, winX + 24, contentY + 16, 38, 38, 12);
  ctx.fillStyle = "#ea580c";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("🔥", winX + 32, contentY + 41);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("Mama's Kota Kitchen", winX + 74, contentY + 36);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("MERCHANT DISPATCH PORTAL • TEMBISA", winX + 74, contentY + 52);

  // Store Online Status Pill
  drawRoundedRect(ctx, winX + 370, contentY + 22, 115, 28, 14);
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.fill();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(winX + 384, contentY + 36, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#10b981";
  ctx.fill();

  ctx.fillStyle = "#10b981";
  ctx.font = "900 11px system-ui";
  ctx.fillText("STORE OPEN", winX + 396, contentY + 40);

  // Navigation Tabs in Header
  const navTabs = [
    { name: "Live Orders", count: 1, active: true },
    { name: "Menu Management", active: false },
    { name: "Analytics", active: false },
  ];
  let tabX = winX + winW - 520;
  navTabs.forEach((tab) => {
    drawRoundedRect(ctx, tabX, contentY + 18, 140, 36, 12);
    if (tab.active) {
      ctx.fillStyle = "#ea580c";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
    }
    ctx.font = "bold 13px system-ui";
    ctx.fillText(tab.name, tabX + 16, contentY + 41);
    if (tab.count) {
      drawRoundedRect(ctx, tabX + 104, contentY + 25, 22, 22, 11);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.fillStyle = "#ea580c";
      ctx.font = "900 12px system-ui";
      ctx.fillText(String(tab.count), tabX + 111, contentY + 40);
    }
    tabX += 150;
  });

  // Sound Alert Indicator
  drawRoundedRect(ctx, winX + winW - 60, contentY + 20, 34, 34, 10);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px system-ui";
  ctx.fillText("🔔", winX + winW - 52, contentY + 43);

  // Sub-header / Filter bar
  const subY = contentY + headH;
  ctx.fillStyle = "#141e33";
  ctx.fillRect(winX, subY, winW, 50);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui";
  ctx.fillText("⚡ Active Orders Board • Real-time Supabase Engine", winX + 24, subY + 30);

  // Order Board Columns
  const boardY = subY + 65;
  const colW = (winW - 64) / 3;

  // State of the order based on progress:
  // progress < 0.65: In Pending column
  // progress >= 0.65: In Preparing column
  const isAccepted = progress > 0.65;

  // --- Column 1: Pending Orders ---
  const col1X = winX + 24;
  drawRoundedRect(ctx, col1X, boardY, colW, 700, 16);
  ctx.fillStyle = "#1e293b";
  ctx.fill();
  ctx.strokeStyle = !isAccepted ? "rgba(234, 88, 12, 0.4)" : "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Column Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 16px system-ui";
  ctx.fillText("Pending Review", col1X + 20, boardY + 36);

  drawRoundedRect(ctx, col1X + colW - 48, boardY + 18, 28, 24, 12);
  ctx.fillStyle = !isAccepted ? "#ea580c" : "rgba(255, 255, 255, 0.1)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px system-ui";
  ctx.fillText(!isAccepted ? "1" : "0", col1X + colW - 39, boardY + 35);

  // --- Column 2: Preparing / Cooking ---
  const col2X = col1X + colW + 8;
  drawRoundedRect(ctx, col2X, boardY, colW, 700, 16);
  ctx.fillStyle = "#1e293b";
  ctx.fill();
  ctx.strokeStyle = isAccepted ? "rgba(234, 88, 12, 0.6)" : "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 16px system-ui";
  ctx.fillText("Kitchen Cooking", col2X + 20, boardY + 36);

  drawRoundedRect(ctx, col2X + colW - 48, boardY + 18, 28, 24, 12);
  ctx.fillStyle = isAccepted ? "#ea580c" : "rgba(255, 255, 255, 0.1)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px system-ui";
  ctx.fillText(isAccepted ? "1" : "0", col2X + colW - 39, boardY + 35);

  // --- Column 3: Ready for Pickup ---
  const col3X = col2X + colW + 8;
  drawRoundedRect(ctx, col3X, boardY, colW, 700, 16);
  ctx.fillStyle = "#1e293b";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 16px system-ui";
  ctx.fillText("Ready for Pickup", col3X + 20, boardY + 36);

  drawRoundedRect(ctx, col3X + colW - 48, boardY + 18, 28, 24, 12);
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px system-ui";
  ctx.fillText("0", col3X + colW - 39, boardY + 35);

  // --- Order Card #LE-7842 ---
  // Position transitions smoothly from Col 1 to Col 2 when accepted
  let cardX = col1X + 12;
  let cardY = boardY + 60;
  if (isAccepted) {
    const slideP = Math.min(1, (progress - 0.65) / 0.15);
    cardX = col1X + 12 + (colW + 8) * slideP;
  }

  const cardW = colW - 24;
  const cardH = 340;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.strokeStyle = isAccepted ? "#10b981" : "#ea580c";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top Card Header: Order ID & Tags
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 18px system-ui";
  ctx.fillText("#LE-7842", cardX + 18, cardY + 34);

  // Collection Badge
  drawRoundedRect(ctx, cardX + 115, cardY + 16, 120, 26, 10);
  ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.stroke();
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 11px system-ui";
  ctx.fillText("🛍️ COLLECTION", cardX + 124, cardY + 33);

  // Pay at Store Badge
  drawRoundedRect(ctx, cardX + 242, cardY + 16, 125, 26, 10);
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.stroke();
  ctx.fillStyle = "#34d399";
  ctx.font = "900 11px system-ui";
  ctx.fillText("💵 PAY AT STORE", cardX + 250, cardY + 33);

  // Customer Name & Phone
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui";
  ctx.fillText("Thabo Mokoena", cardX + 18, cardY + 70);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 13px system-ui";
  ctx.fillText("📞 +27 82 345 6789 • Tembisa", cardX + 18, cardY + 92);

  // Order Items Divider
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.moveTo(cardX + 18, cardY + 108);
  ctx.lineTo(cardX + cardW - 18, cardY + 108);
  ctx.stroke();

  // Item Line: 1x Special Double Cheese Kota
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 15px system-ui";
  ctx.fillText("1x Special Double Cheese Kota", cardX + 18, cardY + 138);

  ctx.fillStyle = "#ea580c";
  ctx.font = "900 16px system-ui";
  ctx.fillText("R 55.00", cardX + cardW - 85, cardY + 138);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 12px system-ui";
  ctx.fillText("Double chips, double cheese, Russian, egg & relish", cardX + 18, cardY + 158);

  // Order Notes Banner
  drawRoundedRect(ctx, cardX + 18, cardY + 175, cardW - 36, 42, 10);
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "italic 12px system-ui";
  ctx.fillText("💬 Customer Note: 'Collection order - please make extra crispy'", cardX + 28, cardY + 201);

  // Total
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui";
  ctx.fillText("Amount to Collect at Counter:", cardX + 18, cardY + 245);
  ctx.fillStyle = "#ea580c";
  ctx.font = "900 22px system-ui";
  ctx.fillText("R 55.00", cardX + cardW - 110, cardY + 248);

  // Action Button
  const btnY = cardY + 268;
  const isClicking = progress > 0.55 && progress < 0.65;

  drawRoundedRect(ctx, cardX + 18, btnY, cardW - 36, 52, 16);
  if (!isAccepted) {
    ctx.fillStyle = isClicking ? "#c2410c" : "#ea580c";
  } else {
    ctx.fillStyle = "#10b981";
  }
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  if (!isAccepted) {
    ctx.fillText("Accept Order & Start Cooking", cardX + cardW / 2, btnY + 32);
  } else {
    ctx.fillText("👨‍🍳 In Preparation (15 Min Prep Active)", cardX + cardW / 2, btnY + 32);
  }
  ctx.textAlign = "left";

  // Simulated Vendor Cursor
  if (progress > 0.35 && progress < 0.8) {
    let cx = cardX + cardW / 2;
    let cy = btnY + 26;
    drawTouchCursor(ctx, cx, cy, isClicking, (progress - 0.55) * 10);
  }

  ctx.restore(); // end browser clip
}
