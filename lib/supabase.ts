import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Debug: Check if env vars are loaded (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase URL:', supabaseUrl);
  console.log('🔍 Has Anon Key:', supabaseAnonKey !== 'placeholder-key');
}

// Production warning
if (typeof window !== 'undefined' && supabaseAnonKey === 'placeholder-key') {
  console.error('❌ SUPABASE_ANON_KEY not set! Check Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Attempt {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  status: "started" | "completed" | "abandoned";
  created_at: string;
}

export interface User {
  id: string;
  telegram_id: number;
  telegram_username: string;
  instagram_handle: string | null;
  display_name: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  time: number;
  instagram?: string;
  attempt_id: string;
  created_at: string;
}
