import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // セキュリティのため、開発環境のみで実行
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    nextauth_url: process.env.NEXTAUTH_URL,
    nextauth_secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    twitter_client_id: process.env.TWITTER_CLIENT_ID ? 'Set' : 'Not set',
    twitter_client_secret: process.env.TWITTER_CLIENT_SECRET ? 'Set' : 'Not set',
    database_url: process.env.DATABASE_URL ? 'Set' : 'Not set',
    url_host: request.nextUrl.origin,
    timestamp: new Date().toISOString()
  })
}