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

export function renderClip2Frame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) {
  const w = 1920;
  const h = 1080;
  const progress = Math.min(1, Math.max(0, frame / totalFrames));

  // 1. Showcase Backdrop
  drawLandscapeBackdrop(ctx, w, h, 2, "STOREFRONT & MENU SELECTION");

  // 2. Left Presentation Sidebar
  const clip = PROMO_CLIPS_CATALOG[1];
  drawPresentationSidebar(ctx, clip.clipNumber, clip.title, clip.subtitle, clip.keyHighlights);

  // 3. Right-side Phone Frame
  const pb = getPhoneBounds(w, h);
  drawPhoneFrame(ctx, pb);

  // 4. Render Inside Phone Screen
  ctx.save();
  drawRoundedRect(ctx, pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight, 42);
  ctx.clip();

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight);

  // Status Bar
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("9:41", pb.innerX + 24, pb.innerY + 28);
  ctx.font = "11px system-ui";
  ctx.fillText("5G 📶 100% 🔋", pb.innerX + pb.innerWidth - 90, pb.innerY + 28);

  // Store Hero Header
  const heroY = pb.innerY + 44;
  const heroH = 150;
  const heroGrad = ctx.createLinearGradient(pb.innerX, heroY, pb.innerX + pb.innerWidth, heroY + heroH);
  heroGrad.addColorStop(0, "#ea580c");
  heroGrad.addColorStop(1, "#c2410c");
  ctx.fillStyle = heroGrad;
  ctx.fillRect(pb.innerX, heroY, pb.innerWidth, heroH);

  // Top Nav over hero (Back button, Title, Share)
  drawRoundedRect(ctx, pb.innerX + 16, heroY + 12, 34, 34, 17);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px system-ui";
  ctx.fillText("←", pb.innerX + 27, heroY + 34);

  drawRoundedRect(ctx, pb.innerX + pb.innerWidth - 50, heroY + 12, 34, 34, 17);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText("♡", pb.innerX + pb.innerWidth - 39, heroY + 34);

  // Store Brand Title on Hero
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("Mama's Kota Kitchen", pb.innerX + 20, heroY + 95);

  ctx.fillStyle = "#ffedd5";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("⭐ 4.8 (142 reviews) • 📍 246 Jiyane St, Tembisa", pb.innerX + 20, heroY + 115);

  // Store status pill
  drawRoundedRect(ctx, pb.innerX + 20, heroY + 124, 76, 20, 10);
  ctx.fillStyle = "#10b981";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 9px system-ui, -apple-system, sans-serif";
  ctx.fillText("OPEN NOW", pb.innerX + 28, heroY + 138);

  // Storefront Trust Banner
  const trustY = heroY + heroH + 10;
  drawRoundedRect(ctx, pb.innerX + 16, trustY, pb.innerWidth - 32, 40, 14);
  ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#047857";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("💵 Counter Pickup Active: Pay directly at collection", pb.innerX + 26, trustY + 25);

  // Horizontal Menu Categories
  const catY = trustY + 50;
  const menuCats = [
    { name: "Kotas 🍞", active: true },
    { name: "Braai Plates 🔥", active: false },
    { name: "Sides 🍟", active: false },
  ];
  let cx = pb.innerX + 16;
  menuCats.forEach((c) => {
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    const tw = ctx.measureText(c.name).width;
    const cw = tw + 24;

    drawRoundedRect(ctx, cx, catY, cw, 32, 16);
    if (c.active) {
      ctx.fillStyle = "#ea580c";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#f1f5f9";
      ctx.fill();
      ctx.fillStyle = "#64748b";
    }
    ctx.fillText(c.name, cx + 12, catY + 21);
    cx += cw + 8;
  });

  // Category Title
  const listStartY = catY + 46;
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 15px system-ui, -apple-system, sans-serif";
  ctx.fillText("LEGENDARY KOTAS (4)", pb.innerX + 18, listStartY + 14);

  // --- Menu Item 1: Classic Single Kota (R 35.00) ---
  const item1Y = listStartY + 26;
  drawRoundedRect(ctx, pb.innerX + 16, item1Y, pb.innerWidth - 32, 95, 18);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Thumbnail
  drawRoundedRect(ctx, pb.innerX + 26, item1Y + 12, 72, 72, 14);
  ctx.fillStyle = "#fef3c7";
  ctx.fill();
  drawKotaIllustration(ctx, pb.innerX + 62, item1Y + 48, 40);

  // Title & description
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 14px system-ui, -apple-system, sans-serif";
  ctx.fillText("Classic Single Kota", pb.innerX + 108, item1Y + 30);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("Quarter loaf, golden chips, polony, atchar", pb.innerX + 108, item1Y + 48);

  ctx.fillStyle = "#ea580c";
  ctx.font = "900 15px system-ui, -apple-system, sans-serif";
  ctx.fillText("R 35.00", pb.innerX + 108, item1Y + 74);

  // --- Menu Item 2: Special Double Cheese Kota (R 55.00) (Highlighted!) ---
  const item2Y = item1Y + 106;
  const isSelected = progress > 0.6;

  drawRoundedRect(ctx, pb.innerX + 16, item2Y, pb.innerWidth - 32, 160, 20);
  ctx.fillStyle = isSelected ? "#fff7ed" : "#ffffff";
  ctx.fill();
  ctx.strokeStyle = isSelected ? "#ea580c" : "#fed7aa";
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.stroke();

  // Highlight badge
  drawRoundedRect(ctx, pb.innerX + pb.innerWidth - 130, item2Y + 10, 98, 22, 11);
  ctx.fillStyle = "#ea580c";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 9px system-ui";
  ctx.fillText("⭐ BESTSELLER", pb.innerX + pb.innerWidth - 124, item2Y + 25);

  // Thumbnail
  drawRoundedRect(ctx, pb.innerX + 26, item2Y + 16, 90, 90, 16);
  ctx.fillStyle = "#fef3c7";
  ctx.fill();
  drawKotaIllustration(ctx, pb.innerX + 71, item2Y + 61, 56);

  // Details
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 16px system-ui, -apple-system, sans-serif";
  ctx.fillText("Special Double Cheese Kota", pb.innerX + 126, item2Y + 38);

  ctx.fillStyle = "#475569";
  ctx.font = "500 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("Double chips, double cheddar cheese,", pb.innerX + 126, item2Y + 56);
  ctx.fillText("Russian sausage, egg & house sauce", pb.innerX + 126, item2Y + 70);

  // Large Rand Price
  ctx.fillStyle = "#ea580c";
  ctx.font = "900 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("R 55.00", pb.innerX + 126, item2Y + 98);

  // Selection Button inside card
  const selectBtnY = item2Y + 114;
  drawRoundedRect(ctx, pb.innerX + 26, selectBtnY, pb.innerWidth - 52, 36, 14);
  ctx.fillStyle = isSelected ? "#ea580c" : "#0f172a";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    isSelected ? "✓ SELECTED • R 55.00" : "SELECT MEAL • R 55.00",
    pb.innerX + pb.innerWidth / 2,
    selectBtnY + 23
  );
  ctx.textAlign = "left";

  // Cursor interaction
  let cursorX = pb.innerX + pb.innerWidth / 2;
  let cursorY = pb.innerY + 480;
  let isClick = false;

  if (progress > 0.45 && progress < 0.75) {
    cursorX = pb.innerX + pb.innerWidth / 2;
    cursorY = selectBtnY + 18;
    isClick = progress > 0.58;
  }

  drawTouchCursor(ctx, cursorX, cursorY, isClick, (progress - 0.58) * 4);

  ctx.restore(); // end phone clip
}
