"use client"

import dynamic from 'next/dynamic'

const SignInClient = dynamic(() => import('./signin-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>読み込み中...</p>
      </div>
    </div>
  )
})

export default function SignIn() {
  return <SignInClient />
}