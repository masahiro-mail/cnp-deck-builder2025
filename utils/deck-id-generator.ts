// デッキIDを生成するためのユーティリティ関数

// 2桁の数字から文字へのマッピング
const DIGIT_PAIRS_TO_CHAR: Record<string, string> = {
  "00": "a",
  "01": "b",
  "02": "c",
  "03": "d",
  "04": "e",
  "10": "f",
  "11": "g",
  "12": "h",
  "13": "i",
  "14": "j",
  "20": "k",
  "21": "m",
  "22": "n",
  "23": "o",
  "24": "p",
  "30": "q",
  "31": "r",
  "32": "s",
  "33": "t",
  "34": "u",
  "40": "v",
  "41": "w",
  "42": "x",
  "43": "y",
  "44": "z",
}

// 文字から2桁の数字へのマッピング（逆引き用）
const CHAR_TO_DIGIT_PAIRS: Record<string, string> = {}
for (const [digits, char] of Object.entries(DIGIT_PAIRS_TO_CHAR)) {
  CHAR_TO_DIGIT_PAIRS[char] = digits
}

// デッキ全体からIDを生成する関数（新形式BKプレフィックス）
export function generateDeckId(cardIds: string[]): string {
  return generateDeckIdWithPrefix(cardIds, 'bk')
}

// 旧形式との互換性のためのBTプレフィックス版
export function generateLegacyDeckId(cardIds: string[]): string {
  return generateDeckIdWithPrefix(cardIds, 'bt')
}

// 内部関数：プレフィックスを指定してIDを生成
function generateDeckIdWithPrefix(cardIds: string[], prefix: 'bt' | 'bk'): string {
  // カードの出現回数をカウント（0-4枚）- 199枚に拡張（BT1:116 + P-1:1 + BT2:82）
  const cardCounts: number[] = Array(199).fill(0)

  cardIds.forEach((id) => {
    let internalNumber = 0
    
    // BT1カードの場合
    if (id.startsWith("BT1-")) {
      const match = id.match(/BT1-(\d+)(?:p|sp)?$/)
      if (match) {
        const cardNumber = Number.parseInt(match[1], 10)
        if (cardNumber >= 1 && cardNumber <= 116) {
          internalNumber = cardNumber // BT1-1 -> 1, BT1-116 -> 116
        }
      }
    }
    // BT2カードの場合
    else if (id.startsWith("BT2-")) {
      const match = id.match(/BT2-(\d+)(?:p|sp)?$/)
      if (match) {
        const cardNumber = Number.parseInt(match[1], 10)
        if (cardNumber >= 1 && cardNumber <= 82) {
          internalNumber = 117 + cardNumber // BT2-1 -> 118, BT2-82 -> 199
        }
      }
    }
    // 既存の形式（数字のみ、P-1など）の後方互換性
    else {
      // P-1の特別処理を最初に行う
      if (id === "P-1") {
        if (prefix === 'bk') {
          internalNumber = 117 // BK形式：P-1は117番スロット（独立）
        } else {
          internalNumber = 1   // BT形式：P-1は1番スロット（BT1-1と共有）
        }
      } else {
        const match = id.match(/^(\d+)(?:p|sp)?$/)
        if (match) {
          const cardNumber = Number.parseInt(match[1], 10)
          if (cardNumber >= 1 && cardNumber <= 116) {
            internalNumber = cardNumber
          }
        }
      }
    }

    // 有効な番号の場合はカウントアップ
    if (internalNumber > 0 && internalNumber <= 199) {
      cardCounts[internalNumber - 1]++
      // 4枚を超える場合は4枚に制限
      if (cardCounts[internalNumber - 1] > 4) {
        cardCounts[internalNumber - 1] = 4
      }
    }
  })

  // 2桁ずつ組み合わせて文字に変換
  let encodedId = prefix // 先頭にプレフィックスを付ける

  // 199枚のカードを2枚ずつペアにして処理
  for (let i = 0; i < 199; i += 2) {
    // 最後の1枚が余る場合（199枚目）
    if (i === 198) {
      // 最後の1枚は単独で処理
      const lastDigit = cardCounts[i].toString()
      // 最後の1桁は0-4の数字をそのまま使用
      encodedId += lastDigit
      break
    }

    // 2枚のカードの枚数を2桁の数字として結合
    const digitPair = `${cardCounts[i]}${cardCounts[i + 1]}`
    // 対応する文字に変換
    const char = DIGIT_PAIRS_TO_CHAR[digitPair]

    if (char) {
      encodedId += char
    } else {
      // マッピングにない組み合わせの場合（エラー処理）
      console.warn(`Invalid digit pair: ${digitPair} at index ${i}`)
      encodedId += "a" // デフォルト値
    }
  }

  return encodedId
}

// デッキIDからカードIDのリストを復元する関数
export function decodeDeckId(deckId: string, allCardIds: string[]): string[] {
  // プレフィックスを判定して適切な処理を選択
  if (deckId.startsWith("bk")) {
    return decodeDeckIdWithPrefix(deckId, allCardIds, 'bk')
  } else if (deckId.startsWith("bt")) {
    return decodeDeckIdWithPrefix(deckId, allCardIds, 'bt')
  } else {
    console.warn("Unknown deck ID prefix")
    return []
  }
}

// 内部関数：プレフィックスを指定してデコード
function decodeDeckIdWithPrefix(deckId: string, allCardIds: string[], prefix: 'bt' | 'bk'): string[] {
  try {
    // 先頭のプレフィックスを削除
    if (deckId.startsWith(prefix)) {
      deckId = deckId.substring(prefix.length)
    } else {
      console.warn(`Deck ID does not start with '${prefix}'`)
      return []
    }

    // 後方互換性：古い形式（58-59文字）と新形式（99-100文字）を判定
    const isLegacyFormat = deckId.length <= 59
    const expectedMinLength = isLegacyFormat ? 58 : 99
    const maxCards = isLegacyFormat ? 116 : 199

    // 長さチェック
    if (deckId.length < expectedMinLength) {
      console.warn(`Deck ID is too short: ${deckId.length}, expected at least ${expectedMinLength} characters`)
      return []
    }

    const cardCounts: number[] = []

    // 文字を2桁の数字に変換
    for (let i = 0; i < deckId.length; i++) {
      const char = deckId[i]

      // 最後の1文字が数字の場合（116枚目または199枚目のカード）
      if (i === deckId.length - 1 && /[0-4]/.test(char)) {
        cardCounts.push(Number.parseInt(char, 10))
        break
      }

      const digitPair = CHAR_TO_DIGIT_PAIRS[char]

      if (digitPair) {
        // 2桁の数字を2つの数字に分解
        cardCounts.push(Number.parseInt(digitPair[0], 10))
        cardCounts.push(Number.parseInt(digitPair[1], 10))
      } else {
        console.warn(`Invalid character in deck ID: ${char} at position ${i}`)
        // エラーが発生した場合は0を追加
        cardCounts.push(0)
        cardCounts.push(0)
      }

      // 指定枚数分のカードを処理したら終了
      if (cardCounts.length >= maxCards) {
        break
      }
    }

    // カード枚数が足りない場合は0で埋める
    while (cardCounts.length < maxCards) {
      cardCounts.push(0)
    }

    // カード枚数をカードIDのリストに変換
    const result: string[] = []

    for (let i = 0; i < cardCounts.length; i++) {
      const count = cardCounts[i]
      const internalNumber = i + 1

      // 対応するカードIDを見つける
      const cardId = findCardIdByInternalNumber(internalNumber, allCardIds, prefix)

      if (cardId && count > 0) {
        // 指定された枚数だけカードを追加
        for (let j = 0; j < count; j++) {
          result.push(cardId)
        }
      }
    }

    return result
  } catch (error) {
    console.error("Error decoding deck ID:", error)
    // エラーが発生した場合は空の配列を返す
    return []
  }
}

// 内部番号からカードIDを見つける関数（BT1/P-1/BT2対応）
function findCardIdByInternalNumber(internalNumber: number, allCardIds: string[], prefix: 'bt' | 'bk' = 'bk'): string | null {
  // BT1カードの範囲（1-116）
  if (internalNumber >= 1 && internalNumber <= 116) {
    // BT形式の場合は1番スロットでP-1とBT1-1が競合するため特別処理
    if (prefix === 'bt' && internalNumber === 1) {
      // BT形式ではBT1-1を優先
      for (const cardId of allCardIds) {
        const match = cardId.match(/^BT1-1(?:p|sp)?$/)
        if (match) {
          return cardId
        }
      }
      // BT1-1がない場合はP-1を探す
      const p1Card = allCardIds.find(cardId => cardId === "P-1")
      if (p1Card) {
        return p1Card
      }
    }
    // BK形式では1番スロットはBT1-1のみ（P-1は117番スロット）
    
    // 上記以外のBT1カードを探す
    for (const cardId of allCardIds) {
      const match = cardId.match(/^BT1-(\d+)(?:p|sp)?$/)
      if (match && Number.parseInt(match[1], 10) === internalNumber) {
        return cardId
      }
    }
    // 後方互換性：数字のみの形式も探す
    for (const cardId of allCardIds) {
      if (!cardId.startsWith("BT")) {
        const match = cardId.match(/(\d+)(?:p|sp)?$/)
        if (match && Number.parseInt(match[1], 10) === internalNumber) {
          return cardId
        }
      }
    }
  }
  // P-1カード（117番スロット）
  else if (internalNumber === 117) {
    const p1Card = allCardIds.find(cardId => cardId === "P-1")
    if (p1Card) {
      return p1Card
    }
  }
  // BT2カードの範囲（118-199 -> BT2-1-82）
  else if (internalNumber >= 118 && internalNumber <= 199) {
    const bt2Number = internalNumber - 117 // 118 -> 1, 199 -> 82
    for (const cardId of allCardIds) {
      const match = cardId.match(/^BT2-(\d+)(?:p|sp)?$/)
      if (match && Number.parseInt(match[1], 10) === bt2Number) {
        return cardId
      }
    }
  }
  
  return null
}

// 後方互換性のため古い関数名も残す
function findCardIdByNumber(cardNumber: number, allCardIds: string[]): string | null {
  return findCardIdByInternalNumber(cardNumber, allCardIds, 'bk')
}

// デッキIDをフォーマットする関数
export function formatDeckId(id: string): string {
  return id // ハイフンなしで元のIDをそのまま返す
}

// デバッグ用の関数：デッキIDの内容を解析して表示
export function analyzeDeckId(deckId: string): string {
  try {
    // 先頭の "bt" を削除
    if (deckId.startsWith("bt")) {
      deckId = deckId.substring(2)
    } else {
      return `デッキIDが "bt" で始まっていません: ${deckId}`
    }

    // 後方互換性：古い形式と新形式を判定
    const isLegacyFormat = deckId.length <= 59
    const maxCards = isLegacyFormat ? 116 : 199

    let result = `デッキID解析結果 (${prefix.toUpperCase()}形式 - ${isLegacyFormat ? '旧形式' : '新形式'}):\n`
    const cardCounts: number[] = []

    // 文字を2桁の数字に変換
    for (let i = 0; i < deckId.length; i++) {
      const char = deckId[i]

      // 最後の1文字が数字の場合（116枚目または199枚目のカード）
      if (i === deckId.length - 1 && /[0-4]/.test(char)) {
        const count = Number.parseInt(char, 10)
        cardCounts.push(count)
        result += `カード${maxCards}: ${count}枚\n`
        break
      }

      const digitPair = CHAR_TO_DIGIT_PAIRS[char]

      if (digitPair) {
        const cardIndex1 = cardCounts.length
        const cardIndex2 = cardCounts.length + 1
        const count1 = Number.parseInt(digitPair[0], 10)
        const count2 = Number.parseInt(digitPair[1], 10)

        cardCounts.push(count1)
        cardCounts.push(count2)

        // BT1/P-1/BT2の表示を区別
        const card1Display = cardIndex1 + 1 <= 116 ? 
          `BT1-${cardIndex1 + 1}` : 
          cardIndex1 + 1 === 117 ? 
          `P-1` : 
          `BT2-${cardIndex1 + 1 - 117}`
        const card2Display = cardIndex2 + 1 <= 116 ? 
          `BT1-${cardIndex2 + 1}` : 
          cardIndex2 + 1 === 117 ? 
          `P-1` : 
          `BT2-${cardIndex2 + 1 - 117}`

        result += `${card1Display}: ${count1}枚, ${card2Display}: ${count2}枚\n`
      } else {
        result += `無効な文字: ${char} (位置: ${i})\n`
        // エラーが発生した場合は0を追加
        cardCounts.push(0)
        cardCounts.push(0)
      }

      // 指定枚数分のカードを処理したら終了
      if (cardCounts.length >= maxCards) {
        break
      }
    }

    // カード枚数の合計
    const totalCards = cardCounts.reduce((sum, count) => sum + count, 0)
    result += `\n合計カード枚数: ${totalCards}枚`

    return result
  } catch (error) {
    return `解析エラー: ${error}`
  }
}
