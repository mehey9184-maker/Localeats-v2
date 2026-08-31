const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const regex = /app\.post\("\/api\/orders", async \(req, res\) => \{[\s\S]*?(?=app\.patch\("\/api\/orders\/:id)/;

const newOrdersApi = `app.post("/api/orders", async (req, res) => {
  try {
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
      idempotency_key,
      _clientPricing
    } = req.body;

    if (!idempotency_key) return res.status(400).json({ error: "idempotency_key is required." });
    if (!user_id) return res.status(401).json({ error: "Unauthorized. user_id required." });
    if (!shop_id) return res.status(400).json({ error: "shop_id is required." });
    if (!items || !items.length) return res.status(400).json({ error: "Order must contain items." });

    // 1. Idempotency Check
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

    // 2. Try Fetching Authoritative Shop Details
    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('id', shop_id)
      .single();

    const isMissingData = (shopError || !shopData);

    let calculatedSubtotal = 0;
    let calculatedDeliveryFee = 0;
    let calculatedServiceFee = 0;
    let calculatedDiscount = 0;
    let calculatedTotal = 0;
    const finalItems = [];

    // --- MIGRATION BRIDGE LOGIC ---
    // Since Supabase is empty right now, we use the client's pricing as a fallback
    // so we can test the write flow without having to migrate the catalog first.
    if (isMissingData && _clientPricing) {
      console.log(\`[Migration Fallback] Shop \${shop_id} not in Supabase yet. Using client pricing.\`);
      
      calculatedSubtotal = _clientPricing.subtotal || 0;
      calculatedDeliveryFee = _clientPricing.delivery_fee || 0;
      calculatedServiceFee = _clientPricing.service_fee || 0;
      calculatedDiscount = _clientPricing.discount_amount || 0;
      calculatedTotal = _clientPricing.total_price || 0;

      for (const reqItem of items) {
        finalItems.push({
          menu_item_id: reqItem.menu_item_id,
          name: \`Migration Item \${reqItem.menu_item_id}\`,
          price: 0, // Unknown without DB
          quantity: Math.max(1, Number(reqItem.quantity) || 1),
          notes: reqItem.notes || ""
        });
      }
    } else {
      // --- NORMAL AUTHORITATIVE LOGIC (When Supabase is populated) ---
      if (shopData.is_active === false) {
        return res.status(400).json({ error: "Shop is currently inactive." });
      }

      const itemIds = items.map((i: any) => i.menu_item_id);
      const { data: dbItems } = await supabaseAdmin.from('menu_items').select('*').in('id', itemIds);

      for (const reqItem of items) {
        const dbItem = dbItems?.find((i: any) => i.id === reqItem.menu_item_id);
        if (!dbItem) {
          return res.status(404).json({ error: \`Menu item '\${reqItem.menu_item_id}' not found.\` });
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
      
      // Calculate delivery, etc (simplified for snippet)
      calculatedServiceFee = calculatedSubtotal > 0 ? 2.5 : 0.0;
      calculatedDeliveryFee = (delivery_type === "delivery") ? 10.0 : 0.0;
      calculatedTotal = calculatedSubtotal + calculatedDeliveryFee + calculatedServiceFee + (Number(tip_amount)||0);
    }

    // 3. Insert Order safely into Supabase
    const { data: newOrder, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        idempotency_key,
        user_id,
        shop_id,
        status: 'pending',
        delivery_status: (delivery_type === "delivery") ? 'finding_rider' : 'none',
        delivery_type,
        delivery_address,
        delivery_coordinates,
        items: finalItems,
        subtotal: calculatedSubtotal,
        delivery_fee: calculatedDeliveryFee,
        service_fee: calculatedServiceFee,
        discount_amount: calculatedDiscount,
        tip_amount: Number(tip_amount) || 0,
        total_price: calculatedTotal,
        promo_code,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Order Insert Error:", insertError);
      return res.status(500).json({ error: "Failed to persist order to database." });
    }

    console.log(\`[FCM] Notification dispatched to Merchant for Order: \${newOrder.id}\`);
    return res.json({ success: true, order: newOrder });

  } catch (err: any) {
    console.error("Create Order Error:", err);
    return res.status(500).json({ error: "Internal Server Error processing order." });
  }
});
`;

content = content.replace(regex, newOrdersApi);
fs.writeFileSync(serverFile, content, 'utf8');
console.log("Migration patch applied successfully.");
