import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Pool } from 'pg'

// Direct Connection用の接続設定
const getDirectPool = () => {
  let connectionString = process.env.DATABASE_URL
  
  // Direct connectionの場合は通常のSSL設定を使用
  if (connectionString && process.env.NODE_ENV === 'production') {
    // Direct connection用（pooler URLではなく直接接続URL用）
    if (connectionString.includes('?')) {
      connectionString += '&sslmode=require'
    } else {
      connectionString += '?sslmode=require'
    }
  }

  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true, // Direct connection用
      requestCert: false,
      agent: false,
    } : false,
    max: 5, // Direct connectionは少なめに設定
    min: 0,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 300000,
  })
}

export async function POST(request: NextRequest) {
  console.log('=== DIRECT DELETE START ===')
  
  let pool: Pool | null = null
  let client = null
  
  try {
    const { deckId } = await request.json()
    console.log('Direct delete request for deck ID:', deckId)
    
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

    // Direct connection試行
    console.log('Creating direct connection pool...')
    pool = getDirectPool()
    client = await pool.connect()
    console.log('Direct connection established')

    // セッションのX IDを使って直接ユーザーを検索
    console.log('Looking up user with X ID:', session.user.id)
    const userQuery = 'SELECT id, x_id FROM users WHERE x_id = $1'
    const userResult = await client.query(userQuery, [session.user.id])
    console.log('User query result:', userResult.rows.length, 'users found')
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'User not found in database',
        details: { sessionXId: session.user.id }
      }, { status: 404 })
    }
    
    const user = userResult.rows[0]
    console.log('Found user:', { id: user.id, x_id: user.x_id })

    // デッキの存在と所有権確認
    const checkQuery = 'SELECT id, deck_name, user_id FROM saved_decks WHERE id = $1'
    const checkResult = await client.query(checkQuery, [parsedDeckId])
    console.log('Deck check result:', checkResult.rows)
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Deck not found',
        details: { deckId: parsedDeckId }
      }, { status: 404 })
    }
    
    const deck = checkResult.rows[0]
    if (deck.user_id !== user.id) {
      console.log('Permission denied:', { deckUserId: deck.user_id, currentUserId: user.id })
      return NextResponse.json({ 
        error: 'Permission denied',
        details: { deckUserId: deck.user_id, currentUserId: user.id }
      }, { status: 403 })
    }

    // 削除実行
    console.log('Executing delete for deck:', { id: deck.id, name: deck.deck_name })
    const deleteQuery = 'DELETE FROM saved_decks WHERE id = $1 AND user_id = $2'
    const deleteResult = await client.query(deleteQuery, [parsedDeckId, user.id])
    console.log('Delete result:', { rowCount: deleteResult.rowCount })
    
    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Deck deleted successfully (direct connection)',
      deletedDeck: {
        id: deck.id,
        name: deck.deck_name
      }
    })

  } catch (error: any) {
    console.error('=== DIRECT DELETE ERROR ===')
    console.error('Error type:', error.constructor?.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error detail:', error.detail)
    
    return NextResponse.json({
      error: 'Direct delete operation failed',
      message: error.message,
      code: error.code,
      type: error.constructor?.name,
      suggestion: 'Try using Direct Connection URL instead of Transaction pooler URL'
    }, { status: 500 })
  } finally {
    if (client) {
      try {
        client.release()
        console.log('Direct client released')
      } catch (releaseError) {
        console.error('Error releasing direct client:', releaseError)
      }
    }
    if (pool) {
      try {
        await pool.end()
        console.log('Direct pool ended')
      } catch (poolError) {
        console.error('Error ending direct pool:', poolError)
      }
    }
    console.log('=== DIRECT DELETE END ===')
  }
}