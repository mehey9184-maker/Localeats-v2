const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// The new api/orders implementation
const newOrdersApi = `
// ============================================================================
// PHASE 2: AUTHORITATIVE ORDER CREATION (SUPABASE + FCM)
// ============================================================================
// Helper to calculate distance (km) between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post("/api/orders", async (req, res) => {
  try {
    // 1. We must have Supabase Admin configured for backend authoritative operations
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Backend Supabase connection not configured." });
    }

    const { 
      items, 
      shop_id, 
      user_id, 
      delivery_type, 
      delivery_coordinates,
      delivery_address,
      promo_code,
      tip_amount,
      idempotency_key 
    } = req.body;

    // 2. Validate essential inputs
    if (!idempotency_key) return res.status(400).json({ error: "idempotency_key is required." });
    if (!user_id) return res.status(401).json({ error: "Unauthorized. user_id required." });
    if (!shop_id) return res.status(400).json({ error: "shop_id is required." });
    if (!items || !items.length) return res.status(400).json({ error: "Order must contain items." });

    if (delivery_type === "delivery" && (!delivery_coordinates || !delivery_coordinates.lat || !delivery_coordinates.lng)) {
      return res.status(400).json({ error: "Valid delivery coordinates are required for delivery." });
    }

    // 3. Check Idempotency (Atomic transaction replacement)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .single();

    if (existingOrder) {
      if (existingOrder.user_id !== user_id) {
        return res.status(403).json({ error: "Order key assigned to a different user." });
      }
      return res.json({ success: true, order: existingOrder, message: "Order already processed." });
    }

    // 4. Retrieve Authoritative Shop Details
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('id', shop_id)
      .single();

    if (shopError || !shopData) {
      return res.status(404).json({ error: \`Shop '\${shop_id}' not found.\` });
    }
    if (shopData.is_active === false) {
      return res.status(400).json({ error: "Shop is currently inactive." });
    }

    // 5. Calculate Subtotal from Authoritative Menu Items
    let calculatedSubtotal = 0;
    const finalItems = [];

    // Fetch all requested items from DB in one go
    const itemIds = items.map((i: any) => i.menu_item_id);
    const { data: dbItems, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .in('id', itemIds);

    if (itemsError) {
      return res.status(500).json({ error: "Error fetching menu items." });
    }

    for (const reqItem of items) {
      const dbItem = dbItems?.find((i: any) => i.id === reqItem.menu_item_id);
      if (!dbItem) {
        return res.status(404).json({ error: \`Menu item '\${reqItem.menu_item_id}' not found.\` });
      }
      if (dbItem.shop_id !== shop_id) {
        return res.status(400).json({ error: \`Menu item '\${reqItem.menu_item_id}' does not belong to shop.\` });
      }
      if (dbItem.is_available === false) {
        return res.status(400).json({ error: \`Item '\${dbItem.name}' is unavailable.\` });
      }

      const authoritativePrice = Number(dbItem.price || 0);
      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      
      calculatedSubtotal += (authoritativePrice * qty);
      
      finalItems.push({
        menu_item_id: dbItem.id,
        name: dbItem.name,
        price: authoritativePrice,
        quantity: qty,
        notes: reqItem.notes || ""
      });
    }

    // 6. Calculate Delivery Fee
    let calculatedDeliveryFee = 0;
    if (delivery_type === "delivery") {
      const shopLat = Number(shopData.latitude);
      const shopLng = Number(shopData.longitude);
      const shopRadiusLimit = Number(shopData.delivery_radius_km || 5.0);
      
      const distance = calculateDistance(shopLat, shopLng, delivery_coordinates.lat, delivery_coordinates.lng);
      
      if (distance > shopRadiusLimit) {
        return res.status(400).json({ error: \`Delivery distance (\${distance.toFixed(1)}km) exceeds shop limit.\` });
      }

      // Base rules: R5 if under 3km, R10 otherwise.
      calculatedDeliveryFee = distance <= 3.0 ? 5.0 : 10.0;
    }

    // 7. Service Fee
    const calculatedServiceFee = calculatedSubtotal > 0 ? 2.5 : 0.0;

    // 8. Promo Code & Discount
    let calculatedDiscount = 0;
    if (promo_code) {
      const cleanCode = promo_code.trim().toUpperCase();
      const { data: promoData } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .eq('code', cleanCode)
        .single();
        
      if (promoData && promoData.is_active !== false) {
        // Evaluate expiry, shop restrictions, min order
        if (!promoData.expiry_date || new Date() <= new Date(promoData.expiry_date)) {
          if (!promoData.shop_id || promoData.shop_id === shop_id) {
            if (!promoData.min_order_amount || calculatedSubtotal >= Number(promoData.min_order_amount)) {
              
              if (promoData.discount_type === 'percent') {
                calculatedDiscount = (calculatedSubtotal * Number(promoData.discount_value)) / 100;
              } else if (promoData.discount_type === 'fixed') {
                calculatedDiscount = Math.min(calculatedSubtotal, Number(promoData.discount_value));
              } else if (promoData.discount_type === 'delivery_free') {
                calculatedDiscount = Math.min(calculatedDeliveryFee, Number(promoData.discount_value));
              }
              
              if (promoData.max_discount_amount) {
                calculatedDiscount = Math.min(calculatedDiscount, Number(promoData.max_discount_amount));
              }
            }
          }
        }
      }
    }

    // 9. Total Price
    const validatedTip = Math.max(0, Number(tip_amount) || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedDeliveryFee + calculatedServiceFee + validatedTip);

    // 10. Insert Order safely into Supabase
    const { data: newOrder, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        idempotency_key,
        user_id,
        shop_id,
        status: 'pending',
        delivery_status: 'none',
        delivery_type,
        delivery_address,
        delivery_coordinates,
        items: finalItems,
        subtotal: calculatedSubtotal,
        delivery_fee: calculatedDeliveryFee,
        service_fee: calculatedServiceFee,
        discount_amount: calculatedDiscount,
        tip_amount: validatedTip,
        total_price: calculatedTotal,
        promo_code,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Order Insert Error:", insertError);
      return res.status(500).json({ error: "Failed to persist order to database." });
    }

    // 11. Trigger FCM Notification to Merchant (Stubbed for now, ready for firebase-admin)
    console.log(\`[FCM] Notification dispatched to Merchant for Order: \${newOrder.id}\`);
    // await sendFCMNotificationToMerchant(shopData.owner_id, "New Order Received!", "Please review and accept.");

    return res.json({ success: true, order: newOrder });

  } catch (err: any) {
    console.error("Create Order Error:", err);
    return res.status(500).json({ error: "Internal Server Error processing order." });
  }
});
`;

// Extract original content and replace the old '/api/orders' logic completely
const oldApiOrdersStart = content.indexOf('app.post("/api/orders"');
const patchOrdersStart = content.indexOf('app.patch("/api/orders/:id"'); // Next route

if (oldApiOrdersStart !== -1 && patchOrdersStart !== -1) {
  const before = content.slice(0, oldApiOrdersStart);
  const after = content.slice(patchOrdersStart);
  
  const finalContent = before + newOrdersApi + '\n' + after;
  fs.writeFileSync(serverFile, finalContent, 'utf8');
  console.log("Successfully replaced /api/orders with Supabase logic.");
} else {
  console.log("Failed to find boundaries in server.ts");
}
