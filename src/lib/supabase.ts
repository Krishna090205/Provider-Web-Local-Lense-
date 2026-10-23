import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Fallback dummy URL to prevent createClient from throwing if env is unset
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-locallens.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key-locallens';

export const supabase = createClient<Database>(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
