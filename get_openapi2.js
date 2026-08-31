import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function fetchOpenApi() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_ROLE_KEY}`);
  const json = await res.json();
  if (json.definitions) {
     console.log("definitions:", Object.keys(json.definitions));
  } else if (json.components && json.components.schemas) {
     console.log("orders:", Object.keys(json.components.schemas.orders.properties));
  } else {
     console.log(json);
  }
}
fetchOpenApi();
