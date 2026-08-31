const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const startMarker = 'app.post("/api/v1/orders/:id/accept", async (req, res) => {';
const endMarker = '});\napp.patch("/api/orders/:id"';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf('app.patch("/api/orders/:id"');

if (startIndex !== -1 && endIndex !== -1) {
  const newAccept = `app.post("/api/v1/orders/:id/accept", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { prepTimeMinutes, merchantNotes, customEstimatedDelivery } = req.body;
    const auth_user_id = (req as any).user.id;
    
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Server database connection is not configured." });
    }

    const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('shop_id').eq('id', id).single();
    if (orderError || !order) return res.status(404).json({ error: "Order not found" });

    const { data: shop, error: shopError } = await supabaseAdmin.from('shops').select('owner_id').eq('id', order.shop_id).single();
    if (shopError || !shop || shop.owner_id !== auth_user_id) {
       return res.status(403).json({ error: "Unauthorized. You do not own this shop." });
    }

    const updates: Record<string, any> = {
      status: 'preparing',
      updated_at: new Date().toISOString()
    };
    
    if (prepTimeMinutes !== undefined) updates.prep_time_minutes = prepTimeMinutes;
    if (merchantNotes !== undefined) updates.merchant_notes = merchantNotes;
    if (customEstimatedDelivery !== undefined) updates.estimated_delivery_time = customEstimatedDelivery;
    updates.accepted_at = new Date().toISOString();

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST204' || updateError.message.includes('Could not find')) {
         console.warn("[API /orders/accept] Missing extended columns, falling back to basic update:", updateError.message);
         const { data: fallbackOrder, error: fallbackError } = await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'preparing',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
          
         if (fallbackError) {
            console.error("Order Accept Fallback Error:", fallbackError);
            return res.status(500).json({ error: "Failed to accept order (fallback).", details: fallbackError.message });
         }
         return res.json({ success: true, order: fallbackOrder });
      }

      console.error("Order Accept Update Error:", updateError);
      return res.status(500).json({ error: "Failed to accept order.", details: updateError.message });
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Order Accept Catch Error:", err);
    return res.status(500).json({ error: "Internal server error accepting order." });
  }
});
`;
  content = content.substring(0, startIndex) + newAccept + content.substring(endIndex);
  fs.writeFileSync('server.ts', content, 'utf8');
} else {
  console.log("Could not find start/end indexes.");
}
