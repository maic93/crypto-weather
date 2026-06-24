// src/hooks/useWeatherData.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

const STALE_TIME = 60_000 // 1 minute

export function useForecast() {
  return useQuery({
    queryKey: ['forecast'],
    queryFn: api.getForecast,
    staleTime: STALE_TIME,
    refetchInterval: 5 * 60_000,
  })
}

export function useHistory(days = 30) {
  return useQuery({
    queryKey: ['history', days],
    queryFn: () => api.getHistory(days),
    staleTime: STALE_TIME * 5,
  })
}

export function useAccuracy() {
  return useQuery({
    queryKey: ['accuracy'],
    queryFn: api.getAccuracy,
    staleTime: STALE_TIME * 10,
  })
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
    staleTime: STALE_TIME,
    refetchInterval: 5 * 60_000,
  })
}
