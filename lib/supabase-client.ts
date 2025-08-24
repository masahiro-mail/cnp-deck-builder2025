// Supabase クライアント（代替案）
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmhqemnvtkdprcoswftk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaHFlbW52dGtkcHJjb3N3ZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MzI2NzgsImV4cCI6MjA1MDEwODY3OH0.PdCjFHvNywPt-PTU9lFPFQYN6JN5rYYKZjWvYKt2kX4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ユーザー管理（Supabase Auth使用）
export async function upsertUserSupabase(userData: {
  x_id: string
  x_name: string
  x_username: string
  x_icon_url?: string
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          x_id: userData.x_id,
          x_name: userData.x_name,
          x_username: userData.x_username,
          x_icon_url: userData.x_icon_url,
          updated_at: new Date().toISOString(),
        },
        { 
          onConflict: 'x_id',
          ignoreDuplicates: false 
        }
      )
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Supabase upsert user error:', error)
    throw error
  }
}

// デッキ保存（Supabase使用）
export async function saveDeckSupabase(deckData: {
  user_id: number
  deck_name: string
  deck_id: string
  description?: string
  is_public: boolean
}) {
  try {
    const { data, error } = await supabase
      .from('saved_decks')
      .insert([deckData])
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Supabase save deck error:', error)
    throw error
  }
}

// 接続テスト（Supabase使用）
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) throw error
    return { connected: true, method: 'supabase-js' }
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.message, 
      method: 'supabase-js' 
    }
  }
}