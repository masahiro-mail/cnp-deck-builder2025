"use client"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          プライバシーポリシー・利用規約
        </h1>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 space-y-8">
          
          {/* 重要な免責事項 */}
          <section className="border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20 p-6 rounded-r-lg">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-4">
              ⚠️ 重要：免責事項
            </h2>
            <div className="text-red-700 dark:text-red-300 space-y-3">
              <p className="font-semibold">
                本サービスは個人が運営する非営利のファンサイトです。以下の点にご注意ください：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>デッキ情報の漏洩リスク</strong>：技術的な問題やセキュリティ侵害により、保存されたデッキ情報が第三者に漏洩する可能性があります</li>
                <li><strong>競技上の不利益</strong>：デッキ構成の漏洩により大会や対戦で不利益を被る場合でも、運営者は一切の責任を負いません</li>
                <li><strong>サービス停止リスク</strong>：予告なくサービスを停止・終了する場合があり、データの損失が発生する可能性があります</li>
                <li><strong>データの保証なし</strong>：保存されたデッキデータの完全性や可用性を保証いたしません</li>
              </ul>
              <p className="font-semibold text-lg">
                上記リスクを理解・承諾の上でサービスをご利用ください。
              </p>
            </div>
          </section>

          {/* プライバシーポリシー */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              プライバシーポリシー
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  1. 収集する情報
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>X（Twitter）アカウント情報（ユーザー名、表示名、アイコン画像）</li>
                  <li>作成・保存されたデッキ情報</li>
                  <li>サービス利用時のアクセスログ</li>
                  <li>ブラウザの技術情報（Cookie、ローカルストレージ）</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  2. 情報の利用目的
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>デッキビルダー機能の提供</li>
                  <li>ユーザー認証とアカウント管理</li>
                  <li>デッキの保存・共有機能の提供</li>
                  <li>サービスの改善・不具合修正</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  3. 情報の共有
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>公開設定されたデッキは他のユーザーに表示されます</li>
                  <li>法令に基づく要請がある場合を除き、第三者に個人情報を提供いたしません</li>
                  <li>サービス運営に必要な範囲で、信頼できる第三者サービス（Supabase、Vercel等）を利用します</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 利用規約 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              利用規約
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  1. サービスの性質
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  本サービスは、CNPトレーディングカードゲームのファンが作成した非公式のデッキ構築ツールです。
                  公式のサポートや保証は一切ありません。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  2. 利用制限
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>商用利用は禁止します</li>
                  <li>サービスに負荷をかける行為は禁止します</li>
                  <li>他のユーザーに迷惑をかける行為は禁止します</li>
                  <li>不適切な内容のデッキ名や説明の投稿は禁止します</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  3. 免責・責任制限
                </h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-2">
                  <p>
                    <strong>運営者は以下について一切の責任を負いません：</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>サービスの中断・停止・終了</li>
                    <li>データの消失・破損・漏洩</li>
                    <li>デッキ情報漏洩による競技上の不利益</li>
                    <li>サービス利用による直接的・間接的な損害</li>
                    <li>第三者による不正アクセス・データ取得</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  4. サービス変更・終了
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  運営者はいつでも予告なく本サービスの内容を変更、または提供を停止・終了できるものとします。
                </p>
              </div>
            </div>
          </section>

          {/* 連絡先 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              お問い合わせ
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              本ポリシーに関するご質問は、
              <a 
                href="https://github.com/masahiro-mail/cnp-deck-builder2025/issues" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                GitHubのIssues
              </a>
              よりお願いします。
            </p>
          </section>

          {/* 更新日 */}
          <section className="border-t pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              最終更新日: 2025年8月25日<br />
              施行日: 2025年8月25日
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}