import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { saveDeck, getUserDecks, getUserByXId } from '@/lib/database'
import { upsertUserSupabase, saveDeckSupabase, getUserDecksSupabase, getUserByXIdSupabase, getPublicDecksSupabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  console.log('=== DECK SAVE API START ===')
  try {
    console.log('1. Getting session...')
    const session = await getServerSession(authOptions)
    console.log('Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    })
    
    if (!session || !session.user?.id) {
      console.log('❌ No valid session - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('2. Parsing request body...')
    const { deck_name, deck_id, description, is_public = false, raiki_cards } = await request.json()
    console.log('Request body received:', { deck_name, deck_id, description, is_public, raiki_cards })

    console.log('3. Validating required fields...')
    if (!deck_name || !deck_id) {
      console.log('❌ Missing required fields:', { deck_name, deck_id })
      return NextResponse.json({ error: 'Deck name and deck ID are required' }, { status: 400 })
    }

    console.log('4. Processing Raiki cards...')
    // Raiki cardsのデフォルト値設定と検証
    let finalRaikiCards = raiki_cards
    if (!raiki_cards || typeof raiki_cards !== 'object') {
      console.log('Using default Raiki cards (3 each)')
      // デフォルト値: 各色3枚 (3x5=15)
      finalRaikiCards = { blue: 3, red: 3, yellow: 3, green: 3, purple: 3 }
    } else {
      const total = Object.values(raiki_cards).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0)
      console.log('Raiki cards total:', total)
      if (total !== 15) {
        console.log('❌ Invalid Raiki cards total:', total)
        return NextResponse.json({ 
          error: `Raiki cards must total exactly 15 cards (current total: ${total})`,
          received_raiki_cards: raiki_cards
        }, { status: 400 })
      }
    }
    console.log('Final Raiki cards:', finalRaikiCards)

    console.log('5. Upserting user...')
    // Supabase-jsクライアント経由でユーザー情報をupsert（作成/更新）
    console.log('Looking for user with X ID:', session.user.id)
    
    const userDataToUpsert = {
      x_id: session.user.id,
      x_name: session.user.name || 'Unknown',
      x_username: session.user.username || session.user.id,
      x_icon_url: session.user.image || undefined
    }
    console.log('User data to upsert:', userDataToUpsert)
    
    const user = await upsertUserSupabase(userDataToUpsert)
    
    console.log('✅ User upserted successfully:', { id: user.id, x_id: user.x_id, x_name: user.x_name })

    console.log('6. Saving deck...')
    const deckDataToSave = {
      user_id: user.id,
      deck_name,
      deck_id,
      description,
      is_public,
      raiki_cards: finalRaikiCards
    }
    console.log('Deck data to save:', deckDataToSave)
    
    const savedDeck = await saveDeckSupabase(deckDataToSave)
    
    console.log('✅ Deck saved successfully with Supabase:', savedDeck)
    console.log('=== DECK SAVE API SUCCESS ===')

    return NextResponse.json(savedDeck, { status: 201 })
  } catch (error: any) {
    console.log('=== DECK SAVE API ERROR ===')
    console.error('❌ Error saving deck:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack?.substring(0, 500) + '...'
    })
    
    // エラーの種類に応じた処理
    if (error?.message?.includes('Missing required Supabase environment variables')) {
      console.error('❌ Supabase environment variables not configured')
      return NextResponse.json({ error: 'Database configuration error' }, { status: 503 })
    }
    
    if (error?.code === 'ENOTFOUND' || error?.code === '28P01') {
      console.error('❌ Database connection failed')
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }
    
    // より具体的なエラーメッセージを返す
    const errorResponse = { 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    }
    console.error('Returning error response:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('=== GET /api/decks START ===')
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'user' または 'public'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('Query params:', { type, limit, offset })

    // 公開デッキを取得する場合
    if (type === 'public') {
      console.log('Getting public decks...')
      try {
        const publicDecks = await getPublicDecksSupabase(limit, offset)
        console.log('✅ Public decks retrieved:', publicDecks?.length || 0)
        return NextResponse.json(publicDecks || [])
      } catch (publicError: any) {
        console.error('❌ Public decks retrieval failed:', publicError.message)
        return NextResponse.json({ 
          error: 'Failed to retrieve public decks',
          details: process.env.NODE_ENV === 'development' ? publicError.message : undefined
        }, { status: 500 })
      }
    }

    // ユーザーのデッキを取得する場合（デフォルト）
    console.log('1. Getting session...')
    const session = await getServerSession(authOptions)
    console.log('GET /api/decks - Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userName: session?.user?.name,
      userEmail: session?.user?.email
    })
    
    if (!session || !session.user?.id) {
      console.log('❌ No session - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('2. Looking up user via Supabase...')
    // Supabase-js経由でユーザー情報取得
    let user
    try {
      user = await getUserByXIdSupabase(session.user.id)
      console.log('✅ User lookup successful:', user ? { id: user.id, x_id: user.x_id } : 'null')
    } catch (userError: any) {
      console.error('❌ User lookup failed:', userError.message)
      return NextResponse.json({ 
        error: 'User lookup failed',
        details: process.env.NODE_ENV === 'development' ? userError.message : undefined
      }, { status: 500 })
    }
    
    if (!user) {
      console.log('❌ User not found in database - this might be the first login')
      // ユーザーが見つからない場合は空の配列を返す（404ではなく）
      return NextResponse.json([])
    }

    console.log('3. Getting user decks via Supabase...')
    // Supabase-js経由でユーザーのデッキ一覧取得
    let decks
    try {
      decks = await getUserDecksSupabase(user.id)
      console.log('✅ Decks retrieved successfully:', decks?.length || 0)
    } catch (decksError: any) {
      console.error('❌ Decks retrieval failed:', decksError.message)
      return NextResponse.json({ 
        error: 'Failed to retrieve decks',
        details: process.env.NODE_ENV === 'development' ? decksError.message : undefined
      }, { status: 500 })
    }

    console.log('=== GET /api/decks SUCCESS ===')
    return NextResponse.json(decks || [])
  } catch (error: any) {
    console.log('=== GET /api/decks ERROR ===')
    console.error('❌ Error fetching decks:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack?.substring(0, 500)
    })
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    console.log('=== GET /api/decks END ===')
  }
}