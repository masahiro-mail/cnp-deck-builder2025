import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByXId } from '@/lib/database'
import { Pool } from 'pg'

// Supabaseの接続文字列を解析
let connectionString = process.env.DATABASE_URL

// SSL証明書問題の回避：接続文字列にsslmode=requireを強制追加
if (connectionString && process.env.NODE_ENV === 'production') {
  // 既存のクエリパラメータがある場合とない場合に対応
  if (connectionString.includes('?')) {
    connectionString += '&sslmode=require'
  } else {
    connectionString += '?sslmode=require'
  }
}

// PostgreSQL接続プール - Supabase用設定
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    requestCert: false,
    agent: false,
  } : false,
  max: 10,
  min: 0,
  acquireTimeoutMillis: 60000,
  idleTimeoutMillis: 600000,
})

export async function POST(request: NextRequest) {
  console.log('=== DELETE TEST START ===')
  
  try {
    const { deckId } = await request.json()
    console.log('Testing delete for deck ID:', deckId)
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { userId: session.user?.id, email: session.user?.email } : 'null')
    
    if (!session || !session.user?.id) {
      console.log('No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザー情報取得
    console.log('Getting user by X ID:', session.user.id)
    const user = await getUserByXId(session.user.id)
    console.log('User found:', user)
    
    if (!user || !user.id) {
      console.log('User not found or invalid')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const client = await pool.connect()
    
    try {
      // まず、該当デッキが存在するかチェック
      const checkQuery = 'SELECT * FROM saved_decks WHERE id = $1 AND user_id = $2'
      const checkResult = await client.query(checkQuery, [deckId, user.id])
      console.log('Deck check result:', checkResult.rows)
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Deck not found',
          details: { deckId, userId: user.id }
        }, { status: 404 })
      }
      
      // 削除実行
      const deleteQuery = 'DELETE FROM saved_decks WHERE id = $1 AND user_id = $2'
      const deleteResult = await client.query(deleteQuery, [deckId, user.id])
      console.log('Delete result:', deleteResult)
      
      return NextResponse.json({
        success: true,
        deletedRows: deleteResult.rowCount,
        deck: checkResult.rows[0]
      })
      
    } finally {
      client.release()
    }
    
  } catch (error: any) {
    console.error('=== DELETE TEST ERROR ===')
    console.error('Error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({
      error: 'Test failed',
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    }, { status: 500 })
  } finally {
    console.log('=== DELETE TEST END ===')
  }
}