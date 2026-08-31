import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabaseAdmin.from('shops').select('id, name').limit(5);
  console.log("Shops Error:", error);
  console.log("Shops Data:", data);
  
  const { data: s18, error: e18 } = await supabaseAdmin.from('shops').select('id, name').eq('id', 18).single();
  console.log("Shop 18 (int):", s18, e18);
  
  const { data: s18s, error: e18s } = await supabaseAdmin.from('shops').select('id, name').eq('id', '18').single();
  console.log("Shop 18 (str):", s18s, e18s);
}
check();
