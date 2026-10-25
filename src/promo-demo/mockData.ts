import { ClipDefinition, DemoOrder } from "./types";

export const CONSISTENT_DEMO_ORDER: DemoOrder = {
  orderId: "ord_le_7842_tembisa",
  orderNumber: "#LE-7842",
  customerName: "Thabo Mokoena",
  customerPhone: "+27 82 345 6789",
  shopName: "Mama's Kota Kitchen",
  shopAddress: "246 Jiyane Street, Tembisa",
  itemName: "Special Double Cheese Kota",
  itemDescription: "Quarter loaf loaded with double chips, double melted cheddar, polony, egg, Russian, & house relish",
  itemPrice: 55.0,
  quantity: 1,
  subtotal: 55.0,
  deliveryFee: 0.0, // Strictly collection/pickup, no delivery fee
  total: 55.0,
  orderType: "collection",
  paymentMethod: "Pay Restaurant at Collection (Cash / Card)",
  status: "pending",
};

export const PROMO_CLIPS_CATALOG: ClipDefinition[] = [
  {
    id: "clip-1-discover",
    clipNumber: 1,
    title: "Discover Local Food",
    subtitle: "Authentic customer browsing experience across local township vendors",
    filename: "localeats_clip1_discover_local_food.webm",
    durationSeconds: 5.0,
    fps: 30,
    synthesiaPlacement: "Scene 1: Introduction / Hero (0:05 - 0:10)",
    description: "Demonstrates a customer opening LocalEats, browsing local kitchen vendors with live ratings, authentic food photography, and category filter chips.",
    keyHighlights: [
      "Top flush bar with Tembisa location & search input",
      "Authentic merchant cards: Mama's Kota Kitchen & Tembisa Braai Masters",
      "Ratings, prep time badges, and verified local status",
      "Smooth simulated browsing gesture"
    ],
  },
  {
    id: "clip-2-select",
    clipNumber: 2,
    title: "Select a Meal",
    subtitle: "Opening a vendor storefront and inspecting the kota menu",
    filename: "localeats_clip2_select_a_meal.webm",
    durationSeconds: 5.0,
    fps: 30,
    synthesiaPlacement: "Scene 2: Menu Discovery (0:15 - 0:20)",
    description: "Demonstrates customer entering Mama's Kota Kitchen storefront, browsing the categorized menu, inspecting prices in Rand, and selecting the Special Double Cheese Kota.",
    keyHighlights: [
      "Authentic storefront hero banner with rating & opening hours",
      "Categorized horizontal menu tabs (Kotas, Braai, Drinks)",
      "Clear price display in South African Rand (R55.00)",
      "Selection interaction into the meal details sheet"
    ],
  },
  {
    id: "clip-3-cart",
    clipNumber: 3,
    title: "Add to Cart",
    subtitle: "Meal customization, quantity counter, and slide-over cart drawer",
    filename: "localeats_clip3_add_to_cart.webm",
    durationSeconds: 5.0,
    fps: 30,
    synthesiaPlacement: "Scene 3: Order Building (0:25 - 0:30)",
    description: "Shows the selected kota being added to the basket with updated quantity and subtotal, followed by opening the interactive slide-over cart drawer to review.",
    keyHighlights: [
      "Quantity selector (+ / -) with live subtotal calculation",
      "Add to Basket button with haptic micro-interaction",
      "Floating action cart pill appearing with item count",
      "Interactive slide-over CartDrawer showing full order breakdown"
    ],
  },
  {
    id: "clip-4-pickup",
    clipNumber: 4,
    title: "Place a Pickup Order",
    subtitle: "Selecting collection and submitting zero-online-fee pickup order",
    filename: "localeats_clip4_place_pickup_order.webm",
    durationSeconds: 5.0,
    fps: 30,
    synthesiaPlacement: "Scene 4: Simple Ordering / Collection (0:35 - 0:40)",
    description: "Shows checkout with Collection / Pickup selected (no riders, no delivery fee). Communicates direct payment at restaurant upon collection and submits order #LE-7842.",
    keyHighlights: [
      "Strict Collection / Pickup selection (no delivery maps or couriers)",
      "Prominent 'Pay Directly at Restaurant Upon Collection' banner",
      "Transparent R55.00 total with zero delivery markup",
      "Instant order submission and confirmation feedback"
    ],
  },
  {
    id: "clip-5-merchant",
    clipNumber: 5,
    title: "Restaurant Receives the Order",
    subtitle: "Real LocalEats Merchant Dashboard receiving order and moving to cooking",
    filename: "localeats_clip5_restaurant_receives_order.webm",
    durationSeconds: 5.0,
    fps: 30,
    synthesiaPlacement: "Scene 5: Merchant Flow / Kitchen Operations (0:45 - 0:50)",
    description: "Shows the authentic LocalEats merchant dashboard order board receiving order #LE-7842 with audio alert, vendor reviewing details, and accepting it into preparation.",
    keyHighlights: [
      "Full 1920x1080 landscape Merchant Portal layout (LocalEats-Dashboard.2)",
      "New order sound/visual pulse with customer name 'Thabo Mokoena'",
      "Fulfillment tag: 🛍️ COLLECTION | 💵 PAY AT STORE",
      "Vendor clicks 'Accept Order' -> transitions to '👨‍🍳 PREPARING'"
    ],
  },
  {
    id: "clip-6-ready",
    clipNumber: 6,
    title: "Ready for Collection",
    subtitle: "Merchant marks ready, and customer tracking displays ready message",
    filename: "localeats_clip6_ready_for_collection.webm",
    durationSeconds: 5.0,
    fps: 30,
    synthesiaPlacement: "Scene 6: Fulfillment / Handover (0:55 - 1:00)",
    description: "Demonstrates the merchant marking the order as ready, followed by the customer-facing order tracking screen showing the vibrant green 'Ready for Pickup' banner.",
    keyHighlights: [
      "Vendor clicks 'Mark Ready' -> badge turns Emerald 'READY FOR COLLECTION'",
      "Customer phone receives instant update notification",
      "Bold customer banner: '🔥 YOUR ORDER IS READY FOR PICKUP!'",
      "Clear collection instructions: Collect at counter at Mama's Kota Kitchen"
    ],
  },
];
