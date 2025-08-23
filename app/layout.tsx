import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import AuthSessionProvider from "@/components/session-provider"
import AuthButton from "@/components/auth-button"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CNP Trading Card Game",
  description: "CNP Trading Card Game",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-950`}>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <header className="bg-black dark:bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded">CNP</div>
                <h1 className="text-xl font-bold">Trading Card Game</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/deck-builder" className="hover:text-yellow-400">
                  デッキビルダー
                </Link>
                <Link href="/saved-decks" className="hover:text-yellow-400">
                  保存済みデッキ
                </Link>
                <Link href="/quiz" className="hover:text-yellow-400">
                  CNPトレカクイズ
                </Link>
                <AuthButton />
                <ModeToggle />
              </div>
            </header>
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
