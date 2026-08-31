require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function getRealToken() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  const email = `teejeyunam+test${Date.now()}@gmail.com`;
  const password = "Password123!";
  
  const { data, error } = await anonClient.auth.signUp({ email, password });
  if (error) {
     console.error("SignUp error:", error);
     return;
  }
  
  if (data.session) {
      console.log("Successfully obtained Real Token");
      console.log(`export TEST_TOKEN="sb-${data.session.access_token}"`);
      console.log(`export TEST_USER_ID="${data.user.id}"`);
  } else {
      console.log("Sign up requires confirmation, no session returned.");
  }
}
getRealToken();
