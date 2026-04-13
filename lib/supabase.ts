// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PlayerStats = {
  player_name: string
  total_stars: number
  total_puzzles_completed: number
  badges: string[]
  stickers: string[]
  daily_sticker_collected: boolean
}