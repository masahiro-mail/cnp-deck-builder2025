import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/database'
import { testSupabaseConnection } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    // 両方の接続方法をテスト
    const pgConnection = await testConnection()
    const supabaseConnection = await testSupabaseConnection()
    
    return NextResponse.json({
      success: true,
      connections: {
        postgresql: pgConnection,
        supabase: supabaseConnection
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}