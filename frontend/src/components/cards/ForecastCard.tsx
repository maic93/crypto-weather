// frontend/src/components/cards/ForecastCard.tsx
// Hourly forecast strip - shows intraday trend projections
'use client'
import { motion } from 'framer-motion'
import type { WeatherCondition } from '@/types'

interface Props { condition: WeatherCondition; confidence: number }

const HOURS = [
  { label: 'Now',   icon: '⛅', pct: '+2.4', pos: true },
  { label: '3 PM',  icon: '⛅', pct: '+1.8', pos: true },
  { label: '6 PM',  icon: '☁️', pct: '-0.3', pos: false },
  { label: '9 PM',  icon: '🌧️', pct: '-1.2', pos: false },
  { label: '12 AM', icon: '☁️', pct: '-0.8', pos: false },
  { label: '3 AM',  icon: '⛅', pct: '+0.2', pos: true },
]

export function ForecastCard({ confidence }: Props) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display:'flex', gap:6 }}>
        {HOURS.map((h, i) => (
          <motion.div key={h.label}
            style={{
              flex:1, textAlign:'center', borderRadius:12, padding:'8px 4px',
              background: i===0 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)',
              border: i===0 ? '1px solid rgba(251,191,36,0.22)' : '1px solid rgba(255,255,255,0.07)',
            }}
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
            <div style={{ fontSize:9, color: i===0 ? '#fbbf24' : 'rgba(255,255,255,0.35)', marginBottom:5,
              fontWeight: i===0 ? 600 : 400 }}>{h.label}</div>
            <div style={{ fontSize:16, marginBottom:4 }}>{h.icon}</div>
            <div style={{ fontSize:10, fontWeight:600,
              color: h.pos ? '#34d399' : '#f87171',
              fontFamily:'JetBrains Mono,monospace' }}>{h.pct}%</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
