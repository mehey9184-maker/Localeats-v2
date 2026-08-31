import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'orders' });
  console.log("RPC Error:", error);
  // Alternative way using a dummy insert to get the full error message
  const { error: e2 } = await supabaseAdmin.from('orders').insert({ BAD_COLUMN_BLAH: 1 });
  console.log("Insert Error:", e2);
  
  // Or just query the items
  const { data: d3 } = await supabaseAdmin.from('orders').select('*').limit(1);
  if(d3 && d3.length > 0) {
      console.log(Object.keys(d3[0]));
  } else {
      console.log("No rows to infer schema from.");
  }
}
test();
