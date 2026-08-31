const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '    const { data: order, error: fetchError } = await supabaseAdmin.from(\'orders\').select(\'shop_id\').eq(\'id\', id).single();\n    let shopId = order?.shop_id;\n    if (fetchError || !order) {\n      const memOrder = serverOrders.find(o => o.id === id);\n      if (!memOrder) return res.status(404).json({ error: "Order not found." });\n      shopId = memOrder.shop_id;\n    }',
  '    let { data: order, error: fetchError } = await supabaseAdmin.from(\'orders\').select(\'shop_id\').eq(\'id\', id).single();\n    if (fetchError && fetchError.code === "PGRST116") { fetchError = null; order = null; }\n    let shopId = order?.shop_id;\n    if (fetchError || !order) {\n      const memOrder = serverOrders.find(o => o.id === id);\n      if (!memOrder) return res.status(404).json({ error: "Order not found." });\n      shopId = memOrder.shop_id;\n    }'
);

fs.writeFileSync('server.ts', code);
