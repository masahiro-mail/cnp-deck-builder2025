import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const isConnected = await testConnection()
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
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