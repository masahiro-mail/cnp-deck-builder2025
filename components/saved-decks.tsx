"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Eye, Upload, Lock, Globe } from "lucide-react"
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
}

export default function SavedDecks() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 保存されたデッキを取得
  const fetchSavedDecks = async () => {
    if (!session) return

    try {
      const response = await fetch('/api/decks')
      if (!response.ok) {
        throw new Error('Failed to fetch decks')
      }
      
      const decks = await response.json()
      setSavedDecks(decks)
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

  useEffect(() => {
    fetchSavedDecks()
  }, [session])

  // デッキを削除
  const deleteDeck = async (deckId: number, deckName: string) => {
    try {
      console.log('Attempting to delete deck:', deckId)
      const response = await fetch('/api/decks/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deckId }),
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Delete response error:', errorData)
        throw new Error(`Failed to delete deck: ${response.status} ${errorData}`)
      }

      const result = await response.json()
      console.log('Delete result:', result)

      setSavedDecks(savedDecks.filter(deck => deck.id !== deckId))
      
      toast({
        title: "デッキを削除しました",
        description: `「${deckName}」を削除しました`,
      })
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

  if (savedDecks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">保存されたデッキがありません</p>
        <p className="text-sm text-gray-500">デッキビルダーでデッキを作成して保存してみましょう</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">保存されたデッキ ({savedDecks.length})</h2>
      
      <div className="grid gap-4">
        {savedDecks.map((deck) => (
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
                  </CardTitle>
                  <CardDescription>
                    作成日: {new Date(deck.created_at).toLocaleDateString('ja-JP')}
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
        ))}
      </div>
    </div>
  )
}