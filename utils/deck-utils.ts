import type { Card } from "@/types/card"
import { decodeDeckId } from "@/utils/deck-id-generator"

// デッキの分析情報を生成
export const analyzeDeck = (deck: Card[]): string => {
  if (deck.length === 0) return "デッキが空です"

  // 色の分布を計算
  const colorCount: Record<string, number> = {
    blue: 0,
    red: 0,
    yellow: 0,
    green: 0,
  }

  deck.forEach((card) => {
    if (colorCount[card.color] !== undefined) {
      colorCount[card.color]++
    }
  })

  // 主要な色を特定
  let mainColor = "不明"
  let mainColorCount = 0
  for (const [color, count] of Object.entries(colorCount)) {
    if (count > mainColorCount) {
      mainColorCount = count
      switch (color) {
        case "blue":
          mainColor = "青"
          break
        case "red":
          mainColor = "赤"
          break
        case "yellow":
          mainColor = "黄"
          break
        case "green":
          mainColor = "緑"
          break
      }
    }
  }

  // タイプの分布を計算
  const typeCount = {
    ユニット: deck.filter((card) => card.type === "ユニット").length,
    イベント: deck.filter((card) => card.type === "イベント").length,
    サポーター: deck.filter((card) => card.type === "サポーター").length,
  }

  // SP値の分布を計算
  const spDistribution = {
    sp2000: deck.filter((card) => card.sp === 2000).length,
    sp1000: deck.filter((card) => card.sp === 1000).length,
    spNone: deck.filter((card) => card.sp === "-" || card.sp === 0 || card.sp === null || card.sp === undefined).length,
  }

  // コスト分布を計算
  const lowCost = deck.filter((card) => card.cost <= 3).length
  const midCost = deck.filter((card) => card.cost > 3 && card.cost <= 6).length
  const highCost = deck.filter((card) => card.cost > 6).length

  // 平均コスト
  const avgCost = (deck.reduce((sum, card) => sum + card.cost, 0) / deck.length).toFixed(1)

  // 分析結果を返す
  return (
    `主に${mainColor}属性のデッキ（${mainColorCount}枚）\n` +
    `ユニット: ${typeCount.ユニット}枚（SP2000 ${spDistribution.sp2000}/SP1000 ${spDistribution.sp1000}/SPなし ${spDistribution.spNone}）, イベント: ${typeCount.イベント}枚, サポーター: ${typeCount.サポーター}枚\n` +
    `低コスト(1-3): ${lowCost}枚, 中コスト(4-6): ${midCost}枚, 高コスト(7+): ${highCost}枚\n` +
    `平均コスト: ${avgCost}`
  )
}

// ローカルストレージからデッキを取得
export const loadDecksFromStorage = (): Record<string, { name: string; cards: string[]; createdAt: string }> => {
  if (typeof window === "undefined") return {}
  return JSON.parse(localStorage.getItem("cnpDecks") || "{}")
}

// getRecommendedDecks 関数を更新して、デッキIDを変更し、新しいデッキを追加します
export const getRecommendedDecks = (allCardIds: string[]) => {
  return {
    // ゆーきまるさん(2025/05/10)🟥15
    btaaaaeaavaaaaaaazvqaxvavauaaaakaaaaaaaavaaaaaaaaaaaaaaaaaaa: {
      name: "ゆーきまるさん(2025/05/10)🟥15",
      cards: decodeDeckId("btaaaaeaavaaaaaaazvqaxvavauaaaakaaaaaaaavaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-05-10T00:00:00.000Z",
      isRecommended: true,
    },
    // ゆーきまるさん(2025/05/10)🟦15
    btaezaeadvvsddcanaaaaaqaaaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaa: {
      name: "ゆーきまるさん(2025/05/10)🟦15",
      cards: decodeDeckId("btaezaeadvvsddcanaaaaaqaaaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-05-10T00:00:00.000Z",
      isRecommended: true,
    },
    // 🥇REYさん(2025/04/30) 🟥5🟦10
    btaevkeaaxacavdavaaaadvakazaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: {
      name: "🥇REYさん(2025/04/30) 🟥5🟦10",
      cards: decodeDeckId("btaevkeaaxacavdavaaaadvakazaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-04-30T00:00:00.000Z",
      isRecommended: true,
    },
    // 🥈モーリーさん(2025/04/30)🟥15 - IDを修正
    btaavaeaaacaaaaaazvqaqvavaubaakaeaaaaaaaaaaaaaaaaaaaaaaaaaaa: {
      name: "🥈モーリーさん(2025/04/30)🟥15",
      cards: decodeDeckId("btaavaeaaacaaaaaazvqaqvavaubaakaeaaaaaaaaaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-04-30T00:00:00.000Z",
      isRecommended: true,
    },
    // 🥇TiAさん(2025/04/19) 🟥15 - IDを変更
    btaaaaeaavcaaaaaazvqaqvavaubaaakaaaaaaaavaaaaaaaaaaaaaaaaaaaaa: {
      name: "🥇TiAさん(2025/04/19) 🟥15",
      cards: decodeDeckId("btaaaaeaavcaaaaaazvqaqvavaubaaakaaaaaaaavaaaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-04-19T00:00:00.000Z",
      isRecommended: true,
    },
    // 🥈ゆーき丸さん(2025/04/19) 🟦15
    btaazkeaeyvydebaqaaaaafaaaaaaaaaaaaaaaaafaaaaafaaaaaaaaaaaaa: {
      name: "🥈ゆーき丸さん(2025/04/19) 🟦15",
      cards: decodeDeckId("btaazkeaeyvydebaqaaaaafaaaaaaaaaaaaaaaaafaaaaafaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-04-19T00:00:00.000Z",
      isRecommended: true,
    },
    // 🥉みーみーさん(2025/04/19) 🟩15
    btdaaaeaakaaaaaaaakaaaaaaaaaaaaaaaaaaaaaaaaaaazdaaaoueraevaa: {
      name: "🥉みーみーさん(2025/04/19) 🟩15",
      cards: decodeDeckId("btdaaaeaakaaaaaaaakaaaaaaaaaaaaaaaaaaaaaaaaaaazdaaaoueraevaa", allCardIds),
      createdAt: "2024-04-19T00:00:00.000Z",
      isRecommended: true,
    },
    // ④SOUSEIさん(2025/04/19) 🟦10🟥5
    btevvaevaveaaaeavaaaaaqaaavaaaabaaaaakaaaaaaaaaaaavaaaaaaaaa: {
      name: "④SOUSEIさん(2025/04/19) 🟦10🟥5",
      cards: decodeDeckId("btevvaevaveaaaeavaaaaaqaaavaaaabaaaaakaaaaaaaaaaaavaaaaaaaaa", allCardIds),
      createdAt: "2024-04-19T00:00:00.000Z",
      isRecommended: true,
    },
    // hideplusさん/赤緑加速デッキ🟥7🟩8
    btaaaaaaaacaaaaaaavaaakaqapnfackaaaaaaaaaaaaaaveaakakakaenak: {
      name: "hideplusさん/赤緑加速デッキ🟥7🟩8",
      cards: decodeDeckId("btaaaaaaaacaaaaaaavaaakaqapnfackaaaaaaaaaaaaaaveaakakakaenak", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // ぽんたまるさん/緑赤デッキ🟩13🟥2
    btaaaaeaaaeaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaaaeaaaevedjexaw: {
      name: "ぽんたまるさん/緑赤デッキ🟩13🟥2",
      cards: decodeDeckId("btaaaaeaaaeaaaaaaaaaaaaaaaqaaaaaaaaaaaaaaaaaaaaeaaaevedjexaw", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // CNP出版部 林さん/緑青デッキ🟩10🟦5
    btaakadqaaaaaddakaaaaaaaaaaaaaaaaaaaaaaaaaaaaavaaaxccevbdvav: {
      name: "CNP出版部 林さん/緑青デッキ🟩10🟦5",
      cards: decodeDeckId("btaakadqaaaaaddakaaaaaaaaaaaaaaaaaaaaaaaaaaaaavaaaxccevbdvav", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // 公式推奨/青ミッドレンジ(バランス)🟦15
    btvazkdczvaxcdeavaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: {
      name: "公式推奨/青ミッドレンジ(バランス)🟦15",
      cards: decodeDeckId("btvazkdczvaxcdeavaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // 公式推奨/赤アグロ(速攻)🟥15
    btaaaaaaaaeaaaaaazzvazvavavvacaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: {
      name: "公式推奨/赤アグロ(速攻)🟥15",
      cards: decodeDeckId("btaaaaaaaaeaaaaaazzvazvavavvacaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // 公式推奨/黄コントロール(妨害)🟨15
    btaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazaeaakazzveeavaaaavaaaaaaaaa: {
      name: "公式推奨/黄コントロール(妨害)🟨15",
      cards: decodeDeckId("btaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazaeaakazzveeavaaaavaaaaaaaaa", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // 公式推奨/緑ランプ(大型ユニット)🟩15
    btaaaacaaaeaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazeaaaeeezaevav: {
      name: "公式推奨/緑ランプ(大型ユニット)🟩15",
      cards: decodeDeckId("btaaaacaaaeaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaazeaaaeeezaevav", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
    // 公式推奨/混成テーマデッキ(セイドウ)🟦🟥
    btevvaavavevaaeavaaaaaaaevkaaaaaaaaaaaaaaaaaaaaaaavaaaaaaaaa: {
      name: "公式推奨/混成テーマデッキ(セイドウ)🟦🟥",
      cards: decodeDeckId("btevvaavavevaaeavaaaaaaaevkaaaaaaaaaaaaaaaaaaaaaaavaaaaaaaaa", allCardIds),
      createdAt: "2024-04-12T00:00:00.000Z",
      isRecommended: true,
    },
  }
}
