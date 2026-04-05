import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

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
