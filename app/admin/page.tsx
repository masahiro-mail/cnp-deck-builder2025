"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Users, Database, Shield, Globe, Lock } from "lucide-react"
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

interface User {
  id: number
  x_id: string
  x_name: string
  x_username: string
  x_icon_url?: string
  created_at: string
  updated_at: string
  saved_decks?: { count: number }[]
}

interface AdminDeck {
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

export default function AdminPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [decks, setDecks] = useState<AdminDeck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 管理者権限チェック
  const isAdmin = session?.user?.username?.toLowerCase() === 'diagram_wolf'

  useEffect(() => {
    if (session === null || (session && !isAdmin)) {
      router.push('/')
      return
    }

    if (session && isAdmin) {
      fetchAdminData()
    }
  }, [session, isAdmin, router])

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      const [usersResponse, decksResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/decks')
      ])

      if (usersResponse.ok && decksResponse.ok) {
        const usersData = await usersResponse.json()
        const decksData = await decksResponse.json()
        setUsers(usersData)
        setDecks(decksData)
      } else {
        throw new Error('Failed to fetch admin data')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "データの取得に失敗しました",
        description: "管理者データの読み込み中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDeck = async (deckId: number, deckName: string) => {
    try {
      const response = await fetch('/api/admin/decks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deckId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete deck')
      }

      setDecks(decks.filter(deck => deck.id !== deckId))
      
      toast({
        title: "デッキを削除しました",
        description: `「${deckName}」を削除しました`,
      })
    } catch (error) {
      console.error('Error deleting deck:', error)
      toast({
        title: "削除に失敗しました",
        description: "デッキの削除中にエラーが発生しました",
        variant: "destructive",
      })
    }
  }


  if (session === null) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" />
              アクセス拒否
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>このページは管理者専用です。</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-600">管理者データを読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-yellow-500" />
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Diagram_Wolf専用の管理画面
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="users">ユーザー管理 ({users.length})</TabsTrigger>
            <TabsTrigger value="decks">デッキ管理 ({decks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    総ユーザー数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    総デッキ数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{decks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    公開デッキ数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {decks.filter(deck => deck.is_public).length}
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {user.x_icon_url && (
                          <img 
                            src={user.x_icon_url} 
                            alt={user.x_name}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{user.x_name}</h3>
                          <p className="text-sm text-gray-500">@{user.x_username}</p>
                          <p className="text-xs text-gray-400">
                            登録日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          デッキ数: {user.saved_decks?.[0]?.count || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="decks" className="mt-6">
            <div className="grid gap-4">
              {decks.map((deck) => (
                <Card key={deck.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{deck.deck_name}</h3>
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
                        </div>
                        {deck.users && (
                          <p className="text-sm text-gray-500 mb-1">
                            作成者: {deck.users.x_name} (@{deck.users.x_username})
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          作成日: {new Date(deck.created_at).toLocaleDateString('ja-JP')}
                        </p>
                        <p className="text-xs text-gray-400">
                          デッキID: {deck.deck_id.substring(0, 30)}...
                        </p>
                      </div>
                      <div className="ml-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>デッキを削除</AlertDialogTitle>
                              <AlertDialogDescription>
                                「{deck.deck_name}」を削除してもよろしいですか？
                                この操作は取り消せません。
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}