import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { saveDeck, getUserDecks, getUserByXId } from '@/lib/database'
import { upsertUserSupabase, saveDeckSupabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    })
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deck_name, deck_id, description, is_public = false } = await request.json()

    if (!deck_name || !deck_id) {
      return NextResponse.json({ error: 'Deck name and deck ID are required' }, { status: 400 })
    }

    // Supabase-jsクライアント経由でユーザー情報をupsert（作成/更新）
    console.log('Looking for user with X ID:', session.user.id)
    
    // ユーザー情報をSupabaseに保存/更新
    const user = await upsertUserSupabase({
      x_id: session.user.id,
      x_name: session.user.name || 'Unknown',
      x_username: session.user.username || session.user.id,
      x_icon_url: session.user.image || undefined
    })
    
    console.log('User upserted successfully:', { id: user.id, x_id: user.x_id, x_name: user.x_name })

    // Supabase-js経由でデッキ保存
    console.log('Saving deck with Supabase client:', {
      user_id: user.id,
      deck_name,
      deck_id,
      description,
      is_public
    })
    
    const savedDeck = await saveDeckSupabase({
      user_id: user.id,
      deck_name,
      deck_id,
      description,
      is_public
    })
    
    console.log('Deck saved successfully with Supabase:', savedDeck)

    return NextResponse.json(savedDeck, { status: 201 })
  } catch (error: any) {
    console.error('Error saving deck:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack
    })
    
    // データベース接続エラーの場合は適切なメッセージを返す
    if (error?.code === 'ENOTFOUND' || error?.code === '28P01') {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }
    
    // より具体的なエラーメッセージを返す
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザー情報取得
    const user = await getUserByXId(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ユーザーのデッキ一覧取得
    const decks = await getUserDecks(user.id!)

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    // データベース接続エラーの場合は適切なメッセージを返す
    if (error.code === 'ENOTFOUND' || error.code === '28P01') {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}