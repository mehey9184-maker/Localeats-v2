import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabaseAdmin.from('orders').insert({
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    shop_id: '18',
    status: 'pending',
    delivery_status: 'none',
    product_name: 'test',
    quantity: 1,
    price: 1,
    total_price: 1,
    delivery_fee: 1,
    is_delivery: true,
    payment_method: 'card',
    notes: 'test',
    delivery_instructions: 'test',
    customer_name: 'test',
    phone: 'test',
    email: 'test',
    address: 'test',
    city: 'test',
    lat: 1,
    lng: 1
  }).select();
  console.log(error, data);
}
test();
