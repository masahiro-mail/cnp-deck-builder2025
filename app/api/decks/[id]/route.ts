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
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { userId: session.user?.id, email: session.user?.email } : 'null')
    
    if (!session || !session.user?.id) {
      console.log('Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deckId = parseInt(params.id)
    console.log('Parsed deck ID:', deckId)
    if (isNaN(deckId)) {
      console.log('Invalid deck ID')
      return NextResponse.json({ error: 'Invalid deck ID' }, { status: 400 })
    }

    // ユーザー情報取得
    console.log('Getting user by X ID:', session.user.id)
    const user = await getUserByXId(session.user.id)
    console.log('User found:', user ? { id: user.id, xId: user.x_id } : 'null')
    
    if (!user) {
      console.log('User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.id) {
      console.log('User ID is null')
      return NextResponse.json({ error: 'Invalid user data' }, { status: 500 })
    }

    // デッキ削除（所有者確認付き）
    console.log('Attempting to delete deck:', { deckId, userId: user.id })
    const deleted = await deleteDeck(deckId, user.id)
    console.log('Delete result:', deleted)
    
    if (!deleted) {
      console.log('Deck not found or delete failed')
      return NextResponse.json({ error: 'Deck not found or you do not have permission to delete it' }, { status: 404 })
    }

    console.log('Deck deleted successfully')
    return NextResponse.json({ message: 'Deck deleted successfully' })
  } catch (error: any) {
    console.error('=== DELETE ERROR ===')
    console.error('Error deleting deck:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error message:', error?.message)
    console.error('Error code:', error?.code)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined 
    }, { status: 500 })
  } finally {
    console.log('=== DELETE /api/decks/[id] END ===')
  }
}