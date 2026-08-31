const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: shops } = await supabase.from('shops').select('*').limit(1);
  console.log("Shops:", shops);
  const { data: profiles } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles:", profiles);
}
run();
