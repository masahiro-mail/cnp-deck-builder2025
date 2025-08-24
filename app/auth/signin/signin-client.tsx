"use client"

import { getProviders, signIn } from "next-auth/react"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"

function ErrorDisplay() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'OAuth設定に問題があります。管理者にお問い合わせください。'
      case 'AccessDenied':
        return 'アクセスが拒否されました。'
      case 'Verification':
        return '認証に失敗しました。再度お試しください。'
      case 'Default':
        return '認証エラーが発生しました。'
      default:
        return error ? `認証エラー: ${error}` : null
    }
  }

  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>
        {getErrorMessage(error)}
      </AlertDescription>
    </Alert>
  )
}

export default function SignInClient() {
  const [providers, setProviders] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const setupProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
      setLoading(false)
    }
    setupProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
    try {
      await signIn(providerId, { 
        callbackUrl: "/deck-builder",
        redirect: true
      })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CNP Trading Card Game
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Twitterアカウントでログインしてください
          </p>
        </div>

        <Suspense fallback={null}>
          <ErrorDisplay />
        </Suspense>

        <div className="space-y-4">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <div key={provider.name}>
                <Button
                  onClick={() => handleSignIn(provider.id)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  {provider.name}でログイン
                </Button>
              </div>
            ))}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              デバッグ情報
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
              {JSON.stringify({ providers }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}