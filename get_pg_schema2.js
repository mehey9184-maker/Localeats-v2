import dotenv from "dotenv";
dotenv.config();

async function test() {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?limit=1`, {
    method: "GET",
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Accept": "application/json"
    }
  });
  console.log(await res.text());
  
  const res2 = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders`, {
    method: "OPTIONS",
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  console.log(await res2.text());
}
test();
