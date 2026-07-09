// frontend/src/app/api/history/route.ts
import { NextResponse } from 'next/server'
import { fetchOHLC, fetchMarketChart } from '@/lib/coingecko-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const coin = searchParams.get('coin') ?? 'bitcoin'

  try {
    const [ohlc, chart] = await Promise.all([
      fetchOHLC(days, coin),
      fetchMarketChart(days, coin),
    ])

    const volumeMap = new Map<string, number>()
    for (const [ts, vol] of chart.total_volumes ?? []) {
      volumeMap.set(new Date(ts).toISOString().slice(0, 10), vol)
    }

    const byDate = new Map<string, typeof ohlc[0]>()
    for (const row of ohlc) byDate.set(row.date, row)

    const rows = Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(rows.map((row, i) => {
      const prev = rows[i - 1]
      const changePct = prev ? ((row.close - prev.close) / prev.close) * 100 : 0
      return {
        date: row.date, open: row.open, high: row.high,
        low: row.low, close: row.close,
        volume: volumeMap.get(row.date) ?? 0,
        change_pct: Math.round(changePct * 100) / 100,
      }
    }))
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
