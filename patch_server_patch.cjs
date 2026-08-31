const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = /app\.patch\("\/api\/orders\/:id", \(req, res\) => \{[\s\S]*?(?=app\.delete\("\/api\/orders\/:id)/;

const replacement = `app.patch("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating order in Supabase:", error);
        return res.status(500).json({ error: "Failed to update order" });
      }
      return res.json({ success: true, order: data });
    } else {
      return res.status(500).json({ error: "Backend Supabase connection not configured." });
    }
  } catch (err) {
    console.error("Patch Order Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code, 'utf8');
console.log("Patched server.ts PATCH handler");
