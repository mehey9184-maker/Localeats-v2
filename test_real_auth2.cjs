require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function getRealToken() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // Just forge a JWT for any existing user using jsonwebtoken. Wait, we don't know the JWT secret!
  // Instead of signing in, let's just create a user with auto_confirm.
  // Wait! The user might already exist. Let's just create a user via signUp.
  
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const email = `testuser_${Date.now()}@example.com`;
  const password = "password123";
  
  const { data, error } = await anonClient.auth.signUp({ email, password });
  if (error) {
     console.error("SignUp error:", error);
     return;
  }
  
  // Try to sign in just in case signUp didn't return a session (if confirmation is required)
  let session = data.session;
  if (!session) {
     console.log("No session returned. Bypassing email confirmation using admin client...");
     await adminClient.auth.admin.updateUserById(data.user.id, { email_confirm: true });
     const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
     if (signInError) {
         console.error("SignIn error:", signInError);
         return;
     }
     session = signInData.session;
  }
  
  console.log("Successfully obtained Real Token:", session.access_token.substring(0, 15) + "...");
  console.log(`export TEST_TOKEN="sb-${session.access_token}"`);
  console.log(`export TEST_USER_ID="${session.user.id}"`);
}
getRealToken();
