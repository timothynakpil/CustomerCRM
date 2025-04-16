
// This file is redirecting to the main supabase client to avoid duplicate instances
import { supabase } from '@/integrations/supabase/client';

// Re-export the supabase client
export { supabase };

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const supabaseUrl = "https://avocdhvgtmkguyboohkc.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2b2NkaHZndG1rZ3V5Ym9vaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTE2OTgsImV4cCI6MjA1OTEyNzY5OH0.NFACJYAVVyruWhBhddzj9R6qN6vC-ILr7McohWoD6Wo";
  
  return (
    supabaseUrl !== undefined &&
    supabaseAnonKey !== undefined &&
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    !supabaseUrl.includes("your-project-url") &&
    !supabaseAnonKey.includes("your-anon-key")
  );
};
