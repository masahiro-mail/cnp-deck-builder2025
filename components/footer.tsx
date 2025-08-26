import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* サイト情報 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded text-sm">CNP</div>
              <span className="font-semibold text-white">トレカ デッキビルダー</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              CNPトレーディングカードゲームのファン作成による非公式デッキ構築ツールです。
              ゲームの公式サポートはありません。
            </p>
          </div>

          {/* ナビゲーション */}
          <div>
            <h3 className="font-semibold text-white mb-4">サイトマップ</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-sm hover:text-yellow-400 transition-colors">
                デッキビルダー
              </Link>
              <Link href="/saved-decks" className="block text-sm hover:text-yellow-400 transition-colors">
                保存済みデッキ
              </Link>
              <Link href="/usage" className="block text-sm hover:text-yellow-400 transition-colors">
                使用方法
              </Link>
              <Link href="/privacy" className="block text-sm hover:text-yellow-400 transition-colors">
                プライバシーポリシー・利用規約
              </Link>
            </nav>
          </div>

          {/* 外部リンク */}
          <div>
            <h3 className="font-semibold text-white mb-4">外部リンク</h3>
            <div className="space-y-2">
              <a 
                href="https://github.com/masahiro-mail/cnp-deck-builder2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm hover:text-yellow-400 transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink size={12} />
              </a>
              <a 
                href="https://github.com/masahiro-mail/cnp-deck-builder2025/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm hover:text-yellow-400 transition-colors"
              >
                <span>バグ報告・要望</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* 著作権・免責事項 */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center space-y-3">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-200">
              <p className="text-sm font-semibold mb-2">⚠️ 重要な免責事項</p>
              <p className="text-xs leading-relaxed">
                本サービスは個人運営の非公式ファンサイトです。デッキ情報の漏洩や競技上の不利益、
                サービス停止によるデータ損失等について運営者は一切の責任を負いません。
                利用にはリスクを承諾の上でご利用ください。
              </p>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>© 2025 CNP トレカ デッキビルダー（非公式ファンサイト）</p>
              <p>本サイトはCNP Trading Card Gameの公式サイトではありません</p>
              <p>Generated with Claude Code - Built with Next.js, Vercel, Supabase</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}