// src/components/cards/SevenDayCard.tsx
'use client'
import { motion } from 'framer-motion'
import { formatPrice, formatDate, getConditionTextColor } from '@/lib/utils'
import type { DayForecast } from '@/types'

const ICONS: Record<string, string> = {
  strong_bullish: '☀️',
  bullish: '⛅',
  neutral: '☁️',
  bearish: '🌧️',
  strong_bearish: '⛈️',
}

interface Props {
  days: DayForecast[]
}

export function SevenDayCard({ days }: Props) {
  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
          7-Day Outlook
        </span>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {days.map((day, i) => {
          const textColor = getConditionTextColor(day.condition)
          const icon = ICONS[day.condition] ?? '☁️'
          const isFirst = i === 0

          return (
            <motion.div
              key={day.date}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Day label */}
              <div className="w-16 text-sm font-medium text-white/70">
                {isFirst ? 'Tomorrow' : formatDate(day.date, 'day')}
              </div>

              {/* Icon + label */}
              <div className="flex items-center gap-2 flex-1 px-2">
                <span className="text-lg">{icon}</span>
                <span className={`text-xs font-medium ${textColor}`}>{day.label}</span>
              </div>

              {/* Low / High */}
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-rose-300/80">{formatPrice(day.low)}</span>
                <span className="text-white/20">–</span>
                <span className="text-emerald-300/80">{formatPrice(day.high)}</span>
              </div>

              {/* Confidence */}
              <div className="w-10 text-right">
                <span className="text-xs text-white/40">{day.confidence}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
