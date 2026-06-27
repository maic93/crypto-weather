// frontend/src/app/api/current/route.ts
import { NextResponse } from 'next/server'
import { fetchCurrentPrice } from '@/lib/coingecko-server'

export async function GET() {
  try {
    const data = await fetchCurrentPrice()
    return NextResponse.json({
      price: data.usd,
      change_24h: (data.usd_24h_change / 100) * data.usd,
      change_24h_pct: Math.round(data.usd_24h_change * 100) / 100,
      market_cap: data.usd_market_cap ?? 0,
      volume_24h: data.usd_24h_vol ?? 0,
      last_updated: new Date(data.last_updated_at * 1000).toISOString(),
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 503 })
  }
}
