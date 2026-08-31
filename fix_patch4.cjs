const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '       let isAuthorized = false;\n       if (order.user_id === auth_user_id) {',
  '       let isAuthorized = false;\n       const resolvedOrder = order || serverOrders.find(o => o.id === id);\n       if (resolvedOrder?.user_id === auth_user_id) {'
);

code = code.replace(
  '         const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', order.shop_id).single();',
  '         const { data: shop, error: shopError } = await supabaseAdmin.from(\'shops\').select(\'owner_id\').eq(\'id\', resolvedOrder?.shop_id).single();'
);

fs.writeFileSync('server.ts', code);
