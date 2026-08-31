const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace PATCH /api/orders/:id
const patchStartMarker = 'app.patch("/api/orders/:id", async (req, res) => {';
const patchEndMarker = '});\n// API Endpoint to fetch orders for user or shop';

const patchStartIndex = content.indexOf(patchStartMarker);
const patchEndIndex = content.indexOf('// API Endpoint to fetch orders for user or shop');

if (patchStartIndex !== -1 && patchEndIndex !== -1) {
  const newPatch = `app.patch("/api/orders/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const auth_user_id = (req as any).user.id;
    
    // Explicit allowed-field policy
    const forbiddenFields = [
      'total_price', 'subtotal', 'delivery_fee', 'service_fee', 
      'discount_amount', 'user_id', 'shop_id', 'customer_id', 'rider_id'
    ];
    for (const field of forbiddenFields) {
      delete updates[field];
    }
    
    if (supabaseAdmin) {
       const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('user_id, shop_id').eq('id', id).single();
       if (orderError || !order) return res.status(404).json({ error: "Order not found" });

       let isAuthorized = false;
       if (order.user_id === auth_user_id) {
          isAuthorized = true;
       } else {
          const { data: shop } = await supabaseAdmin.from('shops').select('owner_id').eq('id', order.shop_id).single();
          if (shop && shop.owner_id === auth_user_id) {
             isAuthorized = true;
          }
       }

       if (!isAuthorized) {
          return res.status(403).json({ error: "Unauthorized. You cannot modify this order." });
       }

       const { data, error } = await supabaseAdmin
         .from('orders')
         .update({
           ...updates,
           updated_at: new Date().toISOString()
         })
         .eq('id', id)
         .select()
         .single();
         
       if (!error && data) {
         return res.json({ success: true, order: data });
       } else {
         console.error("Native PATCH error:", error);
       }
    }
    
    // Fallback to in-memory if supabase fails or isn't configured
    const existingIdx = serverOrders.findIndex((o) => o.id === id);
    if (existingIdx >= 0) {
      serverOrders[existingIdx] = {
        ...serverOrders[existingIdx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return res.json({ success: true, order: serverOrders[existingIdx] });
    }
    const newOrder = {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    serverOrders.unshift(newOrder);
    return res.json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error("Order update error:", err);
    return res.status(500).json({ error: err.message || "Failed to update order" });
  }
});
`;
  content = content.substring(0, patchStartIndex) + newPatch + content.substring(patchEndIndex);
} else {
  console.log("Could not find PATCH boundaries.");
}

// Replace GET /api/orders
const getStartMarker = 'app.get("/api/orders", (req, res) => {';
const getEndMarker = '});\n// API Endpoint for AI Powered Shop Chat Assistant';

const getStartIndex = content.indexOf(getStartMarker);
const getEndIndex = content.indexOf('// API Endpoint for AI Powered Shop Chat Assistant');

if (getStartIndex !== -1 && getEndIndex !== -1) {
  const newGet = `app.get("/api/orders", authenticateJWT, async (req, res) => {
  const { shop_id } = req.query;
  const auth_user_id = (req as any).user.id;

  let filtered = [...serverOrders];

  if (shop_id) {
    // Merchant request
    if (!supabaseAdmin) return res.status(500).json({ error: "DB not configured" });
    const { data: shop, error: shopError } = await supabaseAdmin.from('shops').select('owner_id').eq('id', shop_id).single();
    if (shopError || !shop || shop.owner_id !== auth_user_id) {
       return res.status(403).json({ error: "Unauthorized. You do not own this shop." });
    }
    filtered = filtered.filter((o) => String(o.shop_id) === String(shop_id));
  } else {
    // Customer request
    filtered = filtered.filter((o) => String(o.user_id) === String(auth_user_id));
  }

  return res.json({ orders: filtered });
});
`;
  content = content.substring(0, getStartIndex) + newGet + content.substring(getEndIndex);
} else {
  console.log("Could not find GET boundaries.");
}

fs.writeFileSync('server.ts', content, 'utf8');
