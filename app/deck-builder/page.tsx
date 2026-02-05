"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { cards } from "@/data/cards"
import CardModal from "@/components/card-modal"
import SwipeableCard from "@/components/swipeable-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  Save,
  Trash2,
  Upload,
  ArrowUpDown,
  Code,
  Database,
  AlertTriangle,
  Grid,
  List,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Copy,
  FolderOpen,
  FileInput,
  Download,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { Card } from "@/types/card"
import { generateBuilderDeckId, decodeDeckId, parseReikiMeta } from "@/utils/deck-id-generator"
import { analyzeDeck, loadDecksFromStorage, getRecommendedDecks } from "@/utils/deck-utils"
import { sortCards } from "@/utils/card-sort"
import SavedDeckItem from "@/components/saved-deck-item"
import DeckStats from "@/components/deck-stats"
import { useToast } from "@/hooks/use-toast"

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
      if (["C", "R", "RR", "RRR"].includes(card.rarity)) {
        rarities.add(card.rarity)
      }
    }
  })
  return Array.from(rarities).sort()
}

export default function DeckBuilderPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [availableCards, setAvailableCards] = useState<Card[]>(cards)
  const [deck, setDeck] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cardType, setCardType] = useState<string>("all")
  const [cardColor, setCardColor] = useState<string>("all")
  const [onlySelectedCards, setOnlySelectedCards] = useState<boolean>(false)
  const [cardRarity, setCardRarity] = useState<string>("all")
  const [cardEffectType, setCardEffectType] = useState<string>("all")
  const [cardPack, setCardPack] = useState<string>("all")
  const [deckId, setDeckId] = useState<string>("")
  const [customDeckId, setCustomDeckId] = useState<string>("")
  const [deckName, setDeckName] = useState<string>("")
  const [deckDescription, setDeckDescription] = useState<string>("")
  const [isPublic, setIsPublic] = useState<boolean>(false)
  const [savedDecks, setSavedDecks] = useState<
    Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>
  >({})
  const [importDeckId, setImportDeckId] = useState<string>("")
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({})
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [deckAnalysis, setDeckAnalysis] = useState<string>("")
  const [isDecodedDeck, setIsDecodedDeck] = useState<boolean>(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isServerSaveDialogOpen, setIsServerSaveDialogOpen] = useState(false)
  const [idError, setIdError] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "cards">("cards")
  const [deckFilter, setDeckFilter] = useState<string>("all")
  const [deckSearchTerm, setDeckSearchTerm] = useState("")
  const [showSavedDecks, setShowSavedDecks] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [cnpOverwriteDeckId, setCnpOverwriteDeckId] = useState<string>("")
  const [cnpReturnTo, setCnpReturnTo] = useState<string>("")

  // 新しい機能のためのstate
  const [isDeckLoadDialogOpen, setIsDeckLoadDialogOpen] = useState(false)
  const [isIdInputDialogOpen, setIsIdInputDialogOpen] = useState(false)
  const [inputDeckId, setInputDeckId] = useState("")
  const [availableDecks, setAvailableDecks] = useState<any[]>([])
  const [selectedLoadDeck, setSelectedLoadDeck] = useState<string>("")
  
  // レイキカードシステム（デフォルト値：各色3枚、合計15枚）
  const [raikiCards, setRaikiCards] = useState<Record<string, number>>({
    blue: 3,    // 青
    red: 3,     // 赤  
    yellow: 3,  // 黄
    green: 3,   // 緑
    purple: 3   // 紫
  })

  // 効果分類、収録パック、レアリティの一覧
  const effectTypes = useMemo(() => getEffectTypes(), [])
  const packs = useMemo(() => getPacks(), [])
  const rarities = useMemo(() => getRarities(), [])
  const allCardIds = useMemo(() => cards.map((card) => card.id), [])

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
      const deckId = generateBuilderDeckId(deck.map((card) => card.id), raikiCards)

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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Save deck API error:', errorData)
        throw new Error(`Failed to save deck: ${errorData.error || response.statusText}`)
      }

      toast({
        title: "デッキを保存しました",
        description: `「${deckName}」がサーバーに保存されました`,
      })

      setDeckName("")
      setDeckDescription("")
      setIsPublic(false)
      setIsServerSaveDialogOpen(false)

    } catch (error) {
      console.error('Error saving deck:', error)
      const errorMessage = error instanceof Error ? error.message : "デッキの保存中にエラーが発生しました"
      toast({
        title: "保存に失敗しました",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ID発行（コピー専用）
  const copyDeckId = async () => {
    if (deck.length === 0) {
      toast({
        title: "デッキが空です",
        description: "まずデッキを作成してください",
        variant: "destructive",
      })
      return
    }

    const generatedId = generateBuilderDeckId(deck.map((card) => card.id), raikiCards)
    
    try {
      await navigator.clipboard.writeText(generatedId)
      toast({
        title: "デッキIDをコピーしました",
        description: "クリップボードにコピーされました",
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "コピーに失敗しました",
        description: "手動でコピーしてください: " + generatedId.substring(0, 20) + "...",
        variant: "destructive",
      })
    }
  }

  // デッキ読み込みダイアログを開く
  const openDeckLoadDialog = async () => {
    setIsDeckLoadDialogOpen(true)
    
    // 自分の保存済みデッキと公開デッキを取得
    try {
      const personalDecks = session ? await fetch('/api/decks').then(res => res.ok ? res.json() : []) : []
      const publicDecks = await fetch('/api/decks/public').then(res => res.ok ? res.json() : [])
      
      setAvailableDecks([
        ...personalDecks.map((deck: any) => ({ ...deck, type: 'personal' })),
        ...publicDecks.map((deck: any) => ({ ...deck, type: 'public' }))
      ])
    } catch (error) {
      console.error('Error fetching decks:', error)
      setAvailableDecks([])
    }
  }

  // 選択したデッキを読み込み
  const loadSelectedDeck = () => {
    if (!selectedLoadDeck) return
    
    const selectedDeck = availableDecks.find(deck => deck.deck_id === selectedLoadDeck)
    if (selectedDeck) {
      // デッキIDでデッキを読み込み
      const loadedDeck = loadDeckById(selectedDeck.deck_id)
      if (loadedDeck.length > 0) {
        setDeck(loadedDeck)
        setDeckId(selectedDeck.deck_id)
        setDeckName(selectedDeck.deck_name || "読み込みデッキ")
        
        const counts: Record<string, number> = {}
        loadedDeck.forEach((card) => {
          counts[card.id] = (counts[card.id] || 0) + 1
        })
        setCardCounts(counts)
        
        // Raiki cardsを復元（存在する場合）
        if (selectedDeck.raiki_cards && typeof selectedDeck.raiki_cards === 'object') {
          setRaikiCards(selectedDeck.raiki_cards)
        } else {
          // デフォルト値にリセット（各色3枚、合計15枚）
          setRaikiCards({ blue: 3, red: 3, yellow: 3, green: 3, purple: 3 })
        }
        
        toast({
          title: "デッキを読み込みました",
          description: `「${selectedDeck.deck_name}」を読み込みました`,
        })
      }
    }
    
    setIsDeckLoadDialogOpen(false)
    setSelectedLoadDeck("")
  }

  // ID入力によるデッキ読み込み
  const loadDeckByIdInput = () => {
    if (!inputDeckId.trim()) {
      toast({
        title: "デッキIDが必要です",
        description: "デッキIDを入力してください",
        variant: "destructive",
      })
      return
    }
    
    const loadedDeck = loadDeckById(inputDeckId.trim())
    if (loadedDeck.length > 0) {
      setDeck(loadedDeck)
      setDeckId(inputDeckId.trim())
      
      const counts: Record<string, number> = {}
      loadedDeck.forEach((card) => {
        counts[card.id] = (counts[card.id] || 0) + 1
      })
      setCardCounts(counts)
      
      toast({
        title: "デッキを読み込みました",
        description: "デッキIDから正常に読み込みました",
      })
    } else {
      toast({
        title: "デッキが見つかりません",
        description: "入力されたIDのデッキが見つかりませんでした",
        variant: "destructive",
      })
    }
    
    setIsIdInputDialogOpen(false)
    setInputDeckId("")
  }

  // レイキカードの数を更新
  const updateRaikiCount = (color: string, delta: number) => {
    const newRaiki = { ...raikiCards }
    const currentCount = newRaiki[color] || 0
    const newCount = Math.max(0, Math.min(15, currentCount + delta))
    
    // 全体の合計をチェック
    const totalOthers = Object.entries(newRaiki)
      .filter(([key]) => key !== color)
      .reduce((sum, [, count]) => sum + count, 0)
    
    if (totalOthers + newCount <= 15) {
      newRaiki[color] = newCount
      setRaikiCards(newRaiki)
    }
  }

  // Rest of the original functions remain the same...
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const loadDeckById = (deckId: string): Card[] => {
    const savedDecks = loadDecksFromStorage()
    const deckData = savedDecks[deckId]

    if (deckData) {
      return deckData.cards
        .map((cardId) => {
          const card = cards.find((c) => c.id === cardId)
          if (!card) return null
          return card
        })
        .filter((card): card is Card => card !== null)
    } else {
      try {
        const cardIds = decodeDeckId(deckId, allCardIds)
        if (cardIds.length === 0) return []

        return cardIds
          .map((cardId) => {
            const card = cards.find((c) => c.id === cardId)
            if (!card) return null
            return card
          })
          .filter((card): card is Card => card !== null)
      } catch (error) {
        console.error("Failed to decode deck ID:", error)
        return []
      }
    }
  }

  // Continue with all the other original functions...
  const deleteSavedDeck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (confirm(`デッキ「${savedDecks[id]?.name || "Unnamed Deck"}」を削除してもよろしいですか？`)) {
      const updatedDecks = { ...savedDecks }
      delete updatedDecks[id]
      localStorage.setItem("cnpDecks", JSON.stringify(updatedDecks))
      setSavedDecks(updatedDecks)

      if (id === deckId) {
        clearDeck()
      }
    }
  }

  const clearDeck = () => {
    setDeck([])
    setDeckId("")
    setCustomDeckId("")
    setDeckName("")
    setCardCounts({})
    setDeckAnalysis("")
    setIsDecodedDeck(false)

    localStorage.removeItem("lastUsedDeckId")

    const url = new URL(window.location.href)
    url.searchParams.delete("deck")
    url.searchParams.delete("builderDeckId")
    window.history.replaceState({}, "", url.toString())
  }

  const openSaveDialog = () => {
    const generatedId = generateBuilderDeckId(deck.map((card) => card.id), raikiCards)
    setCustomDeckId(generatedId)
    setDeckName("My Deck")
    setIsSaveDialogOpen(true)
  }

  const saveDeck = () => {
    if (deck.length !== 50) {
      const warningMessage =
        deck.length < 50
          ? `デッキは${deck.length}枚です。50枚未満ですが、保存しますか？`
          : `デッキは${deck.length}枚です。50枚を超えていますが、保存しますか？`

      if (!confirm(warningMessage)) {
        return
      }
    }

    const generatedId = generateBuilderDeckId(deck.map((card) => card.id), raikiCards)
    const finalDeckId = customDeckId.trim() || generatedId

    const existingDecks = loadDecksFromStorage()
    if (existingDecks[finalDeckId] && finalDeckId !== deckId) {
      setIdError("このIDは既に使用されています")
      return
    }

    const finalDeckName = deckName.trim() || `デッキ ${Object.keys(savedDecks).length + 1}`

    const updatedDecks = { ...savedDecks }
    updatedDecks[finalDeckId] = {
      cards: deck.map((card) => card.id),
      name: finalDeckName,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem("cnpDecks", JSON.stringify(updatedDecks))
    localStorage.setItem("lastUsedDeckId", finalDeckId)

    const url = new URL(window.location.href)
    url.searchParams.delete("deck")
    window.history.replaceState({}, "", url.toString())

    setSavedDecks(updatedDecks)
    setDeckId(finalDeckId)
    setIsSaveDialogOpen(false)
    setIdError("")
    setIsDecodedDeck(false)

    navigator.clipboard
      .writeText(finalDeckId)
      .then(() => {
        alert(
          `デッキ名「${finalDeckName}」のIDを発行しました！${deck.length !== 50 ? `\n※注意: このデッキは${deck.length}枚です（標準は50枚）` : ""}`,
        )
      })
      .catch((err) => {
        console.error("コピーに失敗しました", err)
        alert(
          `デッキ名「${finalDeckName}」のIDを発行しました！${deck.length !== 50 ? `\n※注意: このデッキは${deck.length}枚です（標準は50枚）` : ""}`,
        )
      })
  }

  // All useEffects and other functions remain the same...
  useEffect(() => {
    const decks = loadDecksFromStorage()
    const recommendedDecks = getRecommendedDecks(allCardIds)
    const mergedDecks = { ...decks }

    Object.entries(recommendedDecks).forEach(([id, deck]) => {
      if (!mergedDecks[id]) {
        mergedDecks[id] = deck
      }
    })

    setSavedDecks(mergedDecks)

    const params = new URLSearchParams(window.location.search)
    const builderDeckId = params.get("builderDeckId")
    const urlDeckId = params.get("deck")
    const overwriteDeckId = params.get("overwriteDeckId")
    const returnTo = params.get("returnTo")
    if (overwriteDeckId) setCnpOverwriteDeckId(overwriteDeckId)
    if (returnTo) setCnpReturnTo(returnTo)

    const loadFromExternalId = (id: string) => {
      try {
        const reiki = parseReikiMeta(id)
        if (reiki) setRaikiCards((prev) => ({ ...prev, ...reiki }))
        const cardIds = decodeDeckId(id, allCardIds)
        const loadedDeck = cardIds
          .map((cardId) => cards.find((c) => c.id === cardId) || null)
          .filter((card): card is Card => card !== null)
        if (loadedDeck.length === 0) return

        setDeck(loadedDeck)
        setDeckId(id)
        setCustomDeckId(id)
        setIsDecodedDeck(true)
        setCardColor("all")
        // トレカアプリから編集で開いた直後は「選択カードのみ」をOFFにする
        setOnlySelectedCards(false)
        setDeckName("復元されたデッキ")

        const counts: Record<string, number> = {}
        loadedDeck.forEach((card) => {
          counts[card.id] = (counts[card.id] || 0) + 1
        })
        setCardCounts(counts)
        setDeckAnalysis(analyzeDeck(loadedDeck))
        localStorage.setItem("lastUsedDeckId", id)

        const url = new URL(window.location.href)
        url.searchParams.set("builderDeckId", id)
        url.searchParams.delete("deck")
        window.history.replaceState({}, "", url.toString())
      } catch (error) {
        console.error("Failed to load external deck ID:", error)
      }
    }

    if (builderDeckId) {
      loadFromExternalId(builderDeckId)
    } else if (urlDeckId) {
      loadSavedDeck(urlDeckId)
    } else {
      const lastUsedDeckId = localStorage.getItem("lastUsedDeckId")
      if (lastUsedDeckId && mergedDecks[lastUsedDeckId]) {
        loadSavedDeck(lastUsedDeckId)
      }
    }
  }, [allCardIds])

  useEffect(() => {
    let result = [...cards]

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

    if (cardType !== "all") {
      result = result.filter((card) => card.type === cardType)
    }

    if (cardColor !== "all") {
      result = result.filter((card) => card.color === cardColor)
    }

    if (onlySelectedCards) {
      // 「選択カードのみ」= デッキに1枚以上入っているカードのみ
      result = result.filter((card) => (cardCounts[card.id] ?? 0) > 0)
    }

    if (cardRarity !== "all") {
      result = result.filter((card) => card.rarity === cardRarity)
    }

    if (cardEffectType !== "all") {
      result = result.filter((card) => card.effectType && card.effectType.includes(cardEffectType))
    }

    if (cardPack !== "all") {
      result = result.filter((card) => card.pack === cardPack)
    }

    // rarity が "SR" になることは無い前提のため、変換処理は不要

    const sortedResult = sortCards(result, sortBy, sortOrder)
    setAvailableCards(sortedResult)
  }, [searchTerm, cardType, cardColor, onlySelectedCards, cardCounts, cardRarity, cardEffectType, cardPack, sortBy, sortOrder, deck])

  useEffect(() => {
    if (deck.length > 0) {
      setDeckAnalysis(analyzeDeck(deck))
    } else {
      setDeckAnalysis("")
    }
  }, [deck])

  const getCnpAppOrigin = () => {
    const env = process.env.NEXT_PUBLIC_CNP_APP_ORIGIN
    if (env && env.trim()) return env.trim().replace(/\/$/, "")
    if (typeof window !== "undefined" && window.location.hostname === "localhost") return "http://localhost:3000"
    return ""
  }

  const safeReturnToPath = (value: string) => (value.startsWith("/") ? value : "")

  const openCnpAppForImport = () => {
    const origin = getCnpAppOrigin()
    if (!origin) {
      toast({
        title: "連携先URLが未設定です",
        description: "NEXT_PUBLIC_CNP_APP_ORIGIN を設定してください",
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
    const builderDeckId = generateBuilderDeckId(deck.map((card) => card.id), raikiCards)
    const url = new URL(`${origin}/deck/add`)
    url.searchParams.set("builderDeckId", builderDeckId)
    if (cnpOverwriteDeckId) url.searchParams.set("overwriteDeckId", cnpOverwriteDeckId)
    const path = safeReturnToPath(cnpReturnTo)
    if (path) url.searchParams.set("returnTo", path)
    window.open(url.toString(), "CNPTCGapp")
  }

  const openCnpAppReturnTo = () => {
    const origin = getCnpAppOrigin()
    const path = safeReturnToPath(cnpReturnTo)
    if (!origin || !path) return
    window.location.href = `${origin}${path}`
  }

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  const closeModal = () => {
    setSelectedCard(null)
  }

  const addCardToDeck = (card: Card) => {
    const cardCount = cardCounts[card.id] || 0
    if (cardCount >= 4) {
      return
    }

    setDeck([...deck, card])
    setCardCounts({
      ...cardCounts,
      [card.id]: cardCount + 1,
    })
    setSelectedCard(null)
  }

  const removeCardFromDeck = (card: Card) => {
    const cardCount = cardCounts[card.id] || 0
    if (cardCount > 0) {
      const cardIndex = deck.findIndex((c) => c.id === card.id)
      if (cardIndex !== -1) {
        const newDeck = [...deck]
        newDeck.splice(cardIndex, 1)
        setDeck(newDeck)
        setCardCounts({
          ...cardCounts,
          [card.id]: cardCount - 1,
        })
      }
    }
  }

  // Continue with all remaining functions...
  const importDeck = () => {
    const deckIdToImport = importDeckId.trim()
    if (!deckIdToImport) {
      return
    }

    let loadedDeck: Card[] = []
    let isLocalDeckFound = false

    const savedDecks = loadDecksFromStorage()
    if (savedDecks[deckIdToImport]) {
      isLocalDeckFound = true
      loadedDeck = savedDecks[deckIdToImport].cards
        .map((cardId) => {
          const card = cards.find((c) => c.id === cardId)
          if (!card) return null
          return card
        })
        .filter((card): card is Card => card !== null)
    } else {
      try {
        const reiki = parseReikiMeta(deckIdToImport)
        if (reiki) setRaikiCards((prev) => ({ ...prev, ...reiki }))
        const cardIds = decodeDeckId(deckIdToImport, allCardIds)

        if (cardIds.length === 0) {
          alert("デッキIDからカードを復元できませんでした。")
          return
        }

        loadedDeck = cardIds
          .map((cardId) => {
            const card = cards.find((c) => c.id === cardId)
            if (!card) return null
            return card
          })
          .filter((card): card is Card => card !== null)
      } catch (error) {
        console.error("Failed to decode deck ID:", error)
        alert("デッキIDの解析に失敗しました。")
        return
      }
    }

    if (loadedDeck.length === 0) {
      alert("指定されたIDのデッキが見つかりませんでした。")
      return
    }

    setDeck(loadedDeck)
    setDeckId(deckIdToImport)
    setCustomDeckId(deckIdToImport)
    setIsDecodedDeck(!isLocalDeckFound)
    setImportDeckId("")
    setCardColor("all")

    if (isLocalDeckFound) {
      setDeckName(savedDecks[deckIdToImport].name)
    } else {
      const defaultName = "復元されたデッキ"
      const deckNameInput = prompt("デッキ名を入力してください", defaultName)
      setDeckName(deckNameInput || defaultName)
    }

    const counts: Record<string, number> = {}
    loadedDeck.forEach((card) => {
      counts[card.id] = (counts[card.id] || 0) + 1
    })
    setCardCounts(counts)

    setDeckAnalysis(analyzeDeck(loadedDeck))

    localStorage.setItem("lastUsedDeckId", deckIdToImport)

    const url = new URL(window.location.href)
    url.searchParams.set("builderDeckId", deckIdToImport)
    url.searchParams.delete("deck")
    window.history.replaceState({}, "", url.toString())
  }

  const loadSavedDeck = (id: string) => {
    const loadedDeck = loadDeckById(id)
    if (loadedDeck.length === 0) return

    setDeck(loadedDeck)
    setDeckId(id)
    setCustomDeckId(id)
    setIsDecodedDeck(false)
    setCardColor("all")

    if (savedDecks[id]) {
      setDeckName(savedDecks[id].name)
    }

    const counts: Record<string, number> = {}
    loadedDeck.forEach((card) => {
      counts[card.id] = (counts[card.id] || 0) + 1
    })
    setCardCounts(counts)

    setDeckAnalysis(analyzeDeck(loadedDeck))

    localStorage.setItem("lastUsedDeckId", id)

    const url = new URL(window.location.href)
    url.searchParams.set("builderDeckId", id)
    url.searchParams.delete("deck")
    window.history.replaceState({}, "", url.toString())
  }

  const handleSortOrderChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      toggleSortOrder()
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
  }

  const filterDecks = (
    decks: Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>,
  ) => {
    let filtered = { ...decks }

    if (deckFilter !== "all") {
      filtered = Object.entries(filtered).reduce(
        (acc, [id, deck]) => {
          if (deckFilter === "recommended" && deck.isRecommended) {
            acc[id] = deck
          }
          else if (deckFilter === "my" && !deck.isRecommended) {
            acc[id] = deck
          }
          else if (deckFilter === "blue" && deck.name.includes("🟦")) {
            acc[id] = deck
          }
          else if (deckFilter === "red" && deck.name.includes("🟥")) {
            acc[id] = deck
          }
          else if (deckFilter === "yellow" && deck.name.includes("🟨")) {
            acc[id] = deck
          }
          else if (deckFilter === "green" && deck.name.includes("🟩")) {
            acc[id] = deck
          }
          return acc
        },
        {} as Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>,
      )
    }

    if (deckSearchTerm) {
      const term = deckSearchTerm.toLowerCase()
      filtered = Object.entries(filtered).reduce(
        (acc, [id, deck]) => {
          if (deck.name.toLowerCase().includes(term) || id.toLowerCase().includes(term)) {
            acc[id] = deck
          }
          return acc
        },
        {} as Record<string, { name: string; cards: string[]; createdAt: string; isRecommended?: boolean }>,
      )
    }

    return filtered
  }

  const filteredDecks = useMemo(() => {
    return filterDecks(savedDecks)
  }, [savedDecks, deckFilter, deckSearchTerm])

  return (
    <div className="min-h-screen tech-pattern p-4 dark:bg-gray-900 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {safeReturnToPath(cnpReturnTo) ? (
          <div className="mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={openCnpAppReturnTo}
              className="bg-white dark:bg-gray-900 border-gray-200 dark:border-blue-900 text-gray-700 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              戻る
            </Button>
          </div>
        ) : null}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: デッキ情報 */}
          <div className="lg:col-span-1 bg-white dark:bg-black border border-gray-200 dark:border-blue-900 rounded-lg shadow-lg p-4 dark:neon-border">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-blue-400 flex items-center mb-3">
                <Database className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                デッキ ({deck.length > 50 ? <span className="text-red-600">{deck.length}</span> : deck.length}/50)
              </h2>
              
              {/* 第一列: 保存・ID発行 */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsServerSaveDialogOpen(true)}
                  disabled={deck.length === 0}
                  className="bg-white dark:bg-green-900 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-200"
                >
                  <Save className="h-4 w-4 mr-1" />
                  デッキ保存
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyDeckId}
                  disabled={deck.length === 0}
                  className="bg-white dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900 hover:text-yellow-700 dark:hover:text-yellow-200"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  ID発行
                </Button>
              </div>
              
              {/* 第二列: 読み込み・ID入力 */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDeckLoadDialog}
                  className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200"
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  デッキ読込
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsIdInputDialogOpen(true)}
                  className="bg-white dark:bg-purple-900 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 hover:text-purple-700 dark:hover:text-purple-200"
                >
                  <FileInput className="h-4 w-4 mr-1" />
                  ID入力
                </Button>
              </div>

              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCnpAppForImport}
                  disabled={deck.length === 0}
                  className="w-full bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  トレカアプリでインポート
                </Button>
              </div>
            </div>

            {isDecodedDeck && (
              <Alert className="mb-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-600 dark:text-blue-400">復元されたデッキ</AlertTitle>
                <AlertDescription>
                  このデッキはIDから復元されました。保存するには「ID発行」ボタンを押してください。
                </AlertDescription>
              </Alert>
            )}

            {deck.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-blue-300 border border-dashed border-gray-300 dark:border-blue-800 rounded-lg">
                <Code className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-blue-500 opacity-50" />
                <p>カードをクリックしてデッキに追加してください</p>
              </div>
            ) : (
              <DeckStats deck={deck} deckAnalysis={deckAnalysis} />
            )}

            {/* レイキカードシステム */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-blue-300 mb-3 flex items-center">
                <Database className="h-4 w-4 mr-1 text-purple-600 dark:text-purple-400" />
                レイキデッキ ({Object.values(raikiCards).reduce((a, b) => a + b, 0)}/15)
              </h3>
              
              <div className="space-y-3">
                {Object.entries({
                  blue: { name: '青', color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
                  red: { name: '赤', color: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' },
                  yellow: { name: '黄', color: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' },
                  green: { name: '緑', color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
                  purple: { name: '紫', color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' }
                }).map(([colorKey, colorInfo]) => (
                  <div key={colorKey} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${colorInfo.color}`} />
                      <span className={`text-sm font-medium ${colorInfo.textColor}`}>
                        {colorInfo.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRaikiCount(colorKey, -1)}
                        disabled={raikiCards[colorKey] === 0}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-mono">
                        {raikiCards[colorKey]}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRaikiCount(colorKey, 1)}
                        disabled={Object.values(raikiCards).reduce((a, b) => a + b, 0) >= 15}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  合計15枚になるように選択してください
                </div>
              </div>
            </div>
          </div>

          {/* 右側: カードリスト */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-blue-900 rounded-lg shadow-lg p-4 mb-6 dark:neon-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-blue-400 flex items-center">
                  <Grid className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  カードリスト ({availableCards.length}枚)
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    フィルター
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "cards" : "grid")}
                    className="bg-white dark:bg-green-900 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-200"
                  >
                    {viewMode === "grid" ? <List className="h-4 w-4 mr-1" /> : <Grid className="h-4 w-4 mr-1" />}
                    {viewMode === "grid" ? "カード表示" : "グリッド表示"}
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="カードを検索..."
                    className="pl-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="cardType" className="block text-sm font-medium text-gray-700 dark:text-blue-300">
                        タイプ
                      </Label>
                      <Select value={cardType} onValueChange={setCardType}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべてのタイプ" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべてのタイプ</SelectItem>
                          <SelectItem value="ユニット">ユニット</SelectItem>
                          <SelectItem value="イベント">イベント</SelectItem>
                          <SelectItem value="サポーター">サポーター</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cardColor" className="block text-sm font-medium text-gray-700 dark:text-blue-300">
                        色
                      </Label>
                      <Select value={cardColor} onValueChange={setCardColor}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべての色" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべての色</SelectItem>
                          <SelectItem value="red">赤</SelectItem>
                          <SelectItem value="blue">青</SelectItem>
                          <SelectItem value="green">緑</SelectItem>
                          <SelectItem value="yellow">黄</SelectItem>
                          <SelectItem value="purple">紫</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="cardRarity"
                        className="block text-sm font-medium text-gray-700 dark:text-blue-300"
                      >
                        レアリティ
                      </Label>
                      <Select value={cardRarity} onValueChange={setCardRarity}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべてのレアリティ" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべてのレアリティ</SelectItem>
                          {rarities.map((rarity) => (
                            <SelectItem key={rarity} value={rarity}>
                              {rarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="cardEffectType"
                        className="block text-sm font-medium text-gray-700 dark:text-blue-300"
                      >
                        効果分類
                      </Label>
                      <Select value={cardEffectType} onValueChange={setCardEffectType}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべての効果分類" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべての効果分類</SelectItem>
                          {effectTypes.map((effectType) => (
                            <SelectItem key={effectType} value={effectType}>
                              {effectType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cardPack" className="block text-sm font-medium text-gray-700 dark:text-blue-300">
                        収録パック
                      </Label>
                      <Select value={cardPack} onValueChange={setCardPack}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectValue placeholder="すべての収録パック" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          <SelectItem value="all">すべての収録パック</SelectItem>
                          {packs.map((pack) => (
                            <SelectItem key={pack} value={pack}>
                              {pack}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 収録パックの右（=レアリティの下）に配置 */}
                    <div className="flex items-center gap-2 mt-7">
                      <Checkbox
                        id="onlySelectedCards"
                        checked={onlySelectedCards}
                        onCheckedChange={(v) => setOnlySelectedCards(v === true)}
                      />
                      <Label
                        htmlFor="onlySelectedCards"
                        className="text-sm font-medium text-gray-700 dark:text-blue-300"
                      >
                        選択カードのみ
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-start space-x-4 mb-4">
                <Label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-blue-300">
                  ソート順:
                </Label>
                <Select value={sortBy} onValueChange={handleSortOrderChange}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="名前" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    <SelectItem value="name">
                      名前 {sortBy === "name" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="cost">
                      コスト {sortBy === "cost" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="bp">
                      BP {sortBy === "bp" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="sp">
                      SP {sortBy === "sp" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="type">
                      タイプ {sortBy === "type" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="colorCost">
                      色コスト {sortBy === "colorCost" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                    <SelectItem value="colorlessCost">
                      無色コスト {sortBy === "colorlessCost" && (sortOrder === "asc" ? " (昇順)" : " (降順)")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={toggleSortOrder} className="bg-white dark:bg-gray-800">
                  <ArrowUpDown className="ml-2 h-4 w-4 dark:text-white text-black" />
                </Button>
              </div>

              {viewMode === "grid" ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-[500px] overflow-auto">
                  <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "100%", width: "100%" }}>
                    <table className="w-full border-collapse bg-white dark:bg-gray-800">
                      <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            枚数
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            操作
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            カード名
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            色
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            コスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            色コスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            無色コスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            タイプ
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            BP
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            SP
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            効果分類
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            効果テキスト
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            レア
                          </th>
                          <th className="p-2 text-left text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                            収録パック
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableCards.map((card) => (
                          <tr
                            key={card.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 py-2 cursor-pointer"
                            onClick={() => handleCardClick(card)}
                          >
                            <td className="p-2 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {cardCounts[card.id] || 0}
                            </td>
                            <td className="p-2 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeCardFromDeck(card)
                                  }}
                                  className="p-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700"
                                  disabled={!cardCounts[card.id]}
                                >
                                  <Minus size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addCardToDeck(card)
                                  }}
                                  className="p-1 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-700"
                                  disabled={cardCounts[card.id] >= 4}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.name}
                            </td>
                            <td className="px-4 py-3 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
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
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.cost}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.colorCost || 0}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.colorlessCost || 0}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.type}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.bp || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.sp ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.effectType ? card.effectType.join(", ") : "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 max-w-[300px] truncate">
                              {card.ability || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.rarity || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                              {card.pack || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {availableCards.map((card) => (
                    <SwipeableCard
                      key={card.id}
                      card={card}
                      count={cardCounts[card.id] || 0}
                      onIncrement={() => {
                        const currentCount = cardCounts[card.id] || 0
                        if (currentCount < 4) {
                          setDeck([...deck, card])
                          setCardCounts({
                            ...cardCounts,
                            [card.id]: currentCount + 1,
                          })
                        }
                      }}
                      onDecrement={() => {
                        const currentCount = cardCounts[card.id] || 0
                        if (currentCount > 0) {
                          const cardIndex = deck.findIndex((c) => c.id === card.id)
                          if (cardIndex !== -1) {
                            const newDeck = [...deck]
                            newDeck.splice(cardIndex, 1)
                            setDeck(newDeck)
                            setCardCounts({
                              ...cardCounts,
                              [card.id]: currentCount - 1,
                            })
                          }
                        }
                      }}
                      onClick={() => handleCardClick(card)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* カード詳細モーダル */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          closeModal={closeModal}
          deckCount={cardCounts[selectedCard.id] || 0}
          onIncrement={() => {
            const currentCount = cardCounts[selectedCard.id] || 0
            if (currentCount < 4) {
              setDeck([...deck, selectedCard])
              setCardCounts({
                ...cardCounts,
                [selectedCard.id]: currentCount + 1,
              })
            }
          }}
          onDecrement={() => {
            const currentCount = cardCounts[selectedCard.id] || 0
            if (currentCount > 0) {
              const cardIndex = deck.findIndex((c) => c.id === selectedCard.id)
              if (cardIndex !== -1) {
                const newDeck = [...deck]
                newDeck.splice(cardIndex, 1)
                setDeck(newDeck)
                setCardCounts({
                  ...cardCounts,
                  [selectedCard.id]: currentCount - 1,
                })
              }
            }
          }}
        />
      )}

      {/* サーバー保存ダイアログ */}
      <Dialog open={isServerSaveDialogOpen} onOpenChange={setIsServerSaveDialogOpen}>
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

      {/* ID発行ダイアログ */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">デッキIDを発行</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                デッキID
              </Label>
              <Input
                type="text"
                id="deckId"
                value={customDeckId}
                onChange={(e) => setCustomDeckId(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-gray-700 dark:text-gray-300">
                デッキ名
              </Label>
              <Input
                type="text"
                id="name"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="col-span-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            {deck.length !== 50 && (
              <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-600 dark:text-yellow-400">注意</AlertTitle>
                <AlertDescription>このデッキは{deck.length}枚です（標準は50枚です）</AlertDescription>
              </Alert>
            )}
          </div>
          {idError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{idError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" onClick={saveDeck}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* デッキ読み込みダイアログ */}
      <Dialog open={isDeckLoadDialogOpen} onOpenChange={setIsDeckLoadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>デッキを読み込み</DialogTitle>
            <DialogDescription>
              保存済みデッキまたは公開デッキから選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>利用可能なデッキ</Label>
              <Select value={selectedLoadDeck} onValueChange={setSelectedLoadDeck}>
                <SelectTrigger>
                  <SelectValue placeholder="デッキを選択..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDecks.map((deck) => (
                    <SelectItem key={deck.deck_id} value={deck.deck_id}>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          deck.type === 'personal' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {deck.type === 'personal' ? '自分' : '公開'}
                        </span>
                        <div className="flex flex-col">
                          <span>{deck.deck_name}</span>
                          {deck.raiki_cards && (
                            <div className="text-xs text-gray-500 flex gap-1">
                              <span className="text-blue-500">青{deck.raiki_cards.blue || 0}</span>
                              <span className="text-red-500">赤{deck.raiki_cards.red || 0}</span>
                              <span className="text-yellow-500">黄{deck.raiki_cards.yellow || 0}</span>
                              <span className="text-green-500">緑{deck.raiki_cards.green || 0}</span>
                              <span className="text-purple-500">紫{deck.raiki_cards.purple || 0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {availableDecks.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                読み込み可能なデッキがありません
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={loadSelectedDeck}
              disabled={!selectedLoadDeck}
            >
              読み込み
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ID入力ダイアログ */}
      <Dialog open={isIdInputDialogOpen} onOpenChange={setIsIdInputDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>デッキIDを入力</DialogTitle>
            <DialogDescription>
              読み込みたいデッキのIDを入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="input-deck-id" className="text-right">
                デッキID
              </Label>
              <Input
                id="input-deck-id"
                value={inputDeckId}
                onChange={(e) => setInputDeckId(e.target.value)}
                className="col-span-3"
                placeholder="BK-xxxxx... または既存のID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={loadDeckByIdInput}
              disabled={!inputDeckId.trim()}
            >
              読み込み
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}