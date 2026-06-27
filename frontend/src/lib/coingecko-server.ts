// frontend/src/lib/coingecko-server.ts
// Server-side CoinGecko calls for Next.js API routes

const BASE = 'https://api.coingecko.com/api/v3'
const COIN = 'bitcoin'

export async function fetchCurrentPrice() {
  const res = await fetch(
    `${BASE}/simple/price?ids=${COIN}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`CoinGecko price error: ${res.status}`)
  const data = await res.json()
  return data[COIN]
}

export async function fetchOHLC(days = 30) {
  const res = await fetch(
    `${BASE}/coins/${COIN}/ohlc?vs_currency=usd&days=${days}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`CoinGecko OHLC error: ${res.status}`)
  const raw: number[][] = await res.json()
  return raw.map(([ts, open, high, low, close]) => ({
    date: new Date(ts).toISOString().slice(0, 10),
    open, high, low, close, volume: 0,
  }))
}

export async function fetchMarketChart(days = 30) {
  const res = await fetch(
    `${BASE}/coins/${COIN}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`CoinGecko chart error: ${res.status}`)
  return res.json()
}
