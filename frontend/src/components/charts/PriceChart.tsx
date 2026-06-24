// src/components/charts/PriceChart.tsx
'use client'
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid
} from 'recharts'
import { formatPrice, formatDate } from '@/lib/utils'
import type { HistoricalDay, DayForecast } from '@/types'

interface Props {
  history: HistoricalDay[]
  forecast: DayForecast[]
  isLoading: boolean
}

interface ChartPoint {
  date: string
  label: string
  close?: number
  forecast?: number
  high?: number
  low?: number
  forecastHigh?: number
  forecastLow?: number
  isForecast: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <div className="text-white/50 mb-1">{label}</div>
      {payload.map((p) => (
        p.value && (
          <div key={p.dataKey} style={{ color: p.color }} className="font-mono font-semibold">
            {formatPrice(p.value)}
          </div>
        )
      ))}
    </div>
  )
}

export function PriceChart({ history, forecast, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="glass-card px-5 py-4">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4 animate-pulse" />
        <div className="h-48 bg-white/5 rounded animate-pulse" />
      </div>
    )
  }

  // Build unified timeline
  const historyPoints: ChartPoint[] = history.map(d => ({
    date: d.date,
    label: formatDate(d.date, 'short'),
    close: d.close,
    high: d.high,
    low: d.low,
    isForecast: false,
  }))

  // Bridge: last history point repeated as start of forecast
  const lastHistory = history[history.length - 1]

  const forecastPoints: ChartPoint[] = forecast.map((d, i) => ({
    date: d.date,
    label: formatDate(d.date, 'short'),
    forecast: i === 0 && lastHistory ? lastHistory.close : (d.high + d.low) / 2,
    forecastHigh: d.high,
    forecastLow: d.low,
    isForecast: true,
  }))

  // Add bridge point
  if (lastHistory) {
    forecastPoints[0] = {
      ...forecastPoints[0],
      forecast: lastHistory.close,
    }
  }

  const data = [...historyPoints, ...forecastPoints]
  const today = lastHistory?.date ? formatDate(lastHistory.date, 'short') : ''

  // Y-axis domain
  const allValues = data.flatMap(d => [d.close, d.forecast, d.high, d.low, d.forecastHigh, d.forecastLow].filter(Boolean) as number[])
  const minVal = Math.min(...allValues) * 0.97
  const maxVal = Math.max(...allValues) * 1.03

  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
          Price History + Outlook
        </span>
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <span className="inline-block w-5 h-0.5 bg-blue-400 rounded" /> Actual
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-5 h-0.5 bg-dashed bg-cyan-400 rounded border-t border-dashed border-cyan-400" /> Forecast
          </span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minVal, maxVal]}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${Math.round(v / 1000)}k`}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            {today && (
              <ReferenceLine
                x={today}
                stroke="rgba(255,255,255,0.2)"
                strokeDasharray="4 4"
                label={{ value: 'TODAY', fill: 'rgba(255,255,255,0.3)', fontSize: 9, position: 'top' }}
              />
            )}
            {/* Historical area */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#histGrad)"
              dot={false}
              activeDot={{ r: 3, fill: '#3b82f6', stroke: '#0a0f1e', strokeWidth: 2 }}
              connectNulls={false}
            />
            {/* Forecast line dashed */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 3, fill: '#06b6d4' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
