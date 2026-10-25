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

export function renderClip3Frame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) {
  const w = 1920;
  const h = 1080;
  const progress = Math.min(1, Math.max(0, frame / totalFrames));

  // 1. Showcase Backdrop
  drawLandscapeBackdrop(ctx, w, h, 3, "CART & ORDER REVIEW");

  // 2. Left Presentation Sidebar
  const clip = PROMO_CLIPS_CATALOG[2];
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

  // Base background screen (dimmed when modal/drawer open)
  const isDrawerOpen = progress > 0.45;

  // Header
  const headerY = pb.innerY + 44;
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(pb.innerX, headerY, pb.innerWidth, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 18px system-ui";
  ctx.fillText("Mama's Kota Kitchen", pb.innerX + 20, headerY + 45);
  ctx.font = "bold 11px system-ui";
  ctx.fillText("⭐ 4.8 (142 reviews) • Tembisa", pb.innerX + 20, headerY + 65);

  // Background Kota Card
  drawRoundedRect(ctx, pb.innerX + 16, headerY + 95, pb.innerWidth - 32, 180, 20);
  ctx.fillStyle = "#fff7ed";
  ctx.fill();
  ctx.strokeStyle = "#fed7aa";
  ctx.lineWidth = 1;
  ctx.stroke();

  drawKotaIllustration(ctx, pb.innerX + 80, headerY + 165, 60);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 16px system-ui";
  ctx.fillText("Special Double Cheese Kota", pb.innerX + 140, headerY + 145);
  ctx.fillStyle = "#ea580c";
  ctx.font = "900 18px system-ui";
  ctx.fillText("R 55.00", pb.innerX + 140, headerY + 175);

  // Backdrop overlay when modal/drawer is active
  if (isDrawerOpen) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight);
  }

  // --- STAGE 1: Meal Customization & Add to Basket (progress < 0.45) ---
  if (!isDrawerOpen) {
    const modalY = pb.innerY + 240;
    const modalH = pb.innerHeight - 240;

    drawRoundedRect(ctx, pb.innerX, modalY, pb.innerWidth, modalH, [32, 32, 0, 0]);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Handle bar
    drawRoundedRect(ctx, pb.innerX + pb.innerWidth / 2 - 20, modalY + 10, 40, 5, 2.5);
    ctx.fillStyle = "#cbd5e1";
    ctx.fill();

    // Modal Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 18px system-ui";
    ctx.fillText("Special Double Cheese Kota", pb.innerX + 20, modalY + 44);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 12px system-ui";
    ctx.fillText("Fresh quarter loaf, double cheese, slap chips, Russian", pb.innerX + 20, modalY + 64);

    // Quantity Counter Box
    const qtyBoxY = modalY + 90;
    drawRoundedRect(ctx, pb.innerX + 20, qtyBoxY, pb.innerWidth - 40, 75, 18);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("SELECT QUANTITY", pb.innerX + 34, qtyBoxY + 24);

    // Stepper
    drawRoundedRect(ctx, pb.innerX + 34, qtyBoxY + 32, 36, 32, 10);
    ctx.fillStyle = "#e2e8f0";
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 16px system-ui";
    ctx.fillText("−", pb.innerX + 46, qtyBoxY + 53);

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 20px system-ui";
    ctx.fillText("1", pb.innerX + 88, qtyBoxY + 55);

    drawRoundedRect(ctx, pb.innerX + 115, qtyBoxY + 32, 36, 32, 10);
    ctx.fillStyle = "#ea580c";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px system-ui";
    ctx.fillText("+", pb.innerX + 127, qtyBoxY + 53);

    // Subtotal inside qty box
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 18px system-ui";
    ctx.fillText("R 55.00", pb.innerX + pb.innerWidth - 120, qtyBoxY + 50);

    // Big Add to Basket Button
    const addBtnY = modalY + 190;
    const isTappingAdd = progress > 0.28;

    drawRoundedRect(ctx, pb.innerX + 20, addBtnY, pb.innerWidth - 40, 54, 18);
    ctx.fillStyle = isTappingAdd ? "#c2410c" : "#ea580c";
    ctx.fill();
    ctx.shadowColor = "rgba(234, 88, 12, 0.4)";
    ctx.shadowBlur = 15;

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      isTappingAdd ? "✓ Added to Basket!" : "Add to Basket • R 55.00",
      pb.innerX + pb.innerWidth / 2,
      addBtnY + 33
    );
    ctx.textAlign = "left";

    // Cursor for Add to Basket
    let cx = pb.innerX + pb.innerWidth / 2;
    let cy = addBtnY + 27;
    drawTouchCursor(ctx, cx, cy, isTappingAdd, (progress - 0.28) * 5);
  }

  // --- STAGE 2: Slide-Over CartDrawer (progress >= 0.45) ---
  if (isDrawerOpen) {
    // Drawer slides up smoothly from bottom
    const drawerP = Math.min(1, (progress - 0.45) / 0.15);
    const drawerH = 460;
    const drawerY = pb.innerY + pb.innerHeight - drawerH * drawerP;

    drawRoundedRect(ctx, pb.innerX, drawerY, pb.innerWidth, drawerH, [32, 32, 0, 0]);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Drawer drag handle
    drawRoundedRect(ctx, pb.innerX + pb.innerWidth / 2 - 22, drawerY + 12, 44, 5, 2.5);
    ctx.fillStyle = "#cbd5e1";
    ctx.fill();

    // Drawer Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 18px system-ui";
    ctx.fillText("Review Your Basket", pb.innerX + 20, drawerY + 44);

    ctx.fillStyle = "#ea580c";
    ctx.font = "bold 12px system-ui";
    ctx.fillText("Mama's Kota Kitchen • Collection", pb.innerX + 20, drawerY + 62);

    // Cart Item Row
    const itemRowY = drawerY + 84;
    drawRoundedRect(ctx, pb.innerX + 16, itemRowY, pb.innerWidth - 32, 90, 16);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();

    // Mini Kota illustration thumbnail
    drawRoundedRect(ctx, pb.innerX + 26, itemRowY + 12, 66, 66, 12);
    ctx.fillStyle = "#fef3c7";
    ctx.fill();
    drawKotaIllustration(ctx, pb.innerX + 59, itemRowY + 45, 36);

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 13px system-ui";
    ctx.fillText("Special Double Cheese Kota", pb.innerX + 102, itemRowY + 30);

    ctx.fillStyle = "#ea580c";
    ctx.font = "900 15px system-ui";
    ctx.fillText("R 55.00", pb.innerX + 102, itemRowY + 54);

    // Quantity pill in drawer
    drawRoundedRect(ctx, pb.innerX + pb.innerWidth - 110, itemRowY + 30, 84, 30, 15);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 12px system-ui";
    ctx.fillText("Qty: 1", pb.innerX + pb.innerWidth - 88, itemRowY + 50);

    // Price Breakdown Box
    const priceBoxY = itemRowY + 105;
    drawRoundedRect(ctx, pb.innerX + 16, priceBoxY, pb.innerWidth - 32, 105, 16);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();

    ctx.fillStyle = "#64748b";
    ctx.font = "500 12px system-ui";
    ctx.fillText("Subtotal", pb.innerX + 32, priceBoxY + 28);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 12px system-ui";
    ctx.fillText("R 55.00", pb.innerX + pb.innerWidth - 86, priceBoxY + 28);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 12px system-ui";
    ctx.fillText("Counter Pickup Fee", pb.innerX + 32, priceBoxY + 52);
    ctx.fillStyle = "#10b981";
    ctx.font = "900 12px system-ui";
    ctx.fillText("FREE", pb.innerX + pb.innerWidth - 76, priceBoxY + 52);

    // Divider
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(pb.innerX + 32, priceBoxY + 66);
    ctx.lineTo(pb.innerX + pb.innerWidth - 32, priceBoxY + 66);
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 14px system-ui";
    ctx.fillText("Total to Pay at Counter", pb.innerX + 32, priceBoxY + 88);
    ctx.fillStyle = "#ea580c";
    ctx.font = "900 17px system-ui";
    ctx.fillText("R 55.00", pb.innerX + pb.innerWidth - 95, priceBoxY + 88);

    // Checkout CTA Button
    const checkBtnY = priceBoxY + 120;
    const isTappingCheckout = progress > 0.85;

    drawRoundedRect(ctx, pb.innerX + 16, checkBtnY, pb.innerWidth - 32, 54, 18);
    ctx.fillStyle = isTappingCheckout ? "#c2410c" : "#ea580c";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Proceed to Checkout →", pb.innerX + pb.innerWidth / 2, checkBtnY + 33);
    ctx.textAlign = "left";

    // Cursor tapping checkout
    if (progress > 0.75) {
      let cx = pb.innerX + pb.innerWidth / 2;
      let cy = checkBtnY + 27;
      drawTouchCursor(ctx, cx, cy, isTappingCheckout, (progress - 0.85) * 5);
    }
  }

  ctx.restore(); // end phone clip
}
