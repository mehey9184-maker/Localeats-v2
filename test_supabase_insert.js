import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabaseAdmin.from('orders').insert({
    idempotency_key: 'test-' + Date.now(),
    user_id: '00000000-0000-0000-0000-000000000000',
    shop_id: '18',
    status: 'pending',
    delivery_status: 'none',
    items: [],
    delivery_type: 'delivery'
  });
  console.log("Error:", error);
}
test();
