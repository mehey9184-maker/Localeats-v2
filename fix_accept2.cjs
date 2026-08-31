const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '    const { data: order, error: orderError } = await supabaseAdmin.from(\'orders\').select(\'shop_id\').eq(\'id\', id).single();\n    if (orderError || !order) return res.status(404).json({ error: "Order not found" });',
  '    let { data: order, error: orderError } = await supabaseAdmin.from(\'orders\').select(\'shop_id\').eq(\'id\', id).single();\n    if (orderError && orderError.code === "PGRST116") { orderError = null; order = null; }\n    let shopId = order?.shop_id;\n    if (orderError || !order) {\n      const memOrder = serverOrders.find(o => o.id === id);\n      if (!memOrder) return res.status(404).json({ error: "Order not found" });\n      shopId = memOrder.shop_id;\n    }'
);

code = code.replace(
  '    const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', order.shop_id).single();',
  '    const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', shopId).single();'
);


fs.writeFileSync('server.ts', code);
