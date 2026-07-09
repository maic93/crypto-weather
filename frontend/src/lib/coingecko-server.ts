// frontend/src/lib/coingecko-server.ts
const BASE = 'https://api.coingecko.com/api/v3'

export const SUPPORTED_COINS = [
  'bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin', 'ripple',
]

function safeCoin(coin: string | null): string {
  return SUPPORTED_COINS.includes(coin ?? '') ? (coin as string) : 'bitcoin'
}

export async function fetchCurrentPrice(coin = 'bitcoin') {
  const id = safeCoin(coin)
  const res = await fetch(
    `${BASE}/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`CoinGecko price error: ${res.status}`)
  const data = await res.json()
  return data[id]
}

export async function fetchOHLC(days = 30, coin = 'bitcoin') {
  const id = safeCoin(coin)
  const res = await fetch(
    `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`CoinGecko OHLC error: ${res.status}`)
  const raw: number[][] = await res.json()
  return raw.map(([ts, open, high, low, close]) => ({
    date: new Date(ts).toISOString().slice(0, 10),
    open, high, low, close, volume: 0,
  }))
}

export async function fetchMarketChart(days = 30, coin = 'bitcoin') {
  const id = safeCoin(coin)
  const res = await fetch(
    `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`CoinGecko chart error: ${res.status}`)
  return res.json()
}
