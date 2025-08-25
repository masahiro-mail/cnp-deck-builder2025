import { NextRequest, NextResponse } from 'next/server'
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

// PostgreSQL接続プール - Supabase Transaction Pooler用設定
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false, // Transaction pooler用に変更
    requestCert: false,
    agent: false,
  } : false,
  max: 10,
  min: 0,
  acquireTimeoutMillis: 60000,
  idleTimeoutMillis: 600000,
})

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    console.log('=== Schema Debug Check ===')
    
    // テーブル一覧を取得
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    const tables = await client.query(tablesQuery)
    console.log('Available tables:', tables.rows.map(r => r.table_name))
    
    // saved_decksテーブルの構造を確認
    const schemaQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'saved_decks' 
      ORDER BY ordinal_position
    `
    const schema = await client.query(schemaQuery)
    console.log('saved_decks table schema:', schema.rows)
    
    // saved_decksテーブルのデータ件数を確認
    const countQuery = 'SELECT COUNT(*) as total FROM saved_decks'
    const count = await client.query(countQuery)
    console.log('saved_decks total records:', count.rows[0].total)
    
    // サンプルデータを確認
    const sampleQuery = 'SELECT id, user_id, deck_name, created_at FROM saved_decks LIMIT 5'
    const sample = await client.query(sampleQuery)
    console.log('Sample records:', sample.rows)
    
    return NextResponse.json({
      tables: tables.rows,
      schema: schema.rows,
      totalRecords: count.rows[0].total,
      sampleData: sample.rows
    })
  } catch (error: any) {
    console.error('Schema debug error:', error)
    return NextResponse.json({
      error: 'Database error',
      message: error?.message,
      code: error?.code
    }, { status: 500 })
  } finally {
    client.release()
  }
}