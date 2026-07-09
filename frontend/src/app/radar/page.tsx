// frontend/src/app/radar/page.tsx
'use client'
import { useState } from 'react'
import { useHistory, useMetrics } from '@/hooks/useWeatherData'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { BottomNav } from '@/components/layout/BottomNav'
import { formatPrice } from '@/lib/utils'
import { COINS } from '@/components/cards/HeroCard'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(10,15,35,0.95)',border:'1px solid rgba(255,255,255,0.1)',
      borderRadius:10,padding:'8px 12px',fontSize:11 }}>
      <div style={{ color:'rgba(255,255,255,0.4)',marginBottom:3 }}>{label}</div>
      <div style={{ color:'#fff',fontWeight:600,fontFamily:'JetBrains Mono,monospace' }}>
        {formatPrice(payload[0].value)}
      </div>
    </div>
  )
}

export default function RadarPage() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin')
  const history = useHistory(30, selectedCoin)
  const metrics = useMetrics(selectedCoin)

  const coin = COINS.find(c => c.id === selectedCoin) ?? COINS[0]
  const chartData = (history.data ?? []).map(d => ({
    label: new Date(d.date).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    price: d.close,
  }))
  const isUp = metrics.data?.trend === 'up'

  return (
    <div style={{ height:'100dvh',width:'100vw',display:'flex',alignItems:'center',justifyContent:'center',background:'#000' }}>
      <div style={{ position:'relative',width:'100%',maxWidth:430,height:'100dvh',maxHeight:932,
        overflow:'hidden',display:'flex',flexDirection:'column',background:'#06091a' }}>
        <AnimatedBackground condition="neutral" />

        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 20px 0',flexShrink:0,position:'relative',zIndex:1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:7 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="rgba(251,191,36,0.15)"/>
              <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fbbf24">₿</text>
            </svg>
            <span style={{ fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.4)',letterSpacing:'0.06em' }}>Radar</span>
          </div>
          <div style={{ display:'flex',gap:4,overflowX:'auto',scrollbarWidth:'none' }}>
            {COINS.map(c => (
              <button key={c.id} onClick={() => setSelectedCoin(c.id)} style={{
                fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:100,cursor:'pointer',flexShrink:0,
                background:selectedCoin===c.id ? c.bg : 'rgba(255,255,255,0.05)',
                border:`1px solid ${selectedCoin===c.id ? c.border : 'rgba(255,255,255,0.1)'}`,
                color:selectedCoin===c.id ? c.color : 'rgba(255,255,255,0.4)',
              }}>{c.symbol}</button>
            ))}
          </div>
        </div>

        <div style={{ flex:1,minHeight:0,overflow:'hidden',position:'relative',zIndex:1,
          padding:'12px 16px 0',display:'flex',flexDirection:'column',gap:10 }}>

          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:18,padding:'16px 12px 12px',flexShrink:0 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:12 }}>
              <span style={{ fontSize:10,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.1em' }}>
                {coin.name} · 30-Day Chart
              </span>
              <span style={{ fontSize:11,fontWeight:600,color:isUp?'#34d399':'#f87171' }}>
                {isUp?'↑':'↓'} {metrics.data?.trend ?? '—'}
              </span>
            </div>
            <div style={{ height:180 }}>
              {history.isLoading ? (
                <div style={{ height:'100%',background:'rgba(255,255,255,0.04)',borderRadius:8 }}/>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top:5,right:5,left:0,bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="label" tick={{ fill:'rgba(255,255,255,0.25)',fontSize:9 }}
                      tickLine={false} axisLine={false} interval="preserveStartEnd"/>
                    <YAxis tick={{ fill:'rgba(255,255,255,0.25)',fontSize:9 }} tickLine={false}
                      axisLine={false} tickFormatter={v => `$${v>=1000?Math.round(v/1000)+'k':v.toFixed(2)}`} width={42}/>
                    <Tooltip content={<CustomTooltip />}/>
                    <Line type="monotone" dataKey="price" stroke={isUp?'#34d399':'#f87171'}
                      strokeWidth={2} dot={false} activeDot={{ r:3 }}/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {metrics.data && (
            <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:18,padding:'16px',flexShrink:0 }}>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>
                Technical Indicators
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                {[
                  { label:'RSI (14)', value:metrics.data.rsi.toFixed(1), color:metrics.data.rsi>70?'#f87171':metrics.data.rsi<30?'#34d399':'#fff' },
                  { label:'MACD', value:metrics.data.macd_signal.toUpperCase(), color:metrics.data.macd_signal==='bullish'?'#34d399':metrics.data.macd_signal==='bearish'?'#f87171':'#94a3b8' },
                  { label:'SMA 20', value:formatPrice(metrics.data.sma_20), color:'#38bdf8' },
                  { label:'SMA 50', value:formatPrice(metrics.data.sma_50), color:'#38bdf8' },
                  { label:'Support', value:formatPrice(metrics.data.support), color:'#34d399' },
                  { label:'Resistance', value:formatPrice(metrics.data.resistance), color:'#f87171' },
                  { label:'EMA 12', value:formatPrice(metrics.data.ema_12), color:'rgba(255,255,255,0.7)' },
                  { label:'EMA 26', value:formatPrice(metrics.data.ema_26), color:'rgba(255,255,255,0.7)' },
                ].map(item => (
                  <div key={item.label} style={{ background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'10px 12px' }}>
                    <div style={{ fontSize:9,color:'rgba(255,255,255,0.28)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:13,fontWeight:600,color:item.color,fontFamily:'JetBrains Mono,monospace' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position:'relative',zIndex:1 }}><BottomNav active="radar"/></div>
      </div>
    </div>
  )
}
