import { supabaseAnonKey, supabaseUrl } from "./src/lib/supabase.js";
import fetch from "node-fetch";

async function fetchOpenApi() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
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
