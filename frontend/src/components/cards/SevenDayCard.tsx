// frontend/src/components/cards/SevenDayCard.tsx
'use client'
import { motion } from 'framer-motion'
import type { DayForecast } from '@/types'

const ICONS: Record<string, string> = {
  strong_bullish: '☀️', bullish: '⛅', neutral: '☁️', bearish: '🌧️', strong_bearish: '⛈️',
}
const COLORS: Record<string, string> = {
  strong_bullish: '#34d399', bullish: '#fbbf24', neutral: '#94a3b8', bearish: '#f87171', strong_bearish: '#ef4444',
}

interface Props { days: DayForecast[] }

export function SevenDayCard({ days }: Props) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, overflow: 'hidden', flexShrink: 0,
    }}>
      {days.map((day, i) => {
        const date = new Date(day.date)
        const label = i === 0 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' })
        const pct = ((day.high - day.low) / day.low * 100 * 0.4).toFixed(1)
        const isPos = day.score > 50
        return (
          <motion.div key={day.date}
            style={{ display:'flex', alignItems:'center', padding:'7px 14px',
              borderBottom: i < days.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}>
            <span style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.55)', width:52 }}>{label}</span>
            <span style={{ fontSize:14, width:22, textAlign:'center' }}>{ICONS[day.condition]}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.32)', flex:1, paddingLeft:5 }}>{day.label}</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginRight:8, fontFamily:'JetBrains Mono,monospace' }}>
              ${Math.round(day.low/1000)}k–${Math.round(day.high/1000)}k
            </span>
            <span style={{ fontSize:11, fontWeight:600, minWidth:40, textAlign:'right',
              color: isPos ? '#34d399' : '#f87171', fontFamily:'JetBrains Mono,monospace' }}>
              {isPos ? '+' : ''}{pct}%
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
