// frontend/src/app/api/history/route.ts
import { NextResponse } from 'next/server'
import { fetchOHLC, fetchMarketChart } from '@/lib/coingecko-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '30')

  try {
    const [ohlc, chart] = await Promise.all([
      fetchOHLC(days),
      fetchMarketChart(days),
    ])

    // Enrich with volume from market chart
    const volumeMap = new Map<string, number>()
    for (const [ts, vol] of chart.total_volumes ?? []) {
      volumeMap.set(new Date(ts).toISOString().slice(0, 10), vol)
    }

    // Deduplicate by date
    const byDate = new Map<string, typeof ohlc[0]>()
    for (const row of ohlc) {
      byDate.set(row.date, row)
    }

    const rows = Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    const result = rows.map((row, i) => {
      const prev = rows[i - 1]
      const changePct = prev
        ? ((row.close - prev.close) / prev.close) * 100
        : 0
      return {
        date: row.date,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: volumeMap.get(row.date) ?? 0,
        change_pct: Math.round(changePct * 100) / 100,
      }
    })

    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
