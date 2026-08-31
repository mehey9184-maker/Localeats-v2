const http = require('http');

async function runTest() {
  const TEST_TOKEN = "test-token-123";
  const req = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` }
  }, res => {
    let d = ''; res.on('data', chunk => d+=chunk);
    res.on('end', () => {
       const orderId = JSON.parse(d).order.id;
       const req2 = http.request({
         hostname: '127.0.0.1', port: 3000, path: `/api/orders/${orderId}`, method: 'PATCH',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEST_TOKEN}` }
       }, res2 => {
         let d2 = ''; res2.on('data', chunk => d2+=chunk);
         res2.on('end', () => { console.log("PATCH 500 ERROR:", d2); });
       });
       req2.write(JSON.stringify({ status: 'cancelled' })); req2.end();
    });
  });
  req.write(JSON.stringify({ shop_id: 1, items: [{menu_item_id:1, quantity:1}], idempotency_key: 'test_patch_4', _clientPricing: { subtotal: 10, total_price: 15 } }));
  req.end();
}
runTest();
