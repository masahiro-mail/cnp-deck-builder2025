import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AuthSessionProvider from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import Footer from "@/components/footer"

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
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
