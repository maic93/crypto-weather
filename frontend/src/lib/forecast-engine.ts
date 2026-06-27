// frontend/src/lib/forecast-engine.ts
// TypeScript port of the Python ensemble forecast engine

export type WeatherCondition =
  | 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish'

export interface OHLCRow {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ForecastResult {
  score: number
  confidence: number
  condition: WeatherCondition
  label: string
  icon: string
  rsi: number
  macd_signal: 'bullish' | 'bearish' | 'neutral'
  trend: 'up' | 'down' | 'sideways'
  volatility: 'low' | 'medium' | 'high' | 'extreme'
  support: number
  resistance: number
  sma_20: number
  sma_50: number
  ema_12: number
  ema_26: number
  atr: number
  today_high: number
  today_low: number
}

const WEATHER_MAP = [
  { min: 90, condition: 'strong_bullish' as WeatherCondition, label: 'Strong Bullish', icon: '☀️' },
  { min: 70, condition: 'bullish' as WeatherCondition, label: 'Bullish', icon: '⛅' },
  { min: 45, condition: 'neutral' as WeatherCondition, label: 'Neutral', icon: '☁️' },
  { min: 25, condition: 'bearish' as WeatherCondition, label: 'Bearish', icon: '🌧️' },
  { min: 0,  condition: 'strong_bearish' as WeatherCondition, label: 'Strong Bearish', icon: '⛈️' },
]

function sma(prices: number[], window: number): number[] {
  return prices.map((_, i) => {
    const slice = prices.slice(Math.max(0, i - window + 1), i + 1)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}

function ema(prices: number[], span: number): number[] {
  const k = 2 / (span + 1)
  const result: number[] = [prices[0]]
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k))
  }
  return result
}

function rsi(prices: number[], period = 14): number {
  const deltas = prices.slice(1).map((p, i) => p - prices[i])
  const gains = deltas.map(d => Math.max(0, d))
  const losses = deltas.map(d => Math.max(0, -d))

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < deltas.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
  }

  if (avgLoss === 0) return 100
  if (avgGain === 0) return 0
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function macdHistogram(prices: number[]): number {
  const ema12 = ema(prices, 12)
  const ema26 = ema(prices, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signalLine = ema(macdLine, 9)
  return macdLine[macdLine.length - 1] - signalLine[signalLine.length - 1]
}

function atr(rows: OHLCRow[], period = 14): number {
  const trs = rows.slice(1).map((row, i) => {
    const prev = rows[i].close
    return Math.max(row.high - row.low, Math.abs(row.high - prev), Math.abs(row.low - prev))
  })
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trs.length)
}

function conditionFromScore(score: number) {
  for (const entry of WEATHER_MAP) {
    if (score >= entry.min) return entry
  }
  return WEATHER_MAP[WEATHER_MAP.length - 1]
}

export function runForecast(rows: OHLCRow[]): ForecastResult {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  const closes = sorted.map(r => r.close)
  const current = closes[closes.length - 1]

  const sma20 = sma(closes, 20)
  const sma50 = sma(closes, 50)
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const rsiVal = rsi(closes)
  const macdHist = macdHistogram(closes)
  const atrVal = atr(sorted)
  const recent = sorted.slice(-20)
  const support = Math.min(...recent.map(r => r.low))
  const resistance = Math.max(...recent.map(r => r.high))

  // Trend score
  const sma20Last = sma20[sma20.length - 1]
  const sma50Last = sma50[sma50.length - 1]
  const ratio20 = ((current - sma20Last) / sma20Last) * 100
  const cross = ((sma20Last - sma50Last) / sma50Last) * 100
  const weekChange = closes.length >= 7
    ? ((current - closes[closes.length - 7]) / closes[closes.length - 7]) * 100
    : 0
  const sTrend = (
    Math.min(Math.max(50 + ratio20 * 5, 0), 100) +
    Math.min(Math.max(50 + cross * 3, 0), 100) +
    Math.min(Math.max(50 + weekChange * 3, 0), 100)
  ) / 3

  // RSI score
  const sRsi = rsiVal >= 70 ? 80 : rsiVal <= 30 ? 25 : ((rsiVal - 30) / 40) * 100

  // MACD score
  const sMacd = Math.min(Math.max(50 + (macdHist / current) * 10_000 * 15, 0), 100)

  // Structure score
  const span = resistance - support
  const sStruct = span > 0 ? ((current - support) / span) * 100 : 50

  // Volatility score
  const returns = closes.slice(1).map((c, i) => Math.abs((c - closes[i]) / closes[i]) * 100)
  const avgVol = returns.slice(-14).reduce((a, b) => a + b, 0) / 14
  const sVol = avgVol < 2 ? 60 : avgVol < 5 ? 50 : avgVol < 10 ? 35 : 20
  const volLabel: 'low' | 'medium' | 'high' | 'extreme' =
    avgVol < 2 ? 'low' : avgVol < 5 ? 'medium' : avgVol < 10 ? 'high' : 'extreme'

  const score = Math.min(Math.max(
    sTrend * 0.35 + sRsi * 0.20 + sMacd * 0.20 + sStruct * 0.15 + sVol * 0.10,
    0
  ), 100)

  const weather = conditionFromScore(score)

  // Confidence
  const extremeness = Math.abs(score - 50) / 50
  const changes = closes.slice(1).map((c, i) => c - closes[i])
  const last10 = changes.slice(-10)
  const goingUp = last10.filter(c => c > 0).length / last10.length
  const consistency = score > 50 ? goingUp : 1 - goingUp
  const volFactor = Math.max(0, 1 - avgVol / 150)
  const confidence = Math.min(Math.max(
    (extremeness * 0.4 + consistency * 0.4 + volFactor * 0.2) * 100, 30
  ), 92)

  // Today high/low
  const biasMap: Record<WeatherCondition, number> = {
    strong_bullish: 0.6, bullish: 0.3, neutral: 0.0, bearish: -0.3, strong_bearish: -0.6
  }
  const bias = biasMap[weather.condition]
  const center = current + bias * atrVal
  const todayHigh = center + atrVal * 0.8
  const todayLow = center - atrVal * 0.8

  const trend: 'up' | 'down' | 'sideways' =
    sma20Last > sma50Last && current > sma20Last ? 'up' :
    sma20Last < sma50Last && current < sma20Last ? 'down' : 'sideways'

  const macdSignal: 'bullish' | 'bearish' | 'neutral' =
    macdHist > 0 ? 'bullish' : macdHist < 0 ? 'bearish' : 'neutral'

  return {
    score: Math.round(score * 10) / 10,
    confidence: Math.round(confidence * 10) / 10,
    condition: weather.condition,
    label: weather.label,
    icon: weather.icon,
    rsi: Math.round(rsiVal * 10) / 10,
    macd_signal: macdSignal,
    trend,
    volatility: volLabel,
    support: Math.round(support * 100) / 100,
    resistance: Math.round(resistance * 100) / 100,
    sma_20: Math.round(sma20Last * 100) / 100,
    sma_50: Math.round(sma50Last * 100) / 100,
    ema_12: Math.round(ema12[ema12.length - 1] * 100) / 100,
    ema_26: Math.round(ema26[ema26.length - 1] * 100) / 100,
    atr: Math.round(atrVal * 100) / 100,
    today_high: Math.round(todayHigh * 100) / 100,
    today_low: Math.round(todayLow * 100) / 100,
  }
}

export function runSevenDay(rows: OHLCRow[], baseScore: number): Array<{
  date: string; condition: WeatherCondition; label: string; icon: string
  high: number; low: number; confidence: number; score: number
}> {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  const lastClose = sorted[sorted.length - 1].close
  const atrVal = atr(sorted)

  let score = baseScore
  return Array.from({ length: 7 }, (_, i) => {
    score = score * 0.85 + 50 * 0.15
    const seed = (Math.floor(lastClose) + i) % 100
    const noise = ((seed * 9301 + 49297) % 233280) / 233280 * 6 - 3
    const dayScore = Math.min(Math.max(score + noise, 0), 100)

    const weather = conditionFromScore(dayScore)
    const biasMap: Record<WeatherCondition, number> = {
      strong_bullish: 0.5, bullish: 0.25, neutral: 0.0, bearish: -0.25, strong_bearish: -0.5
    }
    const bias = biasMap[weather.condition]
    const spread = atrVal * (1 + i * 0.06)
    const center = lastClose + bias * atrVal * (i * 0.3)
    const confidence = Math.max(30, 92 - i * 8)

    const date = new Date()
    date.setDate(date.getDate() + i + 1)

    return {
      date: date.toISOString().slice(0, 10),
      condition: weather.condition,
      label: weather.label,
      icon: weather.icon,
      high: Math.round((center + spread) * 100) / 100,
      low: Math.round((center - spread) * 100) / 100,
      confidence,
      score: Math.round(dayScore * 10) / 10,
    }
  })
}
