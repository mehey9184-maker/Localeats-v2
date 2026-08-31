const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '       let isAuthorized = false;\n       if (order?.user_id === auth_user_id || serverOrders.find(o => o.id === id)?.user_id === auth_user_id) isAuthorized = true;',
  '       let isAuthorized = false;\n       const resolvedOrder = order || serverOrders.find(o => o.id === id);\n       if (resolvedOrder?.user_id === auth_user_id) isAuthorized = true;'
);

code = code.replace(
  '       if (!isAuthorized) {\n         const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', order?.shop_id || serverOrders.find(o => o.id === id)?.shop_id).single();',
  '       if (!isAuthorized) {\n         const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', resolvedOrder?.shop_id).single();'
);

code = code.replace(
  '       const { data: order, error: orderError } = await supabaseAdmin.from(\'orders\').select(\'user_id, shop_id\').eq(\'id\', id).single();',
  '       let { data: order, error: orderError } = await supabaseAdmin.from(\'orders\').select(\'user_id, shop_id\').eq(\'id\', id).single();\n       if (orderError && orderError.code === "PGRST116") { orderError = null; order = null; } // allow fallback'
);


fs.writeFileSync('server.ts', code);
