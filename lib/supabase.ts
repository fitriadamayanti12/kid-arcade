// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// TYPES
// ============================================

export type PlayerStats = {
  player_name: string
  total_stars: number
  total_puzzles_completed: number
  badges: string[]
  stickers: string[]
  daily_sticker_collected: boolean
}

export interface Question {
  id: number;
  word: string;
  display_word: string;
  answer: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kid-arcade-token', token)
  }
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kid-arcade-token')
  }
  return null
}

function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kid-arcade-token')
  }
}

// ============================================
// LOGIN PLAYER (dengan multiple fallback)
// ============================================

export async function loginPlayer(username: string) {
  const trimmed = username.trim()
  console.log('🔑 Login attempt:', trimmed)

  try {
    // Coba cari player existing
    const { data: existing, error: findError } = await supabase
      .from('players')
      .select('*')
      .ilike('username', trimmed)
      .single()

    // Kalau tabel belum ada (error PGRST204)
    if (findError) {
      console.warn('⚠️ Database error:', findError.code, '- menggunakan mode offline')
      return createOfflinePlayer(trimmed)
    }

    if (existing) {
      // Player ditemukan - update last played
      console.log('👋 Welcome back:', existing.username)
      try {
        await supabase
          .from('players')
          .update({ last_played_at: new Date().toISOString() })
          .eq('id', existing.id)
      } catch (e) { /* ignore */ }

      // Coba RPC token
      try {
        const { data: tokenData } = await supabase.rpc('login_player', { p_username: trimmed })
        if (tokenData?.token) saveToken(tokenData.token)
      } catch (e) { /* RPC belum ada */ }

      return {
        status: 'success',
        username: existing.username,
        avatar: existing.avatar || '👦',
        total_stars: existing.total_stars || 0,
        total_games: existing.total_games_played || 0,
        badges: existing.badges || [],
      }
    }

    // Player baru - coba insert
    console.log('🆕 Creating new player:', trimmed)
    const { data: newPlayer, error: insertError } = await supabase
      .from('players')
      .insert([{
        username: trimmed,
        total_stars: 0,
        total_games_played: 0,
        badges: [],
        stickers: [],
        avatar: '👦',
        streak: 0,
        owned_items: [],
        created_at: new Date().toISOString(),
        last_played_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (insertError) {
      console.warn('⚠️ Insert error:', insertError.code, '- menggunakan mode offline')
      return createOfflinePlayer(trimmed)
    }

    // Kasih stiker random
    const stickers = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸']
    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)]
    try {
      await supabase.from('players').update({ stickers: [randomSticker] }).eq('id', newPlayer.id)
    } catch (e) { /* ignore */ }

    return {
      status: 'success',
      username: newPlayer.username,
      avatar: '👦',
      total_stars: 0,
      total_games: 0,
      badges: [],
    }

  } catch (error: any) {
    console.warn('⚠️ Login fallback:', error.message)
    return createOfflinePlayer(trimmed)
  }
}

// Fallback: player offline (tanpa database)
function createOfflinePlayer(username: string) {
  return {
    status: 'success',
    username: username,
    avatar: '👦',
    total_stars: 0,
    total_games: 0,
    badges: [],
  }
}

// ============================================
// SAVE GAME SCORE (dengan fallback)
// ============================================

export async function saveGameScore(
  playerName: string,
  gameType: string,
  stars: number,
  score: number,
  extras: any = {}
) {
  try {
    // Insert score
    const { error: scoreError } = await supabase.from('game_scores').insert([{
      player_name: playerName,
      game_type: gameType,
      stars,
      score,
      completed_at: new Date().toISOString(),
    }])

    if (scoreError) {
      console.warn('⚠️ Score save error (non-critical):', scoreError.code)
      return { newBadge: null }
    }

    // Update player stats
    const { data: stats } = await supabase
      .from('players')
      .select('*')
      .ilike('username', playerName)
      .single()

    if (stats) {
      const newTotalStars = (stats.total_stars || 0) + stars
      const newTotalGames = (stats.total_games_played || 0) + 1

      await supabase
        .from('players')
        .update({
          total_stars: newTotalStars,
          total_games_played: newTotalGames,
          last_played_at: new Date().toISOString(),
        })
        .eq('id', stats.id)
    }

    return { newBadge: null }
  } catch (error) {
    console.warn('⚠️ Save score fallback (non-critical)')
    return { newBadge: null }
  }
}

// ============================================
// GET PLAYER STATS
// ============================================

export async function getPlayerStats(playerName: string): Promise<PlayerStats | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .ilike('username', playerName)
      .single()

    if (error || !data) return null

    return {
      player_name: data.username,
      total_stars: data.total_stars || 0,
      total_puzzles_completed: data.total_games_played || 0,
      badges: data.badges || [],
      stickers: data.stickers || [],
      daily_sticker_collected: data.daily_sticker_collected || false,
    }
  } catch {
    return null
  }
}

// ============================================
// LEADERBOARD
// ============================================

export async function getLeaderboard(limit = 50) {
  try {
    const { data } = await supabase
      .from('players')
      .select('username, avatar, total_stars, total_games_played')
      .order('total_stars', { ascending: false })
      .limit(limit)

    return data || []
  } catch {
    return []
  }
}

// ============================================
// PLAYER ACTIONS
// ============================================

export async function updatePlayerAvatar(playerName: string, avatar: string) {
  try {
    await supabase.from('players').update({ avatar }).ilike('username', playerName)
  } catch { /* ignore */ }
}

export async function updatePlayerStickers(playerName: string, stickers: string[]) {
  try {
    await supabase.from('players').update({ stickers }).ilike('username', playerName)
  } catch { /* ignore */ }
}

export async function getPlayerScores(playerName: string) {
  try {
    const { data } = await supabase
      .from('game_scores')
      .select('*')
      .eq('player_name', playerName)
      .order('completed_at', { ascending: false })
      .limit(20)
    return data || []
  } catch {
    return []
  }
}

// ============================================
// AUTH (no-op untuk sekarang)
// ============================================

export async function validateSession() {
  return null
}

export async function logoutPlayer() {
  removeToken()
}