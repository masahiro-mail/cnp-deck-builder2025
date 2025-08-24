import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByXId, testConnection } from '@/lib/database'

export async function GET(request: NextRequest) {
  console.log('=== USER DEBUG START ===')
  
  try {
    // データベース接続テスト
    console.log('Testing database connection...')
    const dbTest = await testConnection()
    console.log('Database test result:', dbTest)
    
    // セッション確認
    const session = await getServerSession(authOptions)
    console.log('Session check:', {
      exists: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session',
        dbConnection: dbTest,
        sessionInfo: null
      })
    }
    
    // ユーザー検索テスト
    console.log('Attempting user lookup for X ID:', session.user.id)
    let userResult = null
    let userError = null
    
    try {
      userResult = await getUserByXId(session.user.id)
      console.log('User lookup successful:', userResult ? { id: userResult.id, x_id: userResult.x_id } : 'null')
    } catch (error: any) {
      userError = {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack?.substring(0, 300)
      }
      console.error('User lookup failed:', userError)
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      dbConnection: dbTest,
      sessionInfo: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      userLookup: {
        success: !!userResult,
        user: userResult,
        error: userError
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0
      }
    })
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      type: error.constructor?.name,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 })
  } finally {
    console.log('=== USER DEBUG END ===')
  }
}