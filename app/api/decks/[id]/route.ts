import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDeckById, updateDeck, deleteDeck, getUserByXId } from '@/lib/database'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deckId = parseInt(params.id)
    if (isNaN(deckId)) {
      return NextResponse.json({ error: 'Invalid deck ID' }, { status: 400 })
    }

    // ユーザー情報取得
    const user = await getUserByXId(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // デッキ取得（所有者確認付き）
    const deck = await getDeckById(deckId, user.id!)
    
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    return NextResponse.json(deck)
  } catch (error) {
    console.error('Error fetching deck:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deckId = parseInt(params.id)
    if (isNaN(deckId)) {
      return NextResponse.json({ error: 'Invalid deck ID' }, { status: 400 })
    }

    const updates = await request.json()

    // ユーザー情報取得
    const user = await getUserByXId(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // デッキ更新（所有者確認付き）
    const updatedDeck = await updateDeck(deckId, user.id!, updates)
    
    if (!updatedDeck) {
      return NextResponse.json({ error: 'Deck not found or no changes made' }, { status: 404 })
    }

    return NextResponse.json(updatedDeck)
  } catch (error) {
    console.error('Error updating deck:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log('=== DELETE /api/decks/[id] START ===')
  console.log('Params:', params)
  
  try {
    // セッション確認
    const session = await getServerSession(authOptions)
    console.log('Session exists:', !!session)
    console.log('Session user ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('No valid session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // デッキID検証
    const deckId = parseInt(params.id)
    console.log('Deck ID to delete:', deckId)
    if (isNaN(deckId) || deckId <= 0) {
      console.log('Invalid deck ID format')
      return NextResponse.json({ error: 'Invalid deck ID' }, { status: 400 })
    }

    // ユーザー取得
    console.log('Looking up user with X ID:', session.user.id)
    let user
    try {
      user = await getUserByXId(session.user.id)
      console.log('User lookup result:', user ? { id: user.id, x_id: user.x_id } : 'null')
    } catch (userError: any) {
      console.error('User lookup failed:', userError.message)
      return NextResponse.json({ error: 'Database user lookup failed' }, { status: 500 })
    }
    
    if (!user?.id) {
      console.log('User not found or invalid user ID')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // デッキ削除実行
    console.log('Executing delete operation:', { deckId, userId: user.id })
    let deleteResult
    try {
      deleteResult = await deleteDeck(deckId, user.id)
      console.log('Delete operation result:', deleteResult)
    } catch (deleteError: any) {
      console.error('Delete operation failed:', deleteError.message)
      console.error('Delete error details:', { 
        code: deleteError.code,
        detail: deleteError.detail 
      })
      return NextResponse.json({ 
        error: 'Database delete operation failed',
        details: process.env.NODE_ENV === 'development' ? deleteError.message : undefined
      }, { status: 500 })
    }
    
    if (!deleteResult) {
      console.log('No rows affected - deck not found or no permission')
      return NextResponse.json({ 
        error: 'Deck not found or access denied',
        details: { deckId, userId: user.id }
      }, { status: 404 })
    }

    console.log('SUCCESS: Deck deleted successfully')
    return NextResponse.json({ 
      message: 'Deck deleted successfully',
      deletedDeckId: deckId
    })
    
  } catch (error: any) {
    console.error('=== UNEXPECTED DELETE ERROR ===')
    console.error('Error type:', error.constructor?.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack?.substring(0, 500))
    
    return NextResponse.json({ 
      error: 'Internal server error',
      type: error.constructor?.name || 'Unknown',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  } finally {
    console.log('=== DELETE /api/decks/[id] END ===')
  }
}