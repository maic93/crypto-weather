// src/components/cards/MarketMetricsCard.tsx
'use client'
import { formatPrice } from '@/lib/utils'
import type { MarketMetrics } from '@/types'

interface Props {
  metrics: MarketMetrics | null
  isLoading: boolean
}

function MetricRow({ label, value, color = 'text-white/80' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-xs text-white/40 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold font-mono ${color}`}>{value}</span>
    </div>
  )
}

export function MarketMetricsCard({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div className="glass-card px-5 py-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-white/5 rounded mb-2" />
        ))}
      </div>
    )
  }

  const rsiColor = metrics.rsi > 70 ? 'text-rose-300' : metrics.rsi < 30 ? 'text-emerald-300' : 'text-white/80'
  const trendColor = metrics.trend === 'up' ? 'text-emerald-300' : metrics.trend === 'down' ? 'text-rose-300' : 'text-white/80'
  const macdColor = metrics.macd_signal === 'bullish' ? 'text-emerald-300' : metrics.macd_signal === 'bearish' ? 'text-rose-300' : 'text-white/80'
  const volColor = metrics.volatility === 'extreme' ? 'text-rose-300' : metrics.volatility === 'high' ? 'text-orange-300' : 'text-white/80'

  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
          Market Indicators
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <MetricRow label="RSI" value={metrics.rsi.toFixed(1)} color={rsiColor} />
          <MetricRow label="Trend" value={metrics.trend.toUpperCase()} color={trendColor} />
          <MetricRow label="MACD" value={metrics.macd_signal.toUpperCase()} color={macdColor} />
          <MetricRow label="Volatility" value={metrics.volatility.toUpperCase()} color={volColor} />
        </div>
        <div>
          <MetricRow label="SMA 20" value={formatPrice(metrics.sma_20)} />
          <MetricRow label="SMA 50" value={formatPrice(metrics.sma_50)} />
          <MetricRow label="Support" value={formatPrice(metrics.support)} color="text-emerald-300/80" />
          <MetricRow label="Resistance" value={formatPrice(metrics.resistance)} color="text-rose-300/80" />
        </div>
      </div>
    </div>
  )
}
