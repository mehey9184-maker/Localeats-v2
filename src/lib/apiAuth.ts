import { supabase } from './supabase';
import { auth } from './firebase';

export async function getApiAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer sb-${session.access_token}` };
    }
  } catch (e) {
    console.warn("Supabase auth check failed", e);
  }

  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer fb-${token}` };
    }
  } catch (e) {
    console.warn("Firebase auth check failed", e);
  }

  return {};
}
