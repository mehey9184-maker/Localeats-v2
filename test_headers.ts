import { supabase } from './src/lib/supabase';
import { getFirebaseAuth } from './src/lib/firebase';

export async function getApiAuthHeaders() {
  // Try Supabase first
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer sb-${session.access_token}` };
  }
  
  // Try Firebase guest
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    return { Authorization: `Bearer fb-${token}` };
  }
  
  return {};
}
