import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase-client'

// 管理者権限チェック
function isAdmin(session: any): boolean {
  return session?.user?.name === '図解師★ウルフ'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 全デッキを取得
    const { data: decks, error } = await supabase
      .from('saved_decks')
      .select(`
        *,
        users!saved_decks_user_id_fkey(
          x_name,
          x_username,
          x_icon_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(decks || [])
  } catch (error: any) {
    console.error('Error fetching all decks:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { deckId } = await request.json()

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 })
    }

    // デッキを削除（管理者権限）
    const { error } = await supabase
      .from('saved_decks')
      .delete()
      .eq('id', deckId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting deck as admin:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}