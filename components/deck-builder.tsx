"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import type { Card } from "@/types/card"
import CardComponent from "./card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { generateDeckId, decodeDeckId } from "@/utils/deck-id-generator"
import { Shuffle, Save, Download } from "lucide-react"

interface DeckBuilderProps {
  cards: Card[]
}

export default function DeckBuilder({ cards }: DeckBuilderProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [selectedColor, setSelectedColor] = useState<"blue" | "red" | "yellow" | "green">("blue")
  const [deck, setDeck] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deckName, setDeckName] = useState("")
  const [deckDescription, setDeckDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [raikiCards, setRaikiCards] = useState({
    blue: 3,
    red: 3,
    yellow: 3,
    green: 3,
    purple: 3
  })

  // 色に基づいてカードをフィルタリング
  useEffect(() => {
    const filtered = cards.filter((card) => card.color === selectedColor)
    setFilteredCards(filtered)
  }, [selectedColor, cards])

  // URLパラメータからデッキを読み込み
  useEffect(() => {
    const deckParam = searchParams?.get('deck')
    if (deckParam && cards.length > 0) {
      try {
        const decodedDeck = decodeDeckId(deckParam, cards)
        if (decodedDeck.length > 0) {
          setDeck(decodedDeck)
          // デッキの構成からレイキカードを推測して設定
          const inferredRaikiCards = getRaikiCardsFromDeck(decodedDeck)
          setRaikiCards(inferredRaikiCards)
          toast({
            title: "デッキを読み込みました",
            description: `${decodedDeck.length}枚のカードとレイキカードを読み込みました`,
          })
        }
      } catch (error) {
        console.error('Error decoding deck:', error)
        toast({
          title: "デッキの読み込みに失敗",
          description: "デッキIDが無効です",
          variant: "destructive",
        })
      }
    }
  }, [searchParams, cards, toast])

  // 50枚のデッキを自動生成
  const generateDeck = () => {
    const colorCards = cards.filter((card) => card.color === selectedColor)

    // デッキの構成比率を決定
    // ユニット：60%、イベント：30%、サポーター：10%
    const unitCards = colorCards.filter((card) => card.type === "ユニット")
    const eventCards = colorCards.filter((card) => card.type === "イベント")
    const supporterCards = colorCards.filter((card) => card.type === "サポーター")

    // コスト別の分布を考慮
    // 低コスト(1-3)：50%、中コスト(4-6)：40%、高コスト(7-9)：10%
    const lowCostUnits = unitCards.filter((card) => card.cost <= 3)
    const midCostUnits = unitCards.filter((card) => card.cost > 3 && card.cost <= 6)
    const highCostUnits = unitCards.filter((card) => card.cost > 6)

    // デッキを構築
    let newDeck: Card[] = []

    // ユニットカードを追加（30枚）
    const addCards = (cards: Card[], count: number) => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, Math.min(count, shuffled.length))
    }

    newDeck = [
      ...addCards(lowCostUnits, 15),
      ...addCards(midCostUnits, 12),
      ...addCards(highCostUnits, 3),
      ...addCards(eventCards, 15),
      ...addCards(supporterCards, 5),
    ]

    // 50枚になるようにシャッフルして切り詰める
    newDeck = newDeck.sort(() => Math.random() - 0.5).slice(0, 50)

    setDeck(newDeck)
  }

  // デッキをシャッフル
  const shuffleDeck = () => {
    setDeck([...deck].sort(() => Math.random() - 0.5))
  }

  // デッキから推測されるレイキカード構成を取得
  const getRaikiCardsFromDeck = (deckCards: Card[]) => {
    const colorCounts = {
      blue: 0,
      red: 0,
      yellow: 0,
      green: 0,
      purple: 0
    }
    
    // デッキの色の分布を計算
    deckCards.forEach(card => {
      if (card.color in colorCounts) {
        colorCounts[card.color as keyof typeof colorCounts]++
      }
    })
    
    // 合計が15になるように調整
    const total = Object.values(colorCounts).reduce((sum, count) => sum + count, 0)
    if (total === 0) {
      return { blue: 3, red: 3, yellow: 3, green: 3, purple: 3 }
    }
    
    // 色の比率に基づいてレイキカードを分配（合計15枚）
    const raikiCards = { blue: 0, red: 0, yellow: 0, green: 0, purple: 0 }
    let remaining = 15
    
    // まず最低1枚ずつ配分
    Object.keys(colorCounts).forEach(color => {
      if (colorCounts[color as keyof typeof colorCounts] > 0 && remaining > 0) {
        raikiCards[color as keyof typeof raikiCards] = 1
        remaining--
      }
    })
    
    // 残りを比率に応じて配分
    const sortedColors = Object.entries(colorCounts)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
    
    for (let i = 0; i < remaining; i++) {
      const colorIndex = i % sortedColors.length
      const [color] = sortedColors[colorIndex]
      raikiCards[color as keyof typeof raikiCards]++
    }
    
    return raikiCards
  }

  // デッキをサーバーに保存
  const saveDeckToServer = async () => {
    if (!session) {
      toast({
        title: "ログインが必要です",
        description: "デッキを保存するにはTwitterでログインしてください",
        variant: "destructive",
      })
      return
    }

    if (!deckName.trim()) {
      toast({
        title: "デッキ名が必要です",
        description: "デッキ名を入力してください",
        variant: "destructive",
      })
      return
    }

    if (deck.length === 0) {
      toast({
        title: "デッキが空です",
        description: "まずデッキを作成してください",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // デッキIDを生成
      const deckId = generateDeckId(deck, cards)

      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deck_name: deckName,
          deck_id: deckId,
          description: deckDescription,
          is_public: isPublic,
          raiki_cards: raikiCards,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save deck')
      }

      const savedDeck = await response.json()

      toast({
        title: "デッキを保存しました",
        description: `「${deckName}」がサーバーに保存されました`,
      })

      // フォームをリセット
      setDeckName("")
      setDeckDescription("")
      setIsPublic(false)
      setIsDialogOpen(false)

    } catch (error) {
      console.error('Error saving deck:', error)
      toast({
        title: "保存に失敗しました",
        description: "デッキの保存中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // デッキIDをダウンロード（既存機能）
  const downloadDeckId = () => {
    if (deck.length === 0) {
      toast({
        title: "デッキが空です",
        description: "まずデッキを作成してください",
        variant: "destructive",
      })
      return
    }

    try {
      const deckId = generateDeckId(deck, cards)
      const blob = new Blob([deckId], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedColor}_deck_${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "デッキIDをダウンロードしました",
        description: "デッキIDがテキストファイルとしてダウンロードされました",
      })
    } catch (error) {
      console.error('Error generating deck ID:', error)
      toast({
        title: "エラー",
        description: "デッキIDの生成に失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">デッキビルダー</h2>

      {/* 色選択タブ */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">デッキの色を選択</h3>
        <Tabs defaultValue="blue" onValueChange={(value) => setSelectedColor(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger
              value="blue"
              className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              青（水/CNP）
            </TabsTrigger>
            <TabsTrigger
              value="red"
              className="bg-red-100 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              赤（火/カグツチ）
            </TabsTrigger>
            <TabsTrigger
              value="yellow"
              className="bg-yellow-100 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
            >
              黄（光/ミッドガン）
            </TabsTrigger>
            <TabsTrigger
              value="green"
              className="bg-green-100 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              緑（森/メテオラス）
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blue" className="p-4 bg-blue-50 rounded-lg">
            <p>
              青属性は水や氷の力を操り、カードドローや相手ユニットの退場に優れています。リーリーやルナなどのCNPキャラクターが多く含まれます。
            </p>
          </TabsContent>
          <TabsContent value="red" className="p-4 bg-red-50 rounded-lg">
            <p>
              赤属性は火や岩の力を操り、高いBP値と攻撃力に優れています。ナルカミやマカミなどのCNPキャラクターや、カグツチの住人が含まれます。
            </p>
          </TabsContent>
          <TabsContent value="yellow" className="p-4 bg-yellow-50 rounded-lg">
            <p>
              黄属性は光や電気の力を操り、手札操作やコスト軽減に優れています。トワやセツナなどのCNPキャラクターや、ミッドガンの住人が含まれます。
            </p>
          </TabsContent>
          <TabsContent value="green" className="p-4 bg-green-50 rounded-lg">
            <p>
              緑属性は森や自然の力を操り、ユニットの移動やゲージ操作に優れています。オロチやヤーマなどのCNPキャラクターや、メテオラスの住人が含まれます。
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* デッキ生成ボタン */}
      <div className="flex justify-center gap-4 mb-8">
        <Button onClick={generateDeck} className="bg-indigo-600 hover:bg-indigo-700" size="lg">
          {selectedColor}色の50枚デッキを自動生成
        </Button>

        {deck.length > 0 && (
          <>
            <Button onClick={shuffleDeck} variant="outline" size="lg" className="flex items-center gap-2">
              <Shuffle size={16} />
              デッキをシャッフル
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Save size={16} />
                  デッキ保存
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>デッキを保存</DialogTitle>
                  <DialogDescription>
                    あなたのデッキをサーバーに保存します。{session ? `@${session.user?.username} としてログイン中` : "ログインが必要です"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deck-name" className="text-right">
                      デッキ名
                    </Label>
                    <Input
                      id="deck-name"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      className="col-span-3"
                      placeholder="例: 青属性アグロデッキ"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deck-description" className="text-right">
                      説明
                    </Label>
                    <Textarea
                      id="deck-description"
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="デッキのコンセプトや戦術を説明..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is-public" className="text-right">
                      公開設定
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="is-public"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                      <Label htmlFor="is-public">
                        {isPublic ? "公開（他のユーザーも閲覧可能）" : "非公開（自分のみ）"}
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveDeckToServer} disabled={isSaving}>
                    {isSaving ? "保存中..." : "保存"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={downloadDeckId} 
              variant="outline" 
              size="lg" 
              className="flex items-center gap-2"
            >
              <Download size={16} />
              デッキID発行
            </Button>
          </>
        )}
      </div>

      {/* 生成されたデッキ */}
      {deck.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">生成されたデッキ（{deck.length}枚）</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {deck.map((card, index) => (
              <div key={`${card.id}-${index}`} className="cursor-pointer">
                <CardComponent card={card} isFaceUp={true} />
              </div>
            ))}
          </div>

          {/* デッキ統計 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">タイプ別</h4>
              <div className="flex justify-between">
                <span>ユニット:</span>
                <span>{deck.filter((card) => card.type === "ユニット").length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>イベント:</span>
                <span>{deck.filter((card) => card.type === "イベント").length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>サポーター:</span>
                <span>{deck.filter((card) => card.type === "サポーター").length}枚</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">コスト別</h4>
              <div className="flex justify-between">
                <span>低コスト(1-3):</span>
                <span>{deck.filter((card) => card.cost <= 3).length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>中コスト(4-6):</span>
                <span>{deck.filter((card) => card.cost > 3 && card.cost <= 6).length}枚</span>
              </div>
              <div className="flex justify-between">
                <span>高コスト(7-9):</span>
                <span>{deck.filter((card) => card.cost > 6).length}枚</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold mb-2">平均コスト</h4>
              <div className="text-xl font-bold text-center">
                {(deck.reduce((sum, card) => sum + card.cost, 0) / deck.length).toFixed(1)}
              </div>
            </div>
          </div>

          {/* レイキカード設定 */}
          <div className="bg-blue-50 p-4 rounded-lg shadow border-2 border-blue-200">
            <h4 className="font-semibold mb-3 text-blue-800">レイキカード設定</h4>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(raikiCards).map(([color, count]) => (
                <div key={color} className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'red' ? 'bg-red-500' :
                    color === 'yellow' ? 'bg-yellow-500' :
                    color === 'green' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      onClick={() => setRaikiCards(prev => ({
                        ...prev,
                        [color]: Math.max(0, prev[color as keyof typeof prev] - 1)
                      }))}
                      disabled={count === 0}
                    >
                      -
                    </Button>
                    <span className="mx-2 font-bold min-w-[20px]">{count}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0"
                      onClick={() => setRaikiCards(prev => ({
                        ...prev,
                        [color]: Math.min(15, prev[color as keyof typeof prev] + 1)
                      }))}
                      disabled={Object.values(raikiCards).reduce((sum, val) => sum + val, 0) >= 15}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3 text-sm text-gray-600">
              合計: {Object.values(raikiCards).reduce((sum, val) => sum + val, 0)}/15枚
            </div>
          </div>
        </div>
      )}

      {/* 利用可能なカード一覧 */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          {selectedColor}色の利用可能なカード（{filteredCards.length}枚）
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {filteredCards.map((card) => (
            <div key={card.id} className="cursor-pointer">
              <CardComponent card={card} isFaceUp={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
