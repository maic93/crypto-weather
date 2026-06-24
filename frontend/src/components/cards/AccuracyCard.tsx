// src/components/cards/AccuracyCard.tsx
'use client'
import { motion } from 'framer-motion'
import type { AccuracyMetrics } from '@/types'

interface Props {
  accuracy: AccuracyMetrics | null
  isLoading: boolean
}

function AccuracyBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-white/40 uppercase tracking-wide">{label}</span>
        <span className="text-xs font-semibold text-white/70">{value.toFixed(1)}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

export function AccuracyCard({ accuracy, isLoading }: Props) {
  if (isLoading || !accuracy) {
    return (
      <div className="glass-card px-5 py-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-6 bg-white/5 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
          30-Day Forecast Accuracy
        </span>
        <span className="text-xs text-white/30">{accuracy.total_forecasts} forecasts</span>
      </div>

      <div className="space-y-4">
        <AccuracyBar
          label="Direction Accuracy"
          value={accuracy.direction_accuracy}
          color="bg-gradient-to-r from-blue-400 to-cyan-300"
        />
        <AccuracyBar
          label="Within Range"
          value={accuracy.within_range_accuracy}
          color="bg-gradient-to-r from-emerald-400 to-teal-300"
        />
        <AccuracyBar
          label="MAPE (lower = better)"
          value={Math.max(0, 100 - accuracy.mean_absolute_pct_error * 5)}
          color="bg-gradient-to-r from-purple-400 to-indigo-300"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{accuracy.direction_accuracy.toFixed(0)}%</div>
          <div className="text-xs text-white/40">Direction hit rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{accuracy.mean_absolute_pct_error.toFixed(1)}%</div>
          <div className="text-xs text-white/40">Avg price error</div>
        </div>
      </div>
    </div>
  )
}
