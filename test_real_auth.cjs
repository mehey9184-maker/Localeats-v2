require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function getRealToken() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const email = `testuser_${Date.now()}@example.com`;
  const password = "password123";
  
  console.log("Creating test user:", email);
  await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  
  if (error || !data.session) {
    console.error("Sign in failed:", error);
    process.exit(1);
  }
  
  console.log("Successfully obtained Real Token:", data.session.access_token.substring(0, 15) + "...");
  return { token: data.session.access_token, user_id: data.user.id };
}

getRealToken().then(({ token, user_id }) => {
  console.log(`export TEST_TOKEN="sb-${token}"`);
  console.log(`export TEST_USER_ID="${user_id}"`);
}).catch(e => console.error(e));
