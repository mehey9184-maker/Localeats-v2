import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabaseAdmin.from('orders').select('*').limit(1);
  console.log("Error:", error);
  if (data) {
     console.log("Data exists, keys would be:", data.length > 0 ? Object.keys(data[0]) : "Empty table, but success");
  }
}
check();
