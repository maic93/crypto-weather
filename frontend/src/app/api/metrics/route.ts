// frontend/src/app/api/metrics/route.ts
import { NextResponse } from 'next/server'
import { fetchOHLC } from '@/lib/coingecko-server'
import { runForecast } from '@/lib/forecast-engine'

export async function GET() {
  try {
    const ohlc = await fetchOHLC(90)
    const result = runForecast(ohlc)

    return NextResponse.json({
      rsi: result.rsi,
      macd_signal: result.macd_signal,
      trend: result.trend,
      volatility: result.volatility,
      support: result.support,
      resistance: result.resistance,
      sma_20: result.sma_20,
      sma_50: result.sma_50,
      ema_12: result.ema_12,
      ema_26: result.ema_26,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
