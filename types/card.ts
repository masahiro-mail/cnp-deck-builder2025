export interface Card {
  id: string
  name: string
  type: CardType
  rarity: CardRarity
  color: CardColor
  cost: number
  bp?: number
  sp?: number // 助太刀ポイント
  colorBalance?: string
  specificColor?: CardColor
  specificColorCost?: number
  colorlessCost?: number
  traits?: string[]
  pack: string
  effectType?: string
  effect?: string
  flavorText?: string
  illustrator?: string
}

type CardType = "ユニット" | "イベント" | "サポーター"
type CardRarity = "C" | "R" | "RR" | "RRR" | "P-RR" | "SP-RRR"
type CardColor = "blue" | "red" | "yellow" | "green" | "purple"
