// src/components/cards/HeroCard.tsx
'use client'
import { motion } from 'framer-motion'
import { formatPrice, formatChange, getChangeColor, getConditionTextColor } from '@/lib/utils'
import type { ForecastData } from '@/types'

interface Props {
  forecast: ForecastData
}

const WEATHER_ICONS: Record<string, string> = {
  strong_bullish: '☀️',
  bullish: '⛅',
  neutral: '☁️',
  bearish: '🌧️',
  strong_bearish: '⛈️',
}

export function HeroCard({ forecast }: Props) {
  const { current, weather } = forecast
  const changeColor = getChangeColor(current.change_24h_pct)
  const conditionColor = getConditionTextColor(weather.condition)
  const icon = WEATHER_ICONS[weather.condition] ?? '☁️'

  return (
    <div className="glass-card-strong px-6 py-8 text-center">
      {/* Condition label */}
      <motion.p
        className={`text-sm font-semibold tracking-wide uppercase mb-2 ${conditionColor}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {weather.label}
      </motion.p>

      {/* Giant weather icon */}
      <motion.div
        className="text-7xl my-4 select-none"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.05 }}
      >
        {icon}
      </motion.div>

      {/* Price */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-5xl font-bold text-white tracking-tight mb-2">
          {formatPrice(current.price)}
        </div>

        <div className={`text-lg font-semibold ${changeColor}`}>
          {formatChange(current.change_24h_pct)} today
        </div>
      </motion.div>

      {/* Score & confidence */}
      <motion.div
        className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Score</div>
          <div className="text-base font-bold text-white">{Math.round(weather.score)}</div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Confidence</div>
          <div className="text-base font-bold text-white">{forecast.confidence}%</div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Signal</div>
          <div className={`text-base font-bold ${conditionColor}`}>{icon}</div>
        </div>
      </motion.div>
    </div>
  )
}
