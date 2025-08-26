import { NextRequest, NextResponse } from 'next/server'
import { getPublicDecksSupabase } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'public') {
      // 公開デッキの数のみ取得（軽量化）
      const publicDecks = await getPublicDecksSupabase(1000, 0) // 大きな数でカウント取得
      const count = publicDecks?.length || 0
      
      return NextResponse.json({ count })
    }

    return NextResponse.json({ count: 0 })
  } catch (error: any) {
    console.error('Error getting deck count:', error)
    return NextResponse.json({ 
      error: 'Failed to get deck count',
      count: 0 
    }, { status: 500 })
  }
}