export interface Card {
  id: string
  name: string
  type: CardType
  rarity: CardRarity
  color: CardColor
  cost: number
  bp?: number
  sp?: number // 助太刀ポイント
  ability?: string
  description?: string
  faction?: string
  illustrator?: string
  imageUrl?: string
  cardNumber?: string
  colorBalance?: string
  colorCost?: number
  colorlessCost?: number
  effectType?: string[]
  pack: string
}

type CardType = "ユニット" | "イベント" | "サポーター"
type CardRarity = "C" | "R" | "RR" | "RRR" | "P-RR" | "SP-RRR"
type CardColor = "blue" | "red" | "yellow" | "green" | "purple"
