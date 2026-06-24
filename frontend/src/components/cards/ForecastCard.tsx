// src/components/cards/ForecastCard.tsx
'use client'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import type { WeatherCondition } from '@/types'

interface Props {
  high: number
  low: number
  confidence: number
  condition: WeatherCondition
}

export function ForecastCard({ high, low, confidence }: Props) {
  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
          Today's Forecast
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* High */}
        <motion.div
          className="glass-inset rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="text-xs text-white/40 uppercase tracking-wide mb-1">High</div>
          <div className="text-xl font-bold text-emerald-300">{formatPrice(high)}</div>
          <div className="text-2xl mt-1">↑</div>
        </motion.div>

        {/* Low */}
        <motion.div
          className="glass-inset rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Low</div>
          <div className="text-xl font-bold text-rose-300">{formatPrice(low)}</div>
          <div className="text-2xl mt-1">↓</div>
        </motion.div>
      </div>

      {/* Confidence bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white/40 uppercase tracking-wider">Confidence</span>
          <span className="text-xs font-semibold text-white/70">{confidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}
