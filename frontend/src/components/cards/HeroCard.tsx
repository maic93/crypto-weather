// frontend/src/components/cards/HeroCard.tsx
'use client'
import { motion } from 'framer-motion'
import { WeatherIcon } from '@/components/ui/WeatherIcon'
import { formatPrice, formatChange, getChangeColorHex } from '@/lib/utils'
import type { ForecastData } from '@/types'

const CONDITION_LABELS: Record<string, string> = {
  strong_bullish: 'Strong Bullish', bullish: 'Bullish',
  neutral: 'Neutral', bearish: 'Bearish', strong_bearish: 'Strong Bearish',
}
const CONDITION_COLORS: Record<string, string> = {
  strong_bullish: '#34d399', bullish: '#fbbf24',
  neutral: '#94a3b8', bearish: '#f87171', strong_bearish: '#ef4444',
}
const SUBTITLES: Record<string, string> = {
  strong_bullish: 'Very high buying pressure',
  bullish: 'High buying pressure expected',
  neutral: 'Market in equilibrium',
  bearish: 'Selling pressure dominant',
  strong_bearish: 'Very high selling pressure',
}

interface Props { forecast: ForecastData }

export function HeroCard({ forecast }: Props) {
  const { current, weather } = forecast
  const changeColor = getChangeColorHex(current.change_24h_pct)
  const condColor = CONDITION_COLORS[weather.condition] ?? '#94a3b8'
  const arrow = current.change_24h_pct > 0 ? '▲' : current.change_24h_pct < 0 ? '▼' : '–'

  return (
    <div style={{
      background: 'linear-gradient(150deg,#0e1535 0%,#07102a 60%,#060d20 100%)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22,
      padding: '14px 18px 12px', position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:1,
        background:`linear-gradient(90deg,transparent,${condColor}66,rgba(56,189,248,0.3),transparent)` }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ display:'flex',alignItems:'center',gap:5,
          background:'rgba(247,147,26,0.1)',border:'1px solid rgba(247,147,26,0.18)',
          borderRadius:100,padding:'4px 10px 4px 6px' }}>
          <div style={{ width:18,height:18,borderRadius:'50%',
            background:'linear-gradient(135deg,#f7931a,#e8830f)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:9,fontWeight:800,color:'#fff' }}>₿</div>
          <span style={{ fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.65)' }}>Bitcoin · BTC/USD</span>
        </div>
        <motion.div initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }}
          transition={{ type:'spring',stiffness:200,damping:15 }}>
          <WeatherIcon condition={weather.condition} size={72} />
        </motion.div>
      </div>

      <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between' }}>
        {/* Price as weather-style temperature: $59,209 -> 59°209 */}
        <motion.div style={{ fontSize:52, fontWeight:200, color:'#fff', lineHeight:1, letterSpacing:'-0.03em', display:'flex', alignItems:'flex-start' }}
          initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          {Math.floor(current.price / 1000)}
          <span style={{ fontSize:18,color:'rgba(255,255,255,0.22)',fontWeight:200,marginTop:1 }}>°</span>
          <span style={{ fontSize:30,fontWeight:300,marginLeft:2 }}>{String(Math.round(current.price % 1000)).padStart(3,'0')}</span>
        </motion.div>

        {/* Condition + score on the right */}
        <motion.div style={{ textAlign:'right' }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <div style={{ fontSize:19, fontWeight:700, color:condColor }}>{CONDITION_LABELS[weather.condition]}</div>
          <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{SUBTITLES[weather.condition]}</div>
          <div style={{ fontSize:19, fontWeight:700, color:'#fff', marginTop:6, fontFamily:'JetBrains Mono,monospace', letterSpacing:'-0.01em' }}>
            {formatPrice(current.price)}
          </div>
          <div style={{ fontSize:12, fontWeight:600, color:changeColor, fontFamily:'JetBrains Mono,monospace', marginTop:1 }}>
            {arrow} {formatChange(current.change_24h_pct)} today
          </div>
        </motion.div>
      </div>

      <div style={{ display:'flex',borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:10,marginTop:10 }}>
        {[
          { label:'Confidence', value:`${forecast.confidence}%`, color:'#38bdf8' },
          { label:'Score', value:`${Math.round(weather.score)}/100`, color:'#fbbf24' },
          { label:'Volatility', value:'Medium', color:'#fff' },
          { label:'Trend', value:'↑ Up', color:'#34d399' },
        ].map((s,i) => (
          <div key={s.label} style={{ flex:1,textAlign:'center',borderLeft:i>0?'1px solid rgba(255,255,255,0.07)':'none' }}>
            <div style={{ fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.28)',marginBottom:2 }}>{s.label}</div>
            <div style={{ fontSize:12,fontWeight:600,color:s.color,fontFamily:'JetBrains Mono,monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
