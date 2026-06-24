// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { WeatherCondition } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatPriceCompact(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`
  if (price >= 1_000) return `$${(price / 1_000).toFixed(1)}K`
  return `$${price.toFixed(2)}`
}

export function formatChange(change: number, showSign = true): string {
  const sign = change >= 0 ? '+' : '-'
  const abs = Math.abs(change).toFixed(2)
  return showSign ? `${sign}${abs}%` : `${abs}%`
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`
  return `$${volume.toLocaleString()}`
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) return `$${(cap / 1_000_000_000_000).toFixed(2)}T`
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(2)}B`
  return `$${(cap / 1_000_000).toFixed(1)}M`
}

export function getConditionGradient(condition: WeatherCondition): string {
  const gradients: Record<WeatherCondition, string> = {
    strong_bullish: 'from-blue-600 via-cyan-500 to-emerald-400',
    bullish: 'from-blue-600 via-blue-500 to-teal-400',
    neutral: 'from-blue-700 via-slate-600 to-slate-500',
    bearish: 'from-indigo-700 via-purple-700 to-rose-600',
    strong_bearish: 'from-purple-900 via-red-800 to-red-600',
  }
  return gradients[condition] ?? gradients.neutral
}

export function getConditionTextColor(condition: WeatherCondition): string {
  const colors: Record<WeatherCondition, string> = {
    strong_bullish: 'text-emerald-300',
    bullish: 'text-teal-300',
    neutral: 'text-slate-300',
    bearish: 'text-rose-300',
    strong_bearish: 'text-red-400',
  }
  return colors[condition] ?? colors.neutral
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-emerald-400'
  if (change < 0) return 'text-rose-400'
  return 'text-slate-400'
}

export function formatDate(dateStr: string, format: 'short' | 'day' | 'full' = 'short'): string {
  const date = new Date(dateStr)
  if (format === 'day') return date.toLocaleDateString('en-US', { weekday: 'short' })
  if (format === 'full') return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
