"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import AuthButton from "@/components/auth-button"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-black dark:bg-black text-white">
      {/* デスクトップ表示 */}
      <div className="hidden md:flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded">CNP</div>
          <h1 className="text-xl font-bold">トレカ デッキビルダー</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/saved-decks" className="hover:text-yellow-400">
            保存済みデッキ
          </Link>
          <Link href="/usage" className="hover:text-yellow-400">
            使用方法
          </Link>
          <Link href="/privacy" className="hover:text-yellow-400 text-sm">
            プライバシーポリシー
          </Link>
          <AuthButton />
          <ModeToggle />
        </div>
      </div>

      {/* モバイル表示 */}
      <div className="md:hidden">
        {/* ヘッダーバー */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded text-sm">CNP</div>
            <h1 className="text-lg font-bold">トレカ デッキビルダー</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-yellow-400 hover:bg-gray-800"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="border-t border-gray-700 bg-gray-900">
            <nav className="flex flex-col space-y-1 p-4">
              <Link 
                href="/saved-decks" 
                className="block py-3 px-4 hover:bg-gray-800 hover:text-yellow-400 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                保存済みデッキ
              </Link>
              <Link 
                href="/usage" 
                className="block py-3 px-4 hover:bg-gray-800 hover:text-yellow-400 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                使用方法
              </Link>
              <Link 
                href="/privacy" 
                className="block py-3 px-4 hover:bg-gray-800 hover:text-yellow-400 rounded transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                プライバシーポリシー
              </Link>
              <div className="flex items-center justify-between py-3 px-4">
                <span className="text-gray-300">アカウント・設定</span>
                <div className="flex items-center space-x-3">
                  <AuthButton />
                  <ModeToggle />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}