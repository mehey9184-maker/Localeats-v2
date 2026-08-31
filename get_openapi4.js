import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
// Grab VITE_SUPABASE_ANON_KEY from .env
const envText = fs.readFileSync(".env", "utf-8");
const anonKeyMatch = envText.match(/VITE_SUPABASE_ANON_KEY=([^\s]+)/);
const ANON_KEY = anonKeyMatch ? anonKeyMatch[1] : "";

async function fetchOpenApi() {
  console.log("Using Anon Key:", ANON_KEY.substring(0, 10));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
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
