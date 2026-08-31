async function fetchOpenApi() {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': process.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    }
  });
  const json = await res.json();
  if (json.definitions) {
     console.log("orders:", Object.keys(json.definitions.orders.properties));
     console.log("shops:", Object.keys(json.definitions.shops.properties));
  } else {
     console.log(json);
  }
}
fetchOpenApi();
