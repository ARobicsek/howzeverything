// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file and Netlify environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);