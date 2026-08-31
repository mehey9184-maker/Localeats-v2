const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add authenticateJWT if not exists
if (!content.includes('const authenticateJWT')) {
  console.log("Adding authenticateJWT");
  const authMiddleware = `
// Authentication Middleware
const authenticateJWT = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Auth misconfigured" });
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal error verifying token" });
  }
};
`;
  content = content.replace('// API Endpoint for resilient Profile Sync', authMiddleware + '\n// API Endpoint for resilient Profile Sync');
}

// 2. Rewrite POST /api/orders
const newPostOrders = `app.post("/api/orders", authenticateJWT, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Backend Supabase connection not configured." });
    }

    const { 
      items, 
      shop_id, 
      // user_id is ignored from req.body
      delivery_type, 
      delivery_coordinates,
      delivery_address,
      promo_code,
      tip_amount,
      idempotency_key,
      _clientPricing,
      customer_details,
      payment_method
    } = req.body;
    
    const auth_user_id = (req as any).user.id;

    console.log("[API /orders] Request received for shop:", shop_id, "with clientPricing:", !!_clientPricing);

    if (!idempotency_key) return res.status(400).json({ error: "idempotency_key is required." });
    if (!shop_id) return res.status(400).json({ error: "shop_id is required." });
    if (!items || !items.length) return res.status(400).json({ error: "Order must contain items." });

    const { data: shopData, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('id', shop_id)
      .single();

    const isMissingData = (shopError || !shopData);
    console.log("[API /orders] isMissingData?", isMissingData, "shopError:", shopError);

    let calculatedSubtotal = 0;
    let calculatedDeliveryFee = 0;
    let calculatedServiceFee = 0;
    let calculatedTotal = 0;
    let productName = "";
    let quantity = 0;

    // MIGRATION BRIDGE
    if (isMissingData && _clientPricing) {
      console.log(\`[Migration Fallback] Shop \${shop_id} not in Supabase yet. Using client pricing.\`);
      calculatedSubtotal = _clientPricing.subtotal || 0;
      calculatedDeliveryFee = _clientPricing.delivery_fee || 0;
      calculatedServiceFee = _clientPricing.service_fee || 0;
      calculatedTotal = _clientPricing.total_price || 0;
      productName = items.map((i: any) => \`Migration Item \${i.menu_item_id}\`).join(", ");
      quantity = items.reduce((acc: number, i: any) => acc + Math.max(1, Number(i.quantity) || 1), 0);
    } else {
      if (isMissingData && !_clientPricing) {
        console.error("[API /orders] Missing shop data AND missing _clientPricing!");
        return res.status(404).json({ error: \`Shop '\${shop_id}' not found.\` });
      }
      if (shopData.is_active === false) {
        return res.status(400).json({ error: "Shop is currently inactive." });
      }

      const itemIds = items.map((i: any) => i.menu_item_id);
      const { data: dbItems } = await supabaseAdmin.from('menu_items').select('*').in('id', itemIds);

      const productNames = [];
      for (const reqItem of items) {
        const dbItem = dbItems?.find((i: any) => i.id === reqItem.menu_item_id);
        if (!dbItem) {
          return res.status(404).json({ error: \`Menu item '\${reqItem.menu_item_id}' not found.\` });
        }
        const authoritativePrice = Number(dbItem.price || 0);
        const qty = Math.max(1, Number(reqItem.quantity) || 1);
        calculatedSubtotal += (authoritativePrice * qty);
        quantity += qty;
        productNames.push(dbItem.name);
      }
      productName = productNames.join(", ");
      
      calculatedServiceFee = calculatedSubtotal > 0 ? 2.5 : 0.0;
      calculatedDeliveryFee = (delivery_type === "delivery") ? 10.0 : 0.0;
      calculatedTotal = calculatedSubtotal + calculatedDeliveryFee + calculatedServiceFee + (Number(tip_amount)||0);
    }

    // Ensure atomic insert by checking idempotency_key manually if table doesn't have unique constraint,
    // though the best is a DB constraint. For safety:
    const { data: existingOrder } = await supabaseAdmin.from('orders').select('id').eq('idempotency_key', idempotency_key).single();
    if (existingOrder) {
       return res.json({ success: true, order: existingOrder, message: "Order already exists" });
    }

    const insertPayload = {
      user_id: auth_user_id,
      shop_id: String(shop_id),
      status: 'pending',
      delivery_status: (delivery_type === "delivery") ? 'finding_rider' : 'none',
      product_name: productName,
      quantity,
      price: calculatedSubtotal,
      total_price: calculatedTotal,
      delivery_fee: calculatedDeliveryFee,
      is_delivery: delivery_type === "delivery",
      payment_method: payment_method || 'card',
      notes: items.map((i: any) => i.notes).filter(Boolean).join(" | "),
      delivery_instructions: customer_details?.delivery_instructions || "",
      customer_name: customer_details?.name || "Guest",
      phone: customer_details?.phone || "",
      email: customer_details?.email || "",
      address: delivery_address || customer_details?.address || "",
      city: customer_details?.city || "Cape Town",
      lat: delivery_coordinates?.lat || 0,
      lng: delivery_coordinates?.lng || 0,
      idempotency_key
    };
    
    console.log("[API /orders] Inserting Payload:", insertPayload);
    const { data: newOrder, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      if (insertError.code === 'PGRST116' || insertError.code === '23505' /* Unique violation */) {
         // might be a duplicate race condition
      } else if (insertError.message && insertError.message.includes('idempotency_key')) {
         // fallback if column doesn't exist
         delete insertPayload.idempotency_key;
         const { data: fallbackOrder, error: fallbackError } = await supabaseAdmin.from('orders').insert(insertPayload).select().single();
         if (fallbackError) {
           console.error("Order Insert Error (Fallback):", fallbackError);
           return res.status(500).json({ error: "Failed to persist order. " + fallbackError.message });
         }
         return res.json({ success: true, order: fallbackOrder });
      } else {
         console.error("Order Insert Error:", insertError);
         return res.status(500).json({ error: "Failed to persist order to database. " + (insertError.message || JSON.stringify(insertError)) });
      }
    }

    return res.json({ 
       success: true, 
       order: newOrder || existingOrder
     });
  } catch (err: any) {
    console.error("Create Order Error:", err);
    return res.status(500).json({ error: "Internal Server Error processing order." });
  }
});`;

const postOrdersRegex = /app\.post\("\/api\/orders", async \(req, res\) => \{[\s\S]*?\}\);\n\n\/\/ API Endpoint to accept an order/g;
if (content.match(postOrdersRegex)) {
  content = content.replace(postOrdersRegex, newPostOrders + '\n\n// API Endpoint to accept an order');
} else {
  console.log("Could not find POST /api/orders");
}

fs.writeFileSync('server.ts', content, 'utf8');
