// Supabase クライアント（代替案）
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rmhqemnvtkdprcoswftk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaHFlbW52dGtkcHJjb3N3ZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NzUxMzksImV4cCI6MjA3MTU1MTEzOX0.EQolod9xOwrvD-v0fuJMCQqp17z-WDZ-Q7XHkqRPDto'

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

// ユーザーのデッキ取得（Supabase使用）
export async function getUserDecksSupabase(userId: number) {
  try {
    const { data, error } = await supabase
      .from('saved_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Supabase get user decks error:', error)
    throw error
  }
}

// ユーザーをX IDで取得（Supabase使用）
export async function getUserByXIdSupabase(xId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('x_id', xId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Supabase get user by X ID error:', error)
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