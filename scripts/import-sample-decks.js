const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://rmhqemnvtkdprcoswftk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaHFlbW52dGtkcHJjb3N3ZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzMjMxMDgsImV4cCI6MjAzOTg5OTEwOH0.VTBmLWWAjzMHTzIFM8FqC19TCNqhQWLGvnrR_YyLJPI'

const supabase = createClient(supabaseUrl, supabaseKey)

// カードデータ（簡略版）
const cardMap = {
  "BT1-1": { id: "BT1-1", name: "アクアノーヴァの元飼い猫", type: "ユニット", cost: 2, bp: 2000, sp: 1000, color: "blue" },
  "BT1-2": { id: "BT1-2", name: "式神・クラゲ", type: "ユニット", cost: 2, bp: 1000, sp: 1000, color: "blue" },
  // ... 他のカードも同様に定義
}

// デッキデータ
const sampleDecks = [
  {
    name: "🥇REYさん(2025/04/30) 🟥5🟦10",
    deckId: "btaevkeaaxacavdavaaaadvakazaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    description: "公式・コミュニティ推奨デッキ",
    cards: [] // デコード済みカード配列
  },
  {
    name: "🥈モーリーさん(2025/04/30)🟥15",
    deckId: "btaavaeaaacaaaaaazvqaqvavaubaakaeaaaaaaaaaaaaaaaaaaaaaaaaaaa", 
    description: "公式・コミュニティ推奨デッキ",
    cards: []
  },
  // 他のデッキも同様に...
]

async function importDecks() {
  try {
    // 管理者ユーザーを確認
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('x_username', 'Diagram_Wolf')
      .single()

    if (userError || !user) {
      console.error('管理者ユーザーが見つかりません:', userError)
      return
    }

    console.log('管理者ユーザーID:', user.id)

    // 各デッキを保存
    for (const deck of sampleDecks) {
      try {
        const { data, error } = await supabase
          .from('saved_decks')
          .insert({
            user_id: user.id,
            deck_name: deck.name,
            deck_id: deck.deckId,
            cards: deck.cards,
            raiki_cards: { blue: 3, red: 3, yellow: 3, green: 3, purple: 3 },
            is_public: true,
            description: deck.description
          })

        if (error) {
          console.error(`デッキ「${deck.name}」の保存に失敗:`, error)
        } else {
          console.log(`✅ デッキ「${deck.name}」を保存しました`)
        }
      } catch (err) {
        console.error(`デッキ「${deck.name}」でエラー:`, err)
      }
    }

  } catch (error) {
    console.error('全体エラー:', error)
  }
}

// SQLで直接実行する方法
const sqlQueries = `
-- 管理者ユーザーIDを確認
SELECT id FROM users WHERE x_username = 'Diagram_Wolf';

-- デッキを手動で挿入（user_idは上記で取得したIDに置き換え）
INSERT INTO saved_decks (user_id, deck_name, deck_id, cards, raiki_cards, is_public, description, created_at, updated_at)
VALUES 
  (1, 'ゆーきまるさん(2025/05/10)🟥15', 'btaaaaeaavaaaaaaazvqaxvavauaaaakaaaaaaaavaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  (1, 'ゆーきまるさん(2025/05/10)🟦15', 'btaezaeadvvsddcanaaaaaqaaaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  (1, '🥇REYさん(2025/04/30) 🟥5🟦10', 'btaevkeaaxacavdavaaaadvakazaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  (1, '🥈モーリーさん(2025/04/30)🟥15', 'btaavaeaaacaaaaaazvqaqvavaubaakaeaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW()),
  (1, '🥇TiAさん(2025/04/19) 🟥15', 'btaaaaeaavcaaaaaazvqaqvavaubaaakaaaaaaaavaaaaaaaaaaaaaaaaaaaaa', '[]', '{"blue":3,"red":3,"yellow":3,"green":3,"purple":3}', true, '公式・コミュニティ推奨デッキ', NOW(), NOW());
`

console.log('=== SQLクエリでデッキを手動追加 ===')
console.log(sqlQueries)