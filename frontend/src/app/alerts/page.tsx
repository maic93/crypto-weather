// frontend/src/app/alerts/page.tsx
'use client'
import { useForecast } from '@/hooks/useWeatherData'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { BottomNav } from '@/components/layout/BottomNav'
import { formatPrice } from '@/lib/utils'

const PRESET_ALERTS = [
  { icon: '📈', label: 'Price above', value: '$70,000', active: false, color: '#34d399' },
  { icon: '📉', label: 'Price below', value: '$50,000', active: false, color: '#f87171' },
  { icon: '⚡', label: 'RSI overbought', value: 'RSI > 70', active: true, color: '#fbbf24' },
  { icon: '⚡', label: 'RSI oversold', value: 'RSI < 30', active: true, color: '#fbbf24' },
  { icon: '⛈️', label: 'Strong Bearish signal', value: 'Score < 25', active: true, color: '#f87171' },
  { icon: '☀️', label: 'Strong Bullish signal', value: 'Score > 90', active: true, color: '#34d399' },
]

export default function AlertsPage() {
  const forecast = useForecast()
  const condition = forecast.data?.weather.condition ?? 'neutral'

  return (
    <div style={{ height:'100dvh', width:'100vw', display:'flex', alignItems:'center', justifyContent:'center', background:'#000' }}>
      <div style={{ position:'relative', width:'100%', maxWidth:430, height:'100dvh', maxHeight:932,
        overflow:'hidden', display:'flex', flexDirection:'column', background:'#06091a' }}>
        <AnimatedBackground condition={condition} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px 0', flexShrink:0, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="rgba(251,191,36,0.15)"/>
              <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fbbf24">₿</text>
            </svg>
            <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em' }}>Alerts</span>
          </div>
        </div>

        <div style={{ flex:1, minHeight:0, overflow:'hidden', position:'relative', zIndex:1, padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:10 }}>

          {/* Current status */}
          {forecast.data && (
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'16px', flexShrink:0 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Current Status</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{formatPrice(forecast.data.current.price)}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>
                    Score: {Math.round(forecast.data.weather.score)}/100 · {forecast.data.weather.label}
                  </div>
                </div>
                <div style={{ fontSize:36 }}>{forecast.data.weather.icon}</div>
              </div>
            </div>
          )}

          {/* Alert rules */}
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:'16px', flexShrink:0 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Alert Conditions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {PRESET_ALERTS.map((alert, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', padding:'11px 12px',
                  background:'rgba(255,255,255,0.03)', borderRadius:12, gap:12 }}>
                  <span style={{ fontSize:18 }}>{alert.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.7)' }}>{alert.label}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{alert.value}</div>
                  </div>
                  <div style={{
                    width:36, height:20, borderRadius:10, position:'relative', cursor:'pointer',
                    background: alert.active ? alert.color + '33' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${alert.active ? alert.color : 'rgba(255,255,255,0.15)'}`,
                  }}>
                    <div style={{
                      position:'absolute', top:2, width:14, height:14, borderRadius:'50%',
                      background: alert.active ? alert.color : 'rgba(255,255,255,0.3)',
                      left: alert.active ? 18 : 2,
                      transition:'left 0.2s',
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)',
            borderRadius:14, padding:'12px 14px', flexShrink:0 }}>
            <div style={{ fontSize:11, color:'rgba(251,191,36,0.8)' }}>
              🔔 Push notifications coming soon. Currently alerts are for display only.
            </div>
          </div>
        </div>

        <div style={{ position:'relative', zIndex:1 }}><BottomNav active="alerts" /></div>
      </div>
    </div>
  )
}
