// frontend/src/app/api/forecast/route.ts
import { NextResponse } from 'next/server'
import { fetchCurrentPrice, fetchOHLC } from '@/lib/coingecko-server'
import { runForecast, runSevenDay } from '@/lib/forecast-engine'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const coin = searchParams.get('coin') ?? 'bitcoin'

  try {
    const [priceData, ohlc] = await Promise.all([
      fetchCurrentPrice(coin),
      fetchOHLC(30, coin),
    ])

    const result = runForecast(ohlc)
    const sevenDay = runSevenDay(ohlc, result.score)

    return NextResponse.json({
      current: {
        price: priceData.usd,
        change_24h: (priceData.usd_24h_change / 100) * priceData.usd,
        change_24h_pct: Math.round(priceData.usd_24h_change * 100) / 100,
        market_cap: priceData.usd_market_cap ?? 0,
        volume_24h: priceData.usd_24h_vol ?? 0,
        last_updated: new Date(priceData.last_updated_at * 1000).toISOString(),
      },
      weather: {
        condition: result.condition,
        label: result.label,
        icon: result.icon,
        score: result.score,
      },
      today_high: result.today_high,
      today_low: result.today_low,
      confidence: result.confidence,
      seven_day: sevenDay,
      generated_at: new Date().toISOString(),
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
