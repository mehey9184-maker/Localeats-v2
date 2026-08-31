const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '       let isAuthorized = false;\n       if (order.user_id === auth_user_id) isAuthorized = true;',
  '       let isAuthorized = false;\n       if (order?.user_id === auth_user_id || serverOrders.find(o => o.id === id)?.user_id === auth_user_id) isAuthorized = true;'
);

code = code.replace(
  '       const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', order.shop_id).single();',
  '       const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', order?.shop_id || serverOrders.find(o => o.id === id)?.shop_id).single();'
);

fs.writeFileSync('server.ts', code);
