import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { deleteDeckSupabase, getUserByXIdSupabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  console.log('=== SUPABASE DELETE START ===')
  
  try {
    const { deckId } = await request.json()
    console.log('Supabase delete request for deck ID:', deckId)
    
    // セッション確認
    const session = await getServerSession(authOptions)
    console.log('Session user ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // デッキIDの妥当性確認
    const parsedDeckId = parseInt(deckId)
    if (isNaN(parsedDeckId) || parsedDeckId <= 0) {
      return NextResponse.json({ error: 'Invalid deck ID' }, { status: 400 })
    }

    // Supabase-jsクライアント経由でユーザー検索
    console.log('Looking up user with X ID via Supabase:', session.user.id)
    const user = await getUserByXIdSupabase(session.user.id)
    console.log('User found via Supabase:', user ? { id: user.id, x_id: user.x_id } : 'null')
    
    if (!user?.id) {
      return NextResponse.json({ 
        error: 'User not found in database',
        details: { sessionXId: session.user.id }
      }, { status: 404 })
    }

    // Supabase-jsクライアント経由で削除実行
    console.log('Executing Supabase delete operation:', { deckId: parsedDeckId, userId: user.id })
    const deleteResult = await deleteDeckSupabase(parsedDeckId, user.id)
    console.log('Supabase delete result:', deleteResult)
    
    if (!deleteResult) {
      return NextResponse.json({ 
        error: 'Deck not found or access denied',
        details: { deckId: parsedDeckId, userId: user.id }
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Deck deleted successfully via Supabase-js',
      deletedDeckId: parsedDeckId,
      method: 'supabase-js'
    })

  } catch (error: any) {
    console.error('=== SUPABASE DELETE ERROR ===')
    console.error('Error type:', error.constructor?.name)
    console.error('Error message:', error.message)
    
    return NextResponse.json({
      error: 'Supabase delete operation failed',
      message: error.message,
      type: error.constructor?.name,
      method: 'supabase-js'
    }, { status: 500 })
  } finally {
    console.log('=== SUPABASE DELETE END ===')
  }
}