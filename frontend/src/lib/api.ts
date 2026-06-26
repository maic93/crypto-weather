// src/lib/api.ts
import type { ForecastData, HistoricalDay, AccuracyMetrics, CurrentPrice, MarketMetrics } from '@/types'

// On Vercel: frontend and backend are on the same domain, so /api/* works directly.
// Locally: point to http://localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }
  return res.json()
}

export const api = {
  getCurrent: () => fetchAPI<CurrentPrice>('/api/current'),
  getForecast: () => fetchAPI<ForecastData>('/api/forecast'),
  getHistory: (days = 30) => fetchAPI<HistoricalDay[]>(`/api/history?days=${days}`),
  getAccuracy: () => fetchAPI<AccuracyMetrics>('/api/accuracy'),
  getMetrics: () => fetchAPI<MarketMetrics>('/api/metrics'),
  getHealth: () => fetchAPI<{ status: string; version: string }>('/api/health'),
}
