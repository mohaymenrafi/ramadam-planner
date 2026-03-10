import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Create client only when configured; dummy client otherwise to avoid runtime errors
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export type ProgressRow = {
  id: string
  user_id: string
  statuses: Record<string, 'yes' | 'no' | 'pending'>
  selected_day: number
  updated_at: string
}
