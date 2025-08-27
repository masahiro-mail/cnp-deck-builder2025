import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase-client'
import { getRecommendedDecks } from '@/utils/deck-utils'
import { cards } from '@/data/cards'
import { generateDeckId } from '@/utils/deck-id-generator'

// 管理者権限チェック
function isAdmin(session: any): boolean {
  const username = session?.user?.username?.toLowerCase() || ''
  return username === 'diagram_wolf'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 管理者ユーザーの情報を取得
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('x_username', 'Diagram_Wolf')
      .single()

    if (userError || !adminUser) {
      return NextResponse.json({ 
        error: 'Admin user not found in database. Please login first.' 
      }, { status: 404 })
    }

    // 全カードIDを取得
    const allCardIds = cards.map(card => card.id)
    
    // 推奨デッキを取得
    const recommendedDecks = getRecommendedDecks(allCardIds)
    
    const importedDecks = []
    const errors = []

    for (const [deckId, deckData] of Object.entries(recommendedDecks)) {
      try {
        // デッキが既に存在するかチェック
        const { data: existingDeck } = await supabase
          .from('saved_decks')
          .select('id')
          .eq('deck_id', deckId)
          .eq('user_id', adminUser.id)
          .single()

        if (existingDeck) {
          console.log(`Deck already exists: ${deckData.name}`)
          continue
        }

        // カードIDからカードオブジェクトを取得
        const deckCards = deckData.cards.map(cardId => {
          const card = cards.find(c => c.id === cardId)
          if (!card) {
            console.warn(`Card not found: ${cardId}`)
            return null
          }
          return card
        }).filter(Boolean)

        // レイキカードの初期値を設定
        const raikiCards = {
          blue: 3,
          red: 3,
          yellow: 3,
          green: 3,
          purple: 3
        }

        // デッキをデータベースに保存
        const { data: savedDeck, error: saveError } = await supabase
          .from('saved_decks')
          .insert({
            user_id: adminUser.id,
            deck_name: deckData.name,
            deck_id: deckId,
            cards: deckCards,
            raiki_cards: raikiCards,
            is_public: true, // 公開設定
            description: `公式・コミュニティ推奨デッキ`
          })
          .select()
          .single()

        if (saveError) {
          throw saveError
        }

        importedDecks.push({
          name: deckData.name,
          deck_id: deckId,
          cards_count: deckCards.length
        })

        console.log(`Imported deck: ${deckData.name}`)
      } catch (error: any) {
        console.error(`Error importing deck ${deckData.name}:`, error)
        errors.push({
          deck_name: deckData.name,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported_count: importedDecks.length,
      imported_decks: importedDecks,
      errors: errors.length > 0 ? errors : undefined,
      message: `${importedDecks.length}個のデッキを公開デッキとして登録しました`
    })

  } catch (error: any) {
    console.error('Error importing decks:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}