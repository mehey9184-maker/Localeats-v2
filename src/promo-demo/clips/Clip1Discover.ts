import {
  RenderContext,
  drawLandscapeBackdrop,
  drawPresentationSidebar,
  getPhoneBounds,
  drawPhoneFrame,
  drawRoundedRect,
  drawTouchCursor,
  drawKotaIllustration,
} from "../engine/canvasRenderer";
import { PROMO_CLIPS_CATALOG } from "../mockData";

export function renderClip1Frame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) {
  const w = 1920;
  const h = 1080;
  const progress = Math.min(1, Math.max(0, frame / totalFrames));
  const timeSeconds = (frame / 30).toFixed(1);

  // 1. Draw 1920x1080 Showcase Backdrop
  drawLandscapeBackdrop(ctx, w, h, 1, "CUSTOMER APP • DISCOVERY INTERFACE");

  // 2. Left Presentation Sidebar
  const clip = PROMO_CLIPS_CATALOG[0];
  drawPresentationSidebar(ctx, clip.clipNumber, clip.title, clip.subtitle, clip.keyHighlights);

  // 3. Right-side Phone Frame
  const pb = getPhoneBounds(w, h);
  drawPhoneFrame(ctx, pb);

  // 4. Render Inside Phone Screen
  ctx.save();
  drawRoundedRect(ctx, pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight, 42);
  ctx.clip();

  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight);

  // Status Bar (9:41, WiFi, Battery)
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("9:41", pb.innerX + 24, pb.innerY + 28);
  ctx.font = "11px system-ui";
  ctx.fillText("5G 📶 100% 🔋", pb.innerX + pb.innerWidth - 90, pb.innerY + 28);

  // Flush Edge-to-Edge Top Bar
  const headerY = pb.innerY + 48;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pb.innerX, headerY, pb.innerWidth, 72);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.strokeRect(pb.innerX, headerY, pb.innerWidth, 72);

  // Brand Name & Flame Logo
  ctx.fillStyle = "#ea580c";
  drawRoundedRect(ctx, pb.innerX + 16, headerY + 14, 30, 30, 10);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px system-ui";
  ctx.fillText("🔥", pb.innerX + 22, headerY + 35);

  ctx.fillStyle = "#0f172a";
  ctx.font = "900 17px system-ui, -apple-system, sans-serif";
  ctx.fillText("LocalEats", pb.innerX + 54, headerY + 28);

  // Delivery Address Selector pill
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("📍 246 Jiyane St, Tembisa", pb.innerX + 54, headerY + 43);

  // Search Bar
  const searchY = headerY + 68;
  drawRoundedRect(ctx, pb.innerX + 16, searchY, pb.innerWidth - 32, 42, 16);
  ctx.fillStyle = "#f1f5f9";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("🔍 Search kotas, braai, local food...", pb.innerX + 30, searchY + 26);

  // Horizontal Category Chips Row
  const chipsY = searchY + 54;
  const categories = [
    { name: "All 🍽️", active: true },
    { name: "Kota 🍞", active: false },
    { name: "Braai 🔥", active: false },
    { name: "Chips 🍟", active: false },
  ];
  let chipX = pb.innerX + 16;
  categories.forEach((cat) => {
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    const tw = ctx.measureText(cat.name).width;
    const cw = tw + 24;

    drawRoundedRect(ctx, chipX, chipsY, cw, 34, 17);
    if (cat.active) {
      ctx.fillStyle = "#ea580c";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#475569";
    }
    ctx.fillText(cat.name, chipX + 12, chipsY + 21);
    chipX += cw + 8;
  });

  // Section Header: Local Merchants
  const sectionY = chipsY + 48;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "900 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("LOCAL MERCHANTS", pb.innerX + 16, sectionY + 12);
  drawRoundedRect(ctx, pb.innerX + pb.innerWidth - 90, sectionY, 74, 20, 10);
  ctx.fillStyle = "#ffedd5";
  ctx.fill();
  ctx.fillStyle = "#c2410c";
  ctx.font = "900 10px system-ui, -apple-system, sans-serif";
  ctx.fillText("12 ONLINE", pb.innerX + pb.innerWidth - 82, sectionY + 14);

  // Simulated Scroll Offset
  // Progress 0 to 0.3: scroll down slightly, 0.3 to 0.7: scroll further, 0.7 to 1.0: scroll back to top
  let scrollY = 0;
  if (progress < 0.25) {
    scrollY = 0;
  } else if (progress < 0.6) {
    const p = (progress - 0.25) / 0.35;
    scrollY = Math.sin(p * Math.PI * 0.5) * 110;
  } else if (progress < 0.85) {
    const p = (progress - 0.6) / 0.25;
    scrollY = 110 - Math.sin(p * Math.PI * 0.5) * 110;
  } else {
    scrollY = 0;
  }

  // Scroll View Container
  const feedTopY = sectionY + 24;
  ctx.save();
  ctx.rect(pb.innerX, feedTopY, pb.innerWidth, pb.innerHeight - (feedTopY - pb.innerY) - 60);
  ctx.clip();

  // --- Store Card 1: Mama's Kota Kitchen ---
  const card1Y = feedTopY + 8 - scrollY;
  const cardW = pb.innerWidth - 32;
  const cardH = 260;

  drawRoundedRect(ctx, pb.innerX + 16, card1Y, cardW, cardH, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = progress > 0.8 ? "#ea580c" : "#f1f5f9";
  ctx.lineWidth = progress > 0.8 ? 2 : 1;
  ctx.stroke();

  // Image Area for Card 1
  drawRoundedRect(ctx, pb.innerX + 16, card1Y, cardW, 140, [24, 24, 0, 0]);
  const imgGrad1 = ctx.createLinearGradient(pb.innerX, card1Y, pb.innerX + cardW, card1Y + 140);
  imgGrad1.addColorStop(0, "#fef3c7");
  imgGrad1.addColorStop(1, "#fed7aa");
  ctx.fillStyle = imgGrad1;
  ctx.fill();

  // Draw Kota Graphic in card 1
  drawKotaIllustration(ctx, pb.innerX + 16 + cardW / 2, card1Y + 70, 75);

  // Rating badge overlay
  drawRoundedRect(ctx, pb.innerX + cardW - 75, card1Y + 12, 75, 26, 12);
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fill();
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 11px system-ui";
  ctx.fillText("★ 4.8 (142)", pb.innerX + cardW - 68, card1Y + 29);

  // Prep time badge
  drawRoundedRect(ctx, pb.innerX + 28, card1Y + 12, 90, 26, 12);
  ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 10px system-ui";
  ctx.fillText("⚡ 15-20 MIN", pb.innerX + 36, card1Y + 29);

  // Store 1 Details
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 17px system-ui, -apple-system, sans-serif";
  ctx.fillText("Mama's Kota Kitchen", pb.innerX + 28, card1Y + 168);

  ctx.fillStyle = "#64748b";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Kota • 246 Jiyane St, Tembisa", pb.innerX + 28, card1Y + 188);

  // Menu preview chips
  drawRoundedRect(ctx, pb.innerX + 28, card1Y + 202, 120, 26, 10);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 10px system-ui";
  ctx.fillText("Classic Kota R35", pb.innerX + 36, card1Y + 219);

  drawRoundedRect(ctx, pb.innerX + 154, card1Y + 202, 175, 26, 10);
  ctx.fillStyle = "#fff7ed";
  ctx.fill();
  ctx.strokeStyle = "#fed7aa";
  ctx.stroke();
  ctx.fillStyle = "#ea580c";
  ctx.font = "900 10px system-ui";
  ctx.fillText("Special Double Cheese R55 ⭐", pb.innerX + 162, card1Y + 219);

  // --- Store Card 2: Tembisa Braai Masters ---
  const card2Y = card1Y + cardH + 16;
  drawRoundedRect(ctx, pb.innerX + 16, card2Y, cardW, cardH, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Image Area for Card 2
  drawRoundedRect(ctx, pb.innerX + 16, card2Y, cardW, 140, [24, 24, 0, 0]);
  const imgGrad2 = ctx.createLinearGradient(pb.innerX, card2Y, pb.innerX + cardW, card2Y + 140);
  imgGrad2.addColorStop(0, "#fee2e2");
  imgGrad2.addColorStop(1, "#fecaca");
  ctx.fillStyle = imgGrad2;
  ctx.fill();

  // Braai flame graphic
  ctx.font = "52px system-ui";
  ctx.fillText("🥩🔥", pb.innerX + cardW / 2 - 20, card2Y + 85);

  drawRoundedRect(ctx, pb.innerX + cardW - 75, card2Y + 12, 75, 26, 12);
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fill();
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 11px system-ui";
  ctx.fillText("★ 4.9 (98)", pb.innerX + cardW - 68, card2Y + 29);

  // Store 2 Details
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 17px system-ui, -apple-system, sans-serif";
  ctx.fillText("Tembisa Braai Masters", pb.innerX + 28, card2Y + 168);

  ctx.fillStyle = "#64748b";
  ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Shisa Nyama • 89 RTJ Makhabela Dr", pb.innerX + 28, card2Y + 188);

  // Menu chips
  drawRoundedRect(ctx, pb.innerX + 28, card2Y + 202, 145, 26, 10);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 10px system-ui";
  ctx.fillText("Chuck Beef Plate R85", pb.innerX + 36, card2Y + 219);

  drawRoundedRect(ctx, pb.innerX + 180, card2Y + 202, 140, 26, 10);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 10px system-ui";
  ctx.fillText("Boerewors Roll R45", pb.innerX + 188, card2Y + 219);

  ctx.restore(); // end scroll view

  // Bottom Navigation Bar (Unified 5-Tab LocalEats bar)
  const navY = pb.innerY + pb.innerHeight - 60;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pb.innerX, navY, pb.innerWidth, 60);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.strokeRect(pb.innerX, navY, pb.innerWidth, 60);

  const tabs = [
    { label: "Home", icon: "🏠", active: true },
    { label: "Discover", icon: "🧭", active: false },
    { label: "Map", icon: "📍", active: false },
    { label: "Orders", icon: "📦", active: false },
    { label: "Profile", icon: "👤", active: false },
  ];
  const tabStepW = pb.innerWidth / tabs.length;
  tabs.forEach((tab, idx) => {
    const tx = pb.innerX + idx * tabStepW + tabStepW / 2;
    ctx.font = "16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(tab.icon, tx, navY + 26);
    ctx.font = tab.active ? "900 10px system-ui" : "600 10px system-ui";
    ctx.fillStyle = tab.active ? "#ea580c" : "#94a3b8";
    ctx.fillText(tab.label, tx, navY + 44);
  });
  ctx.textAlign = "left";

  // Simulated User Cursor / Tap Gesture
  let cursorX = pb.innerX + pb.innerWidth / 2;
  let cursorY = pb.innerY + 450;
  let isClick = false;

  if (progress > 0.8) {
    cursorX = pb.innerX + pb.innerWidth / 2;
    cursorY = card1Y + 120;
    isClick = true;
  } else if (progress > 0.25 && progress < 0.6) {
    cursorY = pb.innerY + 450 - scrollY * 0.4;
  }

  drawTouchCursor(ctx, cursorX, cursorY, isClick, (progress - 0.8) * 5);

  ctx.restore(); // end phone clip
}
