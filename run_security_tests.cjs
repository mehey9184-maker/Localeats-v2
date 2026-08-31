const http = require('http');

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("--- Starting Security Tests ---");

  const TEST_TOKEN = "test-token-123";
  const authUserId = "test_user_uuid";
  
  // 1. unauthenticated order creation
  let res = await request('POST', '/api/orders', { shop_id: 1, items: [{menu_item_id:1, quantity:1}], idempotency_key: 'test1' });
  console.log("1. Unauthenticated creation:", res.status === 401 ? 'PASS 401' : `FAIL ${res.status}`);

  // 2. authenticated order creation
  // Wait, shop_id 1 doesn't exist in Supabase DB (or it does?). If it doesn't, we hit migration fallback if we provide _clientPricing.
  res = await request('POST', '/api/orders', { 
    shop_id: 1, 
    items: [{menu_item_id:1, quantity:1}], 
    idempotency_key: 'test2_' + Date.now(),
    _clientPricing: { subtotal: 10, total_price: 15 }
  }, TEST_TOKEN);
  console.log("2. Authenticated creation:", res.status === 200 ? 'PASS 200' : `FAIL ${res.status}`);
  const orderId = res.data?.order?.id;

  // 3. forged user_id
  res = await request('POST', '/api/orders', { 
    shop_id: 1, 
    user_id: 'fake_user_id',
    items: [{menu_item_id:1, quantity:1}], 
    idempotency_key: 'test3_' + Date.now(),
    _clientPricing: { subtotal: 10, total_price: 15 }
  }, TEST_TOKEN);
  console.log("3. Forged user_id (checking if overridden):", res.data?.order?.user_id === authUserId ? 'PASS Overridden' : `FAIL ${res.data?.order?.user_id}`);

  // 4. forged total_price / 5. forged delivery_fee
  // Actually, for order creation, the fallback uses _clientPricing if the DB fails. But in the regular path, it ignores it.
  // Let's test PATCH for forged financial fields.
  
  if (orderId) {
    // 8. unauthorized PATCH
    // Since we created the order, we are the customer. What if a different user patches?
    // Wait, the API allows the customer to patch? Yes, `if (order.user_id === auth_user_id) isAuthorized = true;`
    // Let's test financial field mutation via PATCH
    res = await request('PATCH', `/api/orders/${orderId}`, {
      status: 'cancelled',
      total_price: 1, // should be ignored
      delivery_fee: 0
    }, TEST_TOKEN);
    console.log("8. PATCH allowed for owner:", res.status === 200 ? 'PASS 200' : `FAIL ${res.status}`);
    
    // 9. attempt to modify financial fields
    console.log("9. Financial fields unmodified:", (res.data?.order?.total_price !== 1) ? 'PASS Ignored' : 'FAIL modified');
  }

  // 10. customer order list isolation
  res = await request('GET', '/api/orders', null, TEST_TOKEN);
  const isIsolated = res.data?.orders?.every(o => o.user_id === authUserId);
  console.log("10. Customer order isolation:", isIsolated ? 'PASS Isolated' : 'FAIL Leak');
  
  // To test Merchant (6, 7, 11), the API does `supabaseAdmin.from('shops').select('owner_id')`.
  // Since we don't have a shop with this UUID, we should get 403.
  res = await request('GET', '/api/orders?shop_id=9999', null, TEST_TOKEN);
  console.log("11. Unauthorized merchant order isolation:", res.status === 403 ? 'PASS 403' : `FAIL ${res.status}`);
  
  if (orderId) {
    res = await request('POST', `/api/v1/orders/${orderId}/accept`, {}, TEST_TOKEN);
    console.log("6. Unauthorized merchant accept:", res.status === 403 ? 'PASS 403' : `FAIL ${res.status}`);
  }

  console.log("--- Tests Complete ---");
}

runTests();
