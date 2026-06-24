// src/types/index.ts

export type WeatherCondition =
  | 'strong_bullish'
  | 'bullish'
  | 'neutral'
  | 'bearish'
  | 'strong_bearish'

export interface WeatherState {
  condition: WeatherCondition
  label: string
  icon: string
  score: number
}

export interface CurrentPrice {
  price: number
  change_24h: number
  change_24h_pct: number
  market_cap: number
  volume_24h: number
  last_updated: string
}

export interface DayForecast {
  date: string
  condition: WeatherCondition
  label: string
  icon: string
  high: number
  low: number
  confidence: number
  score: number
}

export interface ForecastData {
  current: CurrentPrice
  weather: WeatherState
  today_high: number
  today_low: number
  confidence: number
  seven_day: DayForecast[]
  generated_at: string
}

export interface HistoricalDay {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  change_pct: number
}

export interface AccuracyMetrics {
  period_days: number
  mean_absolute_error: number
  mean_absolute_pct_error: number
  direction_accuracy: number
  within_range_accuracy: number
  total_forecasts: number
}

export interface MarketMetrics {
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
}
