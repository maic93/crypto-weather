// frontend/src/app/page.tsx
'use client'
import { useForecast, useMetrics } from '@/hooks/useWeatherData'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { HeroCard } from '@/components/cards/HeroCard'
import { ForecastCard } from '@/components/cards/ForecastCard'
import { SevenDayCard } from '@/components/cards/SevenDayCard'
import { MarketMetricsCard } from '@/components/cards/MarketMetricsCard'
import { BottomNav } from '@/components/layout/BottomNav'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ErrorScreen } from '@/components/layout/ErrorScreen'
import { motion } from 'framer-motion'

export default function Home() {
  const forecast = useForecast()
  const metrics = useMetrics()

  if (forecast.isLoading) return <LoadingScreen />
  if (forecast.error || !forecast.data) return <ErrorScreen error={forecast.error?.message} />

  const condition = forecast.data.weather.condition

  return (
    <div style={{ position:'relative', height:'100dvh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <AnimatedBackground condition={condition} />

      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 20px 0', flexShrink:0, position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="rgba(251,191,36,0.15)"/>
            <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fbbf24">₿</text>
          </svg>
          <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em' }}>
            Crypto Weather
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5,
          background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)',
          borderRadius:100, padding:'3px 9px', fontSize:10, fontWeight:600, color:'#34d399' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#34d399',
            animation:'blink 2s ease-in-out infinite' }}/>
          Live
        </div>
      </div>

      {/* Scrollable content area */}
      <div style={{
        flex:1, overflow:'hidden', position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', gap:0,
      }}>
        {/* Hero */}
        <HeroCard forecast={forecast.data} />

        {/* Today's forecast strip */}
        <div style={{ margin:'8px 12px 0', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
            <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)',
              textTransform:'uppercase', letterSpacing:'0.1em' }}>Today&apos;s Forecast</span>
            <span style={{ fontSize:10, color:'#38bdf8' }}>
              {new Date(forecast.data.generated_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
            </span>
          </div>
          <ForecastCard condition={condition} confidence={forecast.data.confidence} />
        </div>

        {/* 7-day */}
        <div style={{ margin:'8px 12px 0', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
            <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)',
              textTransform:'uppercase', letterSpacing:'0.1em' }}>7-Day Outlook</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>Trend-based · not financial advice</span>
          </div>
          <SevenDayCard days={forecast.data.seven_day} />
        </div>

        {/* Market overview */}
        <div style={{ margin:'8px 12px 0', flexShrink:0 }}>
          <div style={{ marginBottom:7 }}>
            <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.3)',
              textTransform:'uppercase', letterSpacing:'0.1em' }}>Market Overview</span>
          </div>
          <MarketMetricsCard metrics={metrics.data ?? null} isLoading={metrics.isLoading} />
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position:'relative', zIndex:1 }}>
        <BottomNav active="today" />
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}
