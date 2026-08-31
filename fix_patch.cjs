const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '       const { data: order, error: orderError } = await supabaseAdmin.from(\'orders\').select(\'user_id, shop_id\').eq(\'id\', id).single();\n       if (orderError || !order) return res.status(404).json({ error: "Order not found" });',
  '       const { data: order, error: orderError } = await supabaseAdmin.from(\'orders\').select(\'user_id, shop_id\').eq(\'id\', id).single();\n       if (orderError || !order) {\n           const memOrder = serverOrders.find(o => o.id === id);\n           if (!memOrder) return res.status(404).json({ error: "Order not found" });\n           if (memOrder.user_id !== auth_user_id) return res.status(403).json({ error: "Unauthorized" });\n       }'
);

code = code.replace(
  '    const { data: order, error: fetchError } = await supabaseAdmin\n      .from(\'orders\')\n      .select(\'shop_id\')\n      .eq(\'id\', id)\n      .single();\n    if (fetchError || !order) {\n      return res.status(404).json({ error: "Order not found." });\n    }',
  '    const { data: order, error: fetchError } = await supabaseAdmin.from(\'orders\').select(\'shop_id\').eq(\'id\', id).single();\n    let shopId = order?.shop_id;\n    if (fetchError || !order) {\n      const memOrder = serverOrders.find(o => o.id === id);\n      if (!memOrder) return res.status(404).json({ error: "Order not found." });\n      shopId = memOrder.shop_id;\n    }'
);

code = code.replace(
  '    const { data: shop, error: shopError } = await supabaseAdmin\n      .from(\'shops\')\n      .select(\'owner_id\')\n      .eq(\'id\', order.shop_id)\n      .single();',
  '    const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', shopId).single();'
);

fs.writeFileSync('server.ts', code);
