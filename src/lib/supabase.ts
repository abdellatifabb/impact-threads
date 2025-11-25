import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Helper to get current user profile with role
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Helper to check if user has specific role
export async function hasRole(role: string) {
  const profile = await getCurrentUserProfile();
  return profile?.role === role;
}
