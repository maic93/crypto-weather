// frontend/src/hooks/useWeatherData.ts
'use client'
import { useQuery } from '@tanstack/react-query'

const STALE_TIME = 60_000

async function fetchJSON(path: string) {
  const res = await fetch(path, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export function useForecast(coinId = 'bitcoin') {
  return useQuery({
    queryKey: ['forecast', coinId],
    queryFn: () => fetchJSON(`/api/forecast?coin=${coinId}`),
    staleTime: STALE_TIME,
    refetchInterval: 5 * 60_000,
  })
}

export function useHistory(days = 30, coinId = 'bitcoin') {
  return useQuery({
    queryKey: ['history', days, coinId],
    queryFn: () => fetchJSON(`/api/history?days=${days}&coin=${coinId}`),
    staleTime: STALE_TIME * 5,
  })
}

export function useAccuracy() {
  return useQuery({
    queryKey: ['accuracy'],
    queryFn: () => fetchJSON('/api/accuracy'),
    staleTime: STALE_TIME * 10,
  })
}

export function useMetrics(coinId = 'bitcoin') {
  return useQuery({
    queryKey: ['metrics', coinId],
    queryFn: () => fetchJSON(`/api/metrics?coin=${coinId}`),
    staleTime: STALE_TIME,
    refetchInterval: 5 * 60_000,
  })
}
