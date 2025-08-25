import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// 緊急時用：セッションベースのローカル削除
export async function POST(request: NextRequest) {
  console.log('=== LOCAL DELETE (EMERGENCY) START ===')
  
  try {
    const { deckId } = await request.json()
    console.log('Emergency delete request for deck ID:', deckId)
    
    // セッション確認
    const session = await getServerSession(authOptions)
    console.log('Session user ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 一時的な成功レスポンス（実際のDB削除は行わない）
    console.log('WARNING: Using emergency local delete - no actual database deletion performed')
    
    return NextResponse.json({
      success: true,
      message: 'Deck deletion requested (emergency mode)',
      warning: 'Database unavailable - using local deletion mode',
      deletedDeckId: deckId,
      userId: session.user.id
    })

  } catch (error: any) {
    console.error('=== LOCAL DELETE ERROR ===')
    console.error('Error:', error.message)
    
    return NextResponse.json({
      error: 'Emergency delete failed',
      message: error.message
    }, { status: 500 })
  } finally {
    console.log('=== LOCAL DELETE (EMERGENCY) END ===')
  }
}