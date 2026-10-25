import {
  RenderContext,
  drawLandscapeBackdrop,
  drawPresentationSidebar,
  getPhoneBounds,
  drawPhoneFrame,
  drawDesktopBrowserFrame,
  drawRoundedRect,
  drawTouchCursor,
  drawKotaIllustration,
} from "../engine/canvasRenderer";
import { PROMO_CLIPS_CATALOG } from "../mockData";

export function renderClip6Frame(ctx: CanvasRenderingContext2D, frame: number, totalFrames: number) {
  const w = 1920;
  const h = 1080;
  const progress = Math.min(1, Math.max(0, frame / totalFrames));

  // 1. Showcase Backdrop
  drawLandscapeBackdrop(ctx, w, h, 6, "ORDER COMPLETION & READY STATUS");

  // 2. Left Presentation Sidebar
  const clip = PROMO_CLIPS_CATALOG[5];
  drawPresentationSidebar(ctx, clip.clipNumber, clip.title, clip.subtitle, clip.keyHighlights);

  // Transition Timing:
  // progress 0.0 - 0.42: Merchant Dashboard marking order ready
  // progress 0.42 - 0.48: Smooth crossfade / scale transition
  // progress 0.48 - 1.0: Customer-facing Order Tracking Screen with "Ready for Pickup"

  const isCustomerPhase = progress >= 0.45;

  if (!isCustomerPhase) {
    // --- PART A: Merchant Dashboard Marking Ready ---
    const winX = w - 1050;
    const winY = 160;
    const winW = 960;
    const winH = 780;

    drawDesktopBrowserFrame(ctx, winX, winY, winW, winH, "https://merchant.localeats.co.za/orders");

    const contentY = winY + 52;
    const contentH = winH - 52;

    ctx.save();
    drawRoundedRect(ctx, winX, contentY, winW, contentH, [0, 0, 20, 20]);
    ctx.clip();

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(winX, contentY, winW, contentH);

    // Mini Header
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(winX, contentY, winW, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 16px system-ui";
    ctx.fillText("Mama's Kota Kitchen • Order Board", winX + 24, contentY + 36);

    drawRoundedRect(ctx, winX + winW - 170, contentY + 16, 145, 28, 14);
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.stroke();
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("🟢 KITCHEN ACTIVE", winX + winW - 158, contentY + 34);

    // Order Card in Kitchen Column
    const cardX = winX + 40;
    const cardY = contentY + 90;
    const cardW = winW - 80;
    const cardH = 480;

    const isMarkedReady = progress > 0.28;

    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = isMarkedReady ? "#10b981" : "#ea580c";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Order header
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 24px system-ui";
    ctx.fillText("#LE-7842", cardX + 28, cardY + 48);

    // Customer Name & Badge
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px system-ui";
    ctx.fillText("Thabo Mokoena • 📞 +27 82 345 6789", cardX + 28, cardY + 76);

    // Status Badge
    drawRoundedRect(ctx, cardX + cardW - 220, cardY + 24, 192, 36, 18);
    if (!isMarkedReady) {
      ctx.fillStyle = "rgba(234, 88, 12, 0.2)";
      ctx.fill();
      ctx.strokeStyle = "#ea580c";
      ctx.stroke();
      ctx.fillStyle = "#fb923c";
      ctx.font = "900 12px system-ui";
      ctx.fillText("👨‍🍳 CHEF PREPARING", cardX + cardW - 200, cardY + 47);
    } else {
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 12px system-ui";
      ctx.fillText("✓ READY FOR COLLECTION", cardX + cardW - 212, cardY + 47);
    }

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(cardX + 28, cardY + 105);
    ctx.lineTo(cardX + cardW - 28, cardY + 105);
    ctx.stroke();

    // Item line
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 18px system-ui";
    ctx.fillText("1x Special Double Cheese Kota", cardX + 28, cardY + 145);
    ctx.fillStyle = "#ea580c";
    ctx.font = "900 20px system-ui";
    ctx.fillText("R 55.00", cardX + cardW - 105, cardY + 145);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 13px system-ui";
    ctx.fillText("Slap chips, double cheddar, polony, egg, Russian & relish", cardX + 28, cardY + 172);

    // Fulfillment details box
    drawRoundedRect(ctx, cardX + 28, cardY + 205, cardW - 56, 80, 16);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 13px system-ui";
    ctx.fillText("🛍️ COUNTER COLLECTION ORDER", cardX + 44, cardY + 235);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "500 12px system-ui";
    ctx.fillText("Customer pays R55.00 directly at counter upon pickup (Cash or Card Machine).", cardX + 44, cardY + 258);

    // Big Mark Ready Button
    const btnY = cardY + 320;
    const isClickingBtn = progress > 0.22 && progress <= 0.28;

    drawRoundedRect(ctx, cardX + 28, btnY, cardW - 56, 68, 20);
    ctx.fillStyle = isMarkedReady ? "#10b981" : isClickingBtn ? "#047857" : "#059669";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      isMarkedReady ? "✓ ORDER MARKED READY • CUSTOMER NOTIFIED" : "Mark Ready for Pickup 📦",
      cardX + cardW / 2,
      btnY + 41
    );
    ctx.textAlign = "left";

    // Vendor Cursor
    if (progress > 0.12 && progress < 0.4) {
      let cx = cardX + cardW / 2;
      let cy = btnY + 34;
      drawTouchCursor(ctx, cx, cy, isClickingBtn, (progress - 0.22) * 12);
    }

    ctx.restore();
  } else {
    // --- PART B: Customer-Facing Order Tracking Screen ---
    const pb = getPhoneBounds(w, h);
    drawPhoneFrame(ctx, pb);

    ctx.save();
    drawRoundedRect(ctx, pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight, 42);
    ctx.clip();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(pb.innerX, pb.innerY, pb.innerWidth, pb.innerHeight);

    // Status Bar
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 13px system-ui";
    ctx.fillText("9:41", pb.innerX + 24, pb.innerY + 28);
    ctx.font = "11px system-ui";
    ctx.fillText("5G 📶 100% 🔋", pb.innerX + pb.innerWidth - 90, pb.innerY + 28);

    // Top Navigation
    const navY = pb.innerY + 44;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(pb.innerX, navY, pb.innerWidth, 56);
    ctx.strokeStyle = "#e2e8f0";
    ctx.strokeRect(pb.innerX, navY, pb.innerWidth, 56);

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 16px system-ui";
    ctx.fillText("← Live Order Status", pb.innerX + 20, navY + 34);

    // PROMINENT "READY FOR PICKUP" HIGH-IMPACT EMERALD BANNER
    // (Per requirement & App.tsx notification design)
    const bannerY = navY + 68;
    const bannerH = 145;
    drawRoundedRect(ctx, pb.innerX + 16, bannerY, pb.innerWidth - 32, bannerH, 22);
    ctx.fillStyle = "#059669"; // Emerald 600
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pulsing flame/star badge
    drawRoundedRect(ctx, pb.innerX + 30, bannerY + 16, 36, 36, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui";
    ctx.fillText("🔥", pb.innerX + 38, bannerY + 42);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 17px system-ui, -apple-system, sans-serif";
    ctx.fillText("YOUR ORDER IS READY!", pb.innerX + 76, bannerY + 40);

    ctx.fillStyle = "#ecfdf5";
    ctx.font = "bold 12px system-ui";
    ctx.fillText("Run! Mama's Kota Kitchen has your meal", pb.innerX + 30, bannerY + 76);
    ctx.fillText("packed, warm, and waiting at the counter.", pb.innerX + 30, bannerY + 94);

    // Ready Status Pill
    drawRoundedRect(ctx, pb.innerX + 30, bannerY + 108, 150, 24, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fill();
    ctx.fillStyle = "#047857";
    ctx.font = "900 10px system-ui";
    ctx.fillText("✓ READY FOR PICKUP", pb.innerX + 42, bannerY + 124);

    // Order Tracking Card
    const orderCardY = bannerY + bannerH + 16;
    drawRoundedRect(ctx, pb.innerX + 16, orderCardY, pb.innerWidth - 32, 280, 22);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();

    // Order Header
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 16px system-ui";
    ctx.fillText("Order #LE-7842", pb.innerX + 30, orderCardY + 34);

    drawRoundedRect(ctx, pb.innerX + pb.innerWidth - 120, orderCardY + 16, 90, 26, 12);
    ctx.fillStyle = "#ffedd5";
    ctx.fill();
    ctx.fillStyle = "#ea580c";
    ctx.font = "900 11px system-ui";
    ctx.fillText("COLLECTION", pb.innerX + pb.innerWidth - 110, orderCardY + 33);

    // Vendor details
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 12px system-ui";
    ctx.fillText("📍 Mama's Kota Kitchen • 246 Jiyane St, Tembisa", pb.innerX + 30, orderCardY + 58);

    // Stepper Progress
    const stepY = orderCardY + 84;
    const steps = [
      { label: "Received", done: true },
      { label: "Prepared", done: true },
      { label: "Ready", done: true, current: true },
    ];
    const sw = (pb.innerWidth - 80) / 3;

    steps.forEach((st, idx) => {
      const sx = pb.innerX + 30 + idx * sw;
      drawRoundedRect(ctx, sx, stepY, sw - 8, 30, 10);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`✓ ${st.label}`, sx + (sw - 8) / 2, stepY + 19);
    });
    ctx.textAlign = "left";

    // Item line
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 14px system-ui";
    ctx.fillText("1x Special Double Cheese Kota", pb.innerX + 30, orderCardY + 148);
    ctx.fillStyle = "#ea580c";
    ctx.font = "900 16px system-ui";
    ctx.fillText("R 55.00", pb.innerX + pb.innerWidth - 90, orderCardY + 148);

    // Counter Payment Instructions Box
    const payBoxY = orderCardY + 175;
    drawRoundedRect(ctx, pb.innerX + 28, payBoxY, pb.innerWidth - 56, 75, 14);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("AMOUNT TO PAY AT COUNTER", pb.innerX + 40, payBoxY + 24);

    ctx.fillStyle = "#ea580c";
    ctx.font = "900 22px system-ui";
    ctx.fillText("R 55.00", pb.innerX + 40, payBoxY + 54);

    ctx.fillStyle = "#059669";
    ctx.font = "bold 11px system-ui";
    ctx.fillText("Cash / Card Machine", pb.innerX + pb.innerWidth - 170, payBoxY + 50);

    // Return Home / Order Finished button
    const actionBtnY = orderCardY + 300;
    drawRoundedRect(ctx, pb.innerX + 16, actionBtnY, pb.innerWidth - 32, 54, 18);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("I Have Collected My Order", pb.innerX + pb.innerWidth / 2, actionBtnY + 33);
    ctx.textAlign = "left";

    ctx.restore();
  }
}
