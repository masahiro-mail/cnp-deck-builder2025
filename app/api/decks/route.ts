import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { saveDeck, getUserDecks, getUserByXId } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deck_name, deck_id, description, is_public = false } = await request.json()

    if (!deck_name || !deck_id) {
      return NextResponse.json({ error: 'Deck name and deck ID are required' }, { status: 400 })
    }

    // ユーザー情報取得
    const user = await getUserByXId(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // デッキ保存
    const savedDeck = await saveDeck({
      user_id: user.id!,
      deck_name,
      deck_id,
      description,
      is_public
    })

    return NextResponse.json(savedDeck, { status: 201 })
  } catch (error) {
    console.error('Error saving deck:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}