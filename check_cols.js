import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabaseAdmin.from('orders').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    shop_id: '18',
    status: 'pending',
    delivery_status: 'none',
    product_name: 'Test',
    quantity: 1,
    price: 10,
    total_price: 10,
    delivery_fee: 0,
    is_delivery: true,
    payment_method: 'card',
    customer_name: 'Test',
    phone: '123',
    email: 'test@example.com',
    address: '123',
    city: 'Cape Town',
    lat: 0,
    lng: 0
  });
  console.log("Error:", error);
}
test();
