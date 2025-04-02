
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://avocdhvgtmkguyboohkc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2b2NkaHZndG1rZ3V5Ym9vaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NTE2OTgsImV4cCI6MjA1OTEyNzY5OH0.NFACJYAVVyruWhBhddzj9R6qN6vC-ILr7McohWoD6Wo';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== undefined &&
    supabaseAnonKey !== undefined &&
    supabaseUrl !== 'https://your-project-url.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};
