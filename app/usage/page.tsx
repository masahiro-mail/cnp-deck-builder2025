import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function UsagePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">CNPトレカ デッキビルダー 使用方法</h1>
        <p className="text-gray-600 dark:text-gray-300">
          CNPトレーディングカードゲームのデッキ構築と管理について説明します。
        </p>
      </div>

      <div className="space-y-8">
        {/* デッキ構築方法 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              デッキ構築方法
            </CardTitle>
            <CardDescription>
              新しいデッキを作成する基本的な手順
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 1</Badge>
                <div>
                  <p className="font-medium">カード一覧からカードを選択</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    カード一覧ページで、デッキに追加したいカードをクリックして詳細を確認し、「デッキに追加」ボタンを押します。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 2</Badge>
                <div>
                  <p className="font-medium">デッキの調整</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    デッキビルダーページで、カードの枚数を調整し、バランスを確認します。レイキカーブを参考にしてください。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 3</Badge>
                <div>
                  <p className="font-medium">デッキの保存</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    X（Twitter）でログイン後、デッキ名を付けて保存できます。保存したデッキは「保存済みデッキ」から確認できます。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* デッキ共有方法 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              デッキ共有方法
            </CardTitle>
            <CardDescription>
              作成したデッキを他のプレイヤーと共有する方法
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">方法 1</Badge>
                <div>
                  <p className="font-medium">デッキIDで共有</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    デッキビルダーの「デッキIDをコピー」ボタンで、デッキIDをクリップボードにコピーして共有できます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">方法 2</Badge>
                <div>
                  <p className="font-medium">URLで共有</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    保存済みデッキページから、各デッキの共有リンクをコピーして送信できます。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 以前データの読み込み方法 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              以前データの読み込み方法
            </CardTitle>
            <CardDescription>
              過去に作成したデッキや共有されたデッキを読み込む手順
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 1</Badge>
                <div>
                  <p className="font-medium">「ID入力」をクリック</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    デッキビルダーページの「ID入力」ボタンをクリックします。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 2</Badge>
                <div>
                  <p className="font-medium">デッキIDを入力</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    共有されたデッキIDを入力フィールドにペーストします。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 3</Badge>
                <div>
                  <p className="font-medium">レイキを入力</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    デッキの総レイキ数を入力します（通常は30）。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 4</Badge>
                <div>
                  <p className="font-medium">Xでログイン</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    X（Twitter）アカウントでログインします。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Step 5</Badge>
                <div>
                  <p className="font-medium">デッキ保存</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    読み込んだデッキに名前を付けて保存します。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ルールと制限 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">4</Badge>
              デッキ構築のルールと制限
            </CardTitle>
            <CardDescription>
              CNPトレーディングカードゲームのデッキ構築ルール
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">デッキ枚数</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    最小30枚〜最大60枚
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">同名カード制限</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    同じ名前のカードは最大4枚まで
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">レイキ制限</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    総レイキ数は30に設定
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">色バランス</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    5色のバランスを考慮
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* カード検索とフィルタリング */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">5</Badge>
              カード検索とフィルタリング
            </CardTitle>
            <CardDescription>
              効率的にカードを見つける方法
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">名前検索</Badge>
                <div>
                  <p className="font-medium">カード名で検索</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    検索ボックスにカード名を入力して、特定のカードを素早く見つけられます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">色フィルタ</Badge>
                <div>
                  <p className="font-medium">色別に絞り込み</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    青、赤、黄、緑、紫の5色で絞り込みができます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">タイプフィルタ</Badge>
                <div>
                  <p className="font-medium">カードタイプで絞り込み</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ユニット、イベント、サポーターで絞り込みができます。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">コストフィルタ</Badge>
                <div>
                  <p className="font-medium">コスト別に絞り込み</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    カードのコストで絞り込みができます。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* トラブルシューティング */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">6</Badge>
              トラブルシューティング
            </CardTitle>
            <CardDescription>
              よくある問題と解決方法
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <h4 className="font-medium mb-2">デッキIDが読み込めない場合</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                  <li>デッキIDが正しく入力されているか確認してください</li>
                  <li>レイキ数が正しく設定されているか確認してください</li>
                  <li>ページをリロードしてから再度試してください</li>
                </ul>
              </div>
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                <h4 className="font-medium mb-2">デッキが保存できない場合</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                  <li>X（Twitter）でログインしているか確認してください</li>
                  <li>デッキ名が入力されているか確認してください</li>
                  <li>ネットワーク接続を確認してください</li>
                </ul>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                <h4 className="font-medium mb-2">カードが表示されない場合</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                  <li>検索フィルターをリセットしてください</li>
                  <li>ブラウザのキャッシュをクリアしてください</li>
                  <li>ページを再読み込みしてください</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">
          ご不明な点やバグ報告については、開発者にお問い合わせください。
        </p>
        <p className="text-xs mt-2">
          CNP Trading Card Game - Deck Builder v1.0
        </p>
      </div>
    </div>
  )
}