import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    const deckId = params.deckId

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 })
    }

    // デッキ情報を取得（レイキカード情報を含む）
    const { data: deckData, error } = await supabase
      .from('saved_decks')
      .select('deck_name, deck_id, raiki_cards, is_public, description')
      .eq('deck_id', deckId)
      .single()

    if (error && error.code === 'PGRST116') {
      // デッキが見つからない場合はnullを返す
      return NextResponse.json({ 
        deck: null, 
        message: 'Deck not found in database' 
      })
    }

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      deck: deckData,
      message: 'Deck found in database'
    })

  } catch (error: any) {
    console.error('Error fetching deck info:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}