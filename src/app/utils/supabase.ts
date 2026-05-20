import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, publicAnonKey);
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

export interface SupabaseClimb {
  id: string;
  name: string;
  falesia: string;
  grade: string;
  is_lead: '0' | '1';
  difficulty: number;
  day: string;
  latitude?: number;
  longitude?: number;
  user_id?: string;
  created_at?: string;
}