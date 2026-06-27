// frontend/src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    database: 'supabase',
    last_price_update: new Date().toISOString().slice(0, 10),
  })
}
