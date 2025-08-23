import { NextRequest, NextResponse } from 'next/server'
import { getPublicDecks } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 公開デッキ一覧取得
    const decks = await getPublicDecks(limit, offset)

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Error fetching public decks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}