import {
  RenderContext,
  drawLandscapeBackdrop,
  drawPresentationSidebar,
  getPhoneBounds,
  drawPhoneFrame,
  drawRoundedRect,
  drawTouchCursor,
} from "../engine/canvasRenderer";
import { PROMO_CLIPS_CATALOG } from "../mockData";

export function renderClip4Frame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) {
  const w = 1920;
  const h = 1080;
  const progress = Math.min(1, Math.max(0, frame / totalFrames));

  // 1. Showcase Backdrop
  drawLandscapeBackdrop(ctx, w, h, 4, "SIMULATED PICKUP CHECKOUT");

  // 2. Left Presentation Sidebar
  const clip = PROMO_CLIPS_CATALOG[3];
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

  // Status Bar
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("9:41", pb.innerX + 24, pb.innerY + 28);
  ctx.font = "11px system-ui";
  ctx.fillText("5G 📶 100% 🔋", pb.innerX + pb.innerWidth - 90, pb.innerY + 28);

  // Top Bar
  const topY = pb.innerY + 44;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pb.innerX, topY, pb.innerWidth, 56);
  ctx.strokeStyle = "#e2e8f0";
  ctx.strokeRect(pb.innerX, topY, pb.innerWidth, 56);

  ctx.fillStyle = "#0f172a";
  ctx.font = "900 16px system-ui";
  ctx.fillText("← Checkout", pb.innerX + 20, topY + 34);

  // Fulfillment Selector: Collection / Pickup (Strictly enforced)
  const toggleY = topY + 70;
  drawRoundedRect(ctx, pb.innerX + 16, toggleY, pb.innerWidth - 32, 48, 16);
  ctx.fillStyle = "#e2e8f0";
  ctx.fill();

  // Tab 1: Delivery (inactive)
  const tabW = (pb.innerWidth - 40) / 2;
  drawRoundedRect(ctx, pb.innerX + 20, toggleY + 4, tabW, 40, 12);
  ctx.fillStyle = "transparent";
  ctx.fill();
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("🚚 Delivery", pb.innerX + 20 + tabW / 2, toggleY + 28);

  // Tab 2: Collection / Pickup (Active Vibrant Orange)
  drawRoundedRect(ctx, pb.innerX + 20 + tabW, toggleY + 4, tabW, 40, 12);
  ctx.fillStyle = "#ea580c";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px system-ui";
  ctx.fillText("🛍️ Collection (Free)", pb.innerX + 20 + tabW + tabW / 2, toggleY + 28);
  ctx.textAlign = "left";

  // Customer Contact Info Box
  const contactY = toggleY + 60;
  drawRoundedRect(ctx, pb.innerX + 16, contactY, pb.innerWidth - 32, 70, 18);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "900 10px system-ui";
  ctx.fillText("COLLECTION RECIPIENT", pb.innerX + 30, contactY + 22);

  ctx.fillStyle = "#0f172a";
  ctx.font = "900 14px system-ui";
  ctx.fillText("Thabo Mokoena", pb.innerX + 30, contactY + 42);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px system-ui";
  ctx.fillText("+27 82 345 6789", pb.innerX + 30, contactY + 58);

  // Direct Pay-at-Restaurant Trust Banner (CRITICAL REQUIREMENT)
  const bannerY = contactY + 82;
  drawRoundedRect(ctx, pb.innerX + 16, bannerY, pb.innerWidth - 32, 85, 18);
  ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#065f46";
  ctx.font = "900 12px system-ui";
  ctx.fillText("💵 Pay Directly at Restaurant", pb.innerX + 30, bannerY + 26);

  ctx.fillStyle = "#047857";
  ctx.font = "500 11px system-ui";
  ctx.fillText("No upfront card deduction. Pay Mama's Kota Kitchen", pb.innerX + 30, bannerY + 46);
  ctx.fillText("via Cash or Card Machine when collecting your food.", pb.innerX + 30, bannerY + 62);

  // Store Pickup Location
  const locY = bannerY + 98;
  drawRoundedRect(ctx, pb.innerX + 16, locY, pb.innerWidth - 32, 60, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "900 10px system-ui";
  ctx.fillText("PICKUP LOCATION", pb.innerX + 28, locY + 20);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("Mama's Kota Kitchen • 246 Jiyane St, Tembisa", pb.innerX + 28, locY + 42);

  // Order Pricing Summary Card
  const priceY = locY + 74;
  drawRoundedRect(ctx, pb.innerX + 16, priceY, pb.innerWidth - 32, 110, 18);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px system-ui";
  ctx.fillText("1x Special Double Cheese Kota", pb.innerX + 28, priceY + 28);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("R 55.00", pb.innerX + pb.innerWidth - 90, priceY + 28);

  ctx.fillStyle = "#64748b";
  ctx.fillText("Counter Pickup Fee", pb.innerX + 28, priceY + 54);
  ctx.fillStyle = "#10b981";
  ctx.font = "900 12px system-ui";
  ctx.fillText("FREE", pb.innerX + pb.innerWidth - 75, priceY + 54);

  // Divider
  ctx.strokeStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.moveTo(pb.innerX + 28, priceY + 68);
  ctx.lineTo(pb.innerX + pb.innerWidth - 28, priceY + 68);
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "900 14px system-ui";
  ctx.fillText("Total Due at Store", pb.innerX + 28, priceY + 92);
  ctx.fillStyle = "#ea580c";
  ctx.font = "900 18px system-ui";
  ctx.fillText("R 55.00", pb.innerX + pb.innerWidth - 98, priceY + 92);

  // Submit Order Button
  const isSubmitted = progress > 0.65;
  const submitBtnY = priceY + 125;

  drawRoundedRect(ctx, pb.innerX + 16, submitBtnY, pb.innerWidth - 32, 54, 18);
  ctx.fillStyle = isSubmitted ? "#10b981" : "#ea580c";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(
    isSubmitted ? "✓ Pickup Order Confirmed!" : "Submit Pickup Order • R 55.00",
    pb.innerX + pb.innerWidth / 2,
    submitBtnY + 33
  );
  ctx.textAlign = "left";

  // Success Modal Dialog (appears after submission)
  if (isSubmitted) {
    const dialogP = Math.min(1, (progress - 0.65) / 0.15);
    const dialogW = pb.innerWidth - 44;
    const dialogH = 210;
    const dialogX = pb.innerX + 22;
    const dialogY = pb.innerY + 260 - (1 - dialogP) * 30;

    // Dark backdrop overlay
    ctx.fillStyle = `rgba(15, 23, 42, ${0.65 * dialogP})`;
    ctx.fillRect(pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight);

    // Dialog Box
    drawRoundedRect(ctx, dialogX, dialogY, dialogW, dialogH, 28);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 30;

    // Success check circle
    ctx.beginPath();
    ctx.arc(dialogX + dialogW / 2, dialogY + 45, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(dialogX + dialogW / 2 - 10, dialogY + 45);
    ctx.lineTo(dialogX + dialogW / 2 - 3, dialogY + 53);
    ctx.lineTo(dialogX + dialogW / 2 + 11, dialogY + 37);
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Order #LE-7842 Confirmed!", dialogX + dialogW / 2, dialogY + 102);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 12px system-ui";
    ctx.fillText("Sent directly to Mama's Kota Kitchen.", dialogX + dialogW / 2, dialogY + 124);
    ctx.fillText("Pay R 55.00 at counter when ready.", dialogX + dialogW / 2, dialogY + 142);

    drawRoundedRect(ctx, dialogX + 20, dialogY + 160, dialogW - 40, 36, 14);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 12px system-ui";
    ctx.fillText("View Live Status →", dialogX + dialogW / 2, dialogY + 182);
    ctx.textAlign = "left";
  }

  // Cursor tapping submit button
  if (progress > 0.45 && progress < 0.75) {
    let cx = pb.innerX + pb.innerWidth / 2;
    let cy = submitBtnY + 27;
    drawTouchCursor(ctx, cx, cy, progress > 0.58, (progress - 0.58) * 4);
  }

  ctx.restore(); // end phone clip
}
