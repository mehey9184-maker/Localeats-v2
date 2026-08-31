require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function getRealToken() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  const email = `test.user.local.eats.2@example.com`;
  const password = "password123";
  
  await adminClient.auth.admin.createUser({ email, password, email_confirm: true });
  
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
  if (signInError) {
      console.error("SignIn error:", signInError);
      return;
  }
  
  const session = signInData.session;
  console.log("Successfully obtained Real Token");
  console.log(`export TEST_TOKEN="sb-${session.access_token}"`);
  console.log(`export TEST_USER_ID="${session.user.id}"`);
  
  // Also create a shop for this user
  await adminClient.from('shops').insert({
     id: 99999,
     owner_id: session.user.id,
     name: 'Test Shop'
  });
}
getRealToken();
