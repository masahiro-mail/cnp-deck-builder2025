"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Eye, Upload, Lock, Globe, User } from "lucide-react"
import DeckFilters, { DeckFilter } from "@/components/deck-filters"
import { getMainColor, getColorBgClass } from "@/utils/deck-analysis"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SavedDeck {
  id: number
  deck_name: string
  deck_id: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
  raiki_cards?: Record<string, number>
  users?: {
    x_name: string
    x_username: string
    x_icon_url?: string
  }
}

export default function SavedDecks() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([])
  const [publicDecks, setPublicDecks] = useState<SavedDeck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPublic, setIsLoadingPublic] = useState(false)
  const [publicDeckFilters, setPublicDeckFilters] = useState<DeckFilter>({})
  const [publicDeckCount, setPublicDeckCount] = useState<number>(0)

  // フィルター変更のコールバック関数をメモ化
  const handlePublicDeckFilterChange = useCallback((filters: DeckFilter) => {
    setPublicDeckFilters(filters)
  }, [])

  // 保存されたデッキを取得
  const fetchSavedDecks = async () => {
    if (!session) return

    try {
      const response = await fetch('/api/decks')
      if (!response.ok) {
        throw new Error('Failed to fetch decks')
      }
      
      const decks = await response.json()
      
      // ローカル削除リストを取得してフィルタリング
      const deletedDecks = JSON.parse(localStorage.getItem('deletedDecks') || '[]')
      const filteredDecks = decks.filter((deck: SavedDeck) => !deletedDecks.includes(deck.id))
      
      setSavedDecks(filteredDecks)
      
      if (deletedDecks.length > 0) {
        console.log('Filtered out locally deleted decks:', deletedDecks)
      }
    } catch (error) {
      console.error('Error fetching decks:', error)
      toast({
        title: "デッキの取得に失敗しました",
        description: "保存されたデッキの読み込み中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 公開デッキを取得
  const fetchPublicDecks = async () => {
    setIsLoadingPublic(true)
    try {
      const response = await fetch('/api/decks?type=public&limit=50')
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch public decks: ${response.status} ${errorText}`)
      }
      
      const decks = await response.json()
      
      // 配列であることを確認してから設定
      const validDecks = Array.isArray(decks) ? decks : []
      setPublicDecks(validDecks)
    } catch (error) {
      console.error('Error fetching public decks:', error)
      toast({
        title: "公開デッキの取得に失敗しました",
        description: error instanceof Error ? error.message : "公開デッキの読み込み中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPublic(false)
    }
  }

  // 公開デッキ数のみを取得（軽量）
  const fetchPublicDeckCount = async () => {
    try {
      const response = await fetch('/api/decks/count?type=public')
      if (response.ok) {
        const { count } = await response.json()
        setPublicDeckCount(count || 0)
      }
    } catch (error) {
      console.error('Error fetching public deck count:', error)
    }
  }

  useEffect(() => {
    fetchSavedDecks()
    fetchPublicDeckCount() // 初回読み込み時に公開デッキ数を取得
  }, [session])


  // デッキを削除
  const deleteDeck = async (deckId: number, deckName: string) => {
    try {
      console.log('Attempting to delete deck:', deckId)
      
      // 複数のエンドポイントを順番に試行（保存APIと同じ方式を最優先）
      const endpoints = [
        '/api/decks/delete-supabase',  // 保存APIと同じSupabase-jsクライアント
        '/api/decks/delete',           // SSL無効化版
        '/api/decks/delete-direct',    // Direct connection版
      ]
      
      let lastError = null
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deckId }),
          })
          
          console.log(`${endpoint} response status:`, response.status)
          
          if (response.ok) {
            const result = await response.json()
            console.log(`${endpoint} success:`, result)
            
            setSavedDecks(savedDecks.filter(deck => deck.id !== deckId))
            
            toast({
              title: "デッキを削除しました",
              description: `「${deckName}」を削除しました`,
            })
            return // 成功した場合は終了
          } else {
            const errorData = await response.text()
            console.error(`${endpoint} failed:`, errorData)
            lastError = new Error(`${endpoint}: ${response.status} ${errorData}`)
          }
        } catch (endpointError: any) {
          console.error(`${endpoint} error:`, endpointError.message)
          lastError = endpointError
        }
      }
      
      // 全てのエンドポイントが失敗した場合
      throw lastError || new Error('All delete endpoints failed')
    } catch (error) {
      console.error('Error deleting deck:', error)
      toast({
        title: "削除に失敗しました",
        description: error instanceof Error ? error.message : "デッキの削除中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }

  // デッキをビルダーに読み込み
  const loadDeckInBuilder = (deck: SavedDeck) => {
    // デッキIDをクエリパラメータとしてデッキビルダーページに遷移
    router.push(`/deck-builder?deck=${encodeURIComponent(deck.deck_id)}`)
    
    toast({
      title: "デッキを読み込みました",
      description: `「${deck.deck_name}」をデッキビルダーで読み込みます`,
    })
  }

  // 公開デッキのフィルタリング
  const filteredPublicDecks = useMemo(() => {
    if (!publicDecks.length) return []
    
    return publicDecks.filter(deck => {
      // 作成者でフィルタリング
      if (publicDeckFilters.creator && deck.users?.x_name !== publicDeckFilters.creator) {
        return false
      }
      
      // メイン色でフィルタリング
      if (publicDeckFilters.mainColor && deck.raiki_cards) {
        const mainColor = getMainColor(deck.raiki_cards)
        if (mainColor.color !== publicDeckFilters.mainColor) {
          return false
        }
      }
      
      return true
    })
  }, [publicDecks, publicDeckFilters])

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">保存されたデッキを表示するにはログインしてください</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">デッキを読み込み中...</p>
      </div>
    )
  }

  const renderDeckCard = (deck: SavedDeck, isPublicDeck = false) => {
    const mainColorInfo = getMainColor(deck.raiki_cards)
    
    return (
      <Card key={deck.id} className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {deck.deck_name}
                {deck.is_public ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    公開
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    非公開
                  </Badge>
                )}
                {mainColorInfo.color !== 'unknown' && (
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getColorBgClass(mainColorInfo.color)}`}
                  >
                    {mainColorInfo.displayName} {mainColorInfo.count}枚
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {isPublicDeck && deck.users && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {deck.users.x_name}
                  </span>
                )}
                <span>
                  作成日: {new Date(deck.created_at).toLocaleDateString('ja-JP')}
                </span>
              </CardDescription>
            </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDeckInBuilder(deck)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Upload className="w-4 h-4" />
              読み込み
            </Button>
            
            {!isPublicDeck && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>デッキを削除</AlertDialogTitle>
                    <AlertDialogDescription>
                      「{deck.deck_name}」を削除してもよろしいですか？この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteDeck(deck.id, deck.deck_name)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      {deck.description && (
        <CardContent>
          <p className="text-sm text-gray-600">{deck.description}</p>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-between items-center text-xs text-gray-500">
        <span>デッキID: {deck.deck_id.substring(0, 20)}...</span>
        <span>
          更新: {new Date(deck.updated_at).toLocaleDateString('ja-JP')}
        </span>
      </CardFooter>
    </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">デッキ管理</h2>
      
      <Tabs 
        defaultValue="saved" 
        className="w-full"
        onValueChange={(value) => {
          if (value === 'public' && !publicDecks.length) {
            fetchPublicDecks()
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved">
            保存済みデッキ ({savedDecks.length})
          </TabsTrigger>
          <TabsTrigger value="public">
            公開デッキ ({publicDecks.length || publicDeckCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="saved" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">デッキを読み込み中...</p>
            </div>
          ) : savedDecks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">保存されたデッキがありません</p>
              <p className="text-sm text-gray-500">デッキビルダーでデッキを作成して保存してみましょう</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedDecks.map((deck) => renderDeckCard(deck, false))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="public" className="mt-6">
          {isLoadingPublic ? (
            <div className="text-center py-8">
              <p className="text-gray-600">公開デッキを読み込み中...</p>
            </div>
          ) : publicDecks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">公開デッキがありません</p>
              <p className="text-sm text-gray-500">他のユーザーが公開したデッキがここに表示されます</p>
            </div>
          ) : (
            <div className="space-y-6">
              <DeckFilters 
                decks={publicDecks} 
                onFilterChange={handlePublicDeckFilterChange}
              />
              
              {filteredPublicDecks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">フィルター条件に一致するデッキがありません</p>
                  <p className="text-sm text-gray-500">フィルター条件を変更してください</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPublicDecks.map((deck) => renderDeckCard(deck, true))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}