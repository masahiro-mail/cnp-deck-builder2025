"use client"

import { useState, useEffect } from "react"
import { cards } from "@/data/cards"
import CardComponent from "@/components/card"
import CardModal from "@/components/card-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import type { Card } from "@/types/card"

// 効果分類の一覧を取得
const getEffectTypes = () => {
  const effectTypes = new Set<string>()
  cards.forEach((card) => {
    if (card.effectType && card.effectType.length > 0) {
      card.effectType.forEach((effect) => effectTypes.add(effect))
    }
  })
  return Array.from(effectTypes).sort()
}

// 収録パックの一覧を取得
const getPacks = () => {
  const packs = new Set<string>()
  cards.forEach((card) => {
    if (card.pack) {
      packs.add(card.pack)
    }
  })
  return Array.from(packs).sort()
}

// レアリティの一覧を取得
const getRarities = () => {
  const rarities = new Set<string>()
  cards.forEach((card) => {
    if (card.rarity) {
      rarities.add(card.rarity)
    }
  })
  return Array.from(rarities).sort()
}

export default function CardsPage() {
  const [filteredCards, setFilteredCards] = useState<Card[]>(cards)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cardType, setCardType] = useState<string>("all")
  const [cardColor, setCardColor] = useState<string>("all")
  const [cardRarity, setCardRarity] = useState<string>("all")
  const [cardEffectType, setCardEffectType] = useState<string>("all")
  const [cardPack, setCardPack] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // 効果分類、収録パック、レアリティの一覧
  const effectTypes = getEffectTypes()
  const packs = getPacks()
  const rarities = getRarities()

  // カードをフィルタリングする関数
  useEffect(() => {
    let result = [...cards]

    // 検索語でフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (card) =>
          card.name.toLowerCase().includes(term) ||
          (card.description && card.description.toLowerCase().includes(term)) ||
          (card.ability && card.ability.toLowerCase().includes(term)) ||
          (card.faction && card.faction.toLowerCase().includes(term)),
      )
    }

    // タイプでフィルタリング
    if (cardType !== "all") {
      result = result.filter((card) => card.type === cardType)
    }

    // 色でフィルタリング
    if (cardColor !== "all") {
      result = result.filter((card) => card.color === cardColor)
    }

    // レアリティでフィルタリング
    if (cardRarity !== "all") {
      result = result.filter((card) => card.rarity === cardRarity)
    }

    // 効果分類でフィルタリング
    if (cardEffectType !== "all") {
      result = result.filter((card) => card.effectType && card.effectType.includes(cardEffectType))
    }

    // 収録パックでフィルタリング
    if (cardPack !== "all") {
      result = result.filter((card) => card.pack === cardPack)
    }

    // ソート
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "cost":
          comparison = a.cost - b.cost
          // コストが同じ場合は名前でソート（二次ソート）
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case "colorCost":
          const colorCostA = a.colorCost || 0
          const colorCostB = b.colorCost || 0
          comparison = colorCostA - colorCostB
          if (comparison === 0) {
            comparison = a.cost - b.cost
          }
          break
        case "colorlessCost":
          const colorlessCostA = a.colorlessCost || 0
          const colorlessCostB = b.colorlessCost || 0
          comparison = colorlessCostA - colorCostB
          if (comparison === 0) {
            comparison = a.cost - b.cost
          }
          break
        case "bp":
          const bpA = a.bp ? Number.parseInt(a.bp.replace(/\D/g, ""), 10) : 0
          const bpB = b.bp ? Number.parseInt(b.bp.replace(/\D/g, ""), 10) : 0
          comparison = bpA - bpB
          // BPが同じ場合はコストでソート（二次ソート）
          if (comparison === 0) {
            comparison = a.cost - b.cost
          }
          // コストも同じ場合は名前でソート（三次ソート）
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case "sp":
          // 数値変換の方法を修正
          const spA = a.sp ? Number.parseInt(a.sp.replace(/\D/g, "")) : 0
          const spB = b.sp ? Number.parseInt(b.sp.replace(/\D/g, "")) : 0
          comparison = spA - spB
          // SPが同じ場合はコストでソート（二次ソート）
          if (comparison === 0) {
            comparison = a.cost - b.cost
          }
          // コストも同じ場合は名前でソート（三次ソート）
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          // タイプが同じ場合はコストでソート（二次ソート）
          if (comparison === 0) {
            comparison = a.cost - b.cost
          }
          // コストも同じ場合は名前でソート（三次ソート）
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case "cardId":
          // カードIDの数値順でソート（BT1-1, BT1-2, ..., P-1, BT2-1, BT2-2, ...）
          const extractCardNumber = (id: string): [string, number] => {
            if (id === "P-1") return ["P", 1]
            const match = id.match(/^(BT\d+)-(\d+)/)
            if (match) {
              return [match[1], parseInt(match[2], 10)]
            }
            // フォールバック：数字のみのID
            const numMatch = id.match(/^(\d+)/)
            if (numMatch) {
              return ["BT1", parseInt(numMatch[1], 10)]
            }
            return ["", 0]
          }
          
          const [seriesA, numberA] = extractCardNumber(a.id)
          const [seriesB, numberB] = extractCardNumber(b.id)
          
          // まずシリーズでソート（BT1 < P < BT2）
          const seriesOrder = { "BT1": 1, "P": 2, "BT2": 3 }
          const seriesCompare = (seriesOrder[seriesA as keyof typeof seriesOrder] || 0) - (seriesOrder[seriesB as keyof typeof seriesOrder] || 0)
          
          if (seriesCompare !== 0) {
            comparison = seriesCompare
          } else {
            // 同じシリーズ内では番号順
            comparison = numberA - numberB
          }
          break
        default:
          comparison = 0
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredCards(result)
  }, [searchTerm, cardType, cardColor, cardRarity, cardEffectType, cardPack, sortBy, sortOrder])

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  const closeModal = () => {
    setSelectedCard(null)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  return (
    <div className="min-h-screen tech-pattern p-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 neon-text">
            カードビューアー
          </h1>
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-yellow-400"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-yellow-400"></div>
          <p className="text-blue-300 mb-8 text-center">カードをタップして詳細を表示します</p>
        </div>

        <div className="bg-black rounded-lg shadow-lg p-6 mb-8 border border-blue-900 neon-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-1 md:col-span-3">
              <Label htmlFor="search" className="mb-2 block text-blue-300">
                カード検索
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-500" />
                <Input
                  id="search"
                  placeholder="カード名、テキストで検索..."
                  className="pl-8 bg-black border-blue-700 text-blue-200 focus:border-blue-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type-filter" className="mb-2 block text-blue-300">
                カード種
              </Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger id="type-filter" className="bg-black border-blue-700 text-blue-300">
                  <SelectValue placeholder="タイプを選択" />
                </SelectTrigger>
                <SelectContent className="bg-black border-blue-700 text-blue-300">
                  <SelectItem value="all">全てのタイプ</SelectItem>
                  <SelectItem value="ユニット">ユニット</SelectItem>
                  <SelectItem value="イベント">イベント</SelectItem>
                  <SelectItem value="サポーター">サポーター</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rarity-filter" className="mb-2 block text-blue-300">
                レアリティ
              </Label>
              <Select value={cardRarity} onValueChange={setCardRarity}>
                <SelectTrigger id="rarity-filter" className="bg-black border-blue-700 text-blue-300">
                  <SelectValue placeholder="レアリティを選択" />
                </SelectTrigger>
                <SelectContent className="bg-black border-blue-700 text-blue-300">
                  <SelectItem value="all">全てのレアリティ</SelectItem>
                  {rarities.map((rarity) => (
                    <SelectItem key={rarity} value={rarity}>
                      {rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color-filter" className="mb-2 block text-blue-300">
                属性（色）
              </Label>
              <Select value={cardColor} onValueChange={setCardColor}>
                <SelectTrigger id="color-filter" className="bg-black border-blue-700 text-blue-300">
                  <SelectValue placeholder="色を選択" />
                </SelectTrigger>
                <SelectContent className="bg-black border-blue-700 text-blue-300">
                  <SelectItem value="all">全ての色</SelectItem>
                  <SelectItem value="blue">青</SelectItem>
                  <SelectItem value="red">赤</SelectItem>
                  <SelectItem value="yellow">黄</SelectItem>
                  <SelectItem value="green">緑</SelectItem>
                  <SelectItem value="purple">紫</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="effect-filter" className="mb-2 block text-blue-300">
                効果分類
              </Label>
              <Select value={cardEffectType} onValueChange={setCardEffectType}>
                <SelectTrigger id="effect-filter" className="bg-black border-blue-700 text-blue-300">
                  <SelectValue placeholder="効果分類を選択" />
                </SelectTrigger>
                <SelectContent className="bg-black border-blue-700 text-blue-300">
                  <SelectItem value="all">全ての効果</SelectItem>
                  {effectTypes.map((effect) => (
                    <SelectItem key={effect} value={effect}>
                      {effect}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pack-filter" className="mb-2 block text-blue-300">
                収録パック
              </Label>
              <Select value={cardPack} onValueChange={setCardPack}>
                <SelectTrigger id="pack-filter" className="bg-black border-blue-700 text-blue-300">
                  <SelectValue placeholder="収録パックを選択" />
                </SelectTrigger>
                <SelectContent className="bg-black border-blue-700 text-blue-300">
                  <SelectItem value="all">全てのパック</SelectItem>
                  {packs.map((pack) => (
                    <SelectItem key={pack} value={pack}>
                      {pack}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center mb-2 sm:mb-0">
              <Filter className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-300">
                {filteredCards.length}枚のカードが見つかりました
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by" className="text-sm whitespace-nowrap text-blue-300">
                並び替え:
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-[180px] bg-black border-blue-700 text-blue-300">
                  <SelectValue placeholder="並び替え" />
                </SelectTrigger>
                <SelectContent className="bg-black border-blue-700 text-blue-300">
                  <SelectItem value="name">カード名</SelectItem>
                  <SelectItem value="cardId">カードID順</SelectItem>
                  <SelectItem value="cost">コスト</SelectItem>
                  <SelectItem value="colorCost">指定色コスト</SelectItem>
                  <SelectItem value="colorlessCost">無色コスト</SelectItem>
                  <SelectItem value="bp">バトルポイント</SelectItem>
                  <SelectItem value="sp">助太刀ポイント</SelectItem>
                  <SelectItem value="type">カードタイプ</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                className="border-blue-700 text-blue-400 hover:bg-blue-900 hover:text-blue-200"
              >
                <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-blue-900 bg-opacity-20">
              <TabsTrigger
                value="grid"
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-blue-300"
              >
                グリッド表示
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-blue-300"
              >
                リスト表示
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                {filteredCards.map((card) => (
                  <div key={card.id} onClick={() => handleCardClick(card)} className="cursor-pointer card-hover-effect">
                    <CardComponent card={card} isFaceUp={true} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="w-full">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-900 bg-opacity-30">
                      <th className="p-2 text-left text-blue-300">カード名</th>
                      <th className="p-2 text-left text-blue-300">タイプ</th>
                      <th className="p-2 text-left text-blue-300">コスト</th>
                      <th className="p-2 text-left text-blue-300">指定色</th>
                      <th className="p-2 text-left text-blue-300">無色</th>
                      <th className="p-2 text-left text-blue-300">BP</th>
                      <th className="p-2 text-left text-blue-300">SP</th>
                      <th className="p-2 text-left text-blue-300">レア</th>
                      <th className="p-2 text-left text-blue-300">色</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCards.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-blue-900 hover:bg-blue-900 hover:bg-opacity-20 cursor-pointer transition-colors"
                        onClick={() => handleCardClick(card)}
                      >
                        <td className="p-2 text-blue-200">{card.name}</td>
                        <td className="p-2 text-blue-200">{card.type}</td>
                        <td className="p-2 text-blue-200">{card.cost}</td>
                        <td className="p-2 text-blue-200">{card.colorCost || 0}</td>
                        <td className="p-2 text-blue-200">{card.colorlessCost || 0}</td>
                        <td className="p-2 text-blue-200">{card.bp || "-"}</td>
                        <td className="p-2 text-blue-200">{card.sp || "-"}</td>
                        <td className="p-2 text-blue-200">{card.rarity || "-"}</td>
                        <td className="p-2">
                          <div
                            className={`w-6 h-6 rounded-full ${
                              card.color === "blue"
                                ? "bg-blue-500"
                                : card.color === "red"
                                  ? "bg-red-500"
                                  : card.color === "yellow"
                                    ? "bg-yellow-500"
                                    : card.color === "green"
                                      ? "bg-green-500"
                                      : "bg-purple-500"
                            }`}
                          ></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* カード詳細モーダル */}
        {selectedCard && <CardModal card={selectedCard} onClose={closeModal} />}
      </div>
    </div>
  )
}
