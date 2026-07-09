// frontend/src/components/cards/HeroCard.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export const COINS = [
  { id:'bitcoin',     symbol:'BTC', name:'Bitcoin',  icon:'₿', color:'#f7931a', bg:'rgba(247,147,26,0.1)',  border:'rgba(247,147,26,0.18)' },
  { id:'ethereum',    symbol:'ETH', name:'Ethereum', icon:'Ξ', color:'#627eea', bg:'rgba(98,126,234,0.1)', border:'rgba(98,126,234,0.2)'  },
  { id:'solana',      symbol:'SOL', name:'Solana',   icon:'◎', color:'#9945ff', bg:'rgba(153,69,255,0.1)', border:'rgba(153,69,255,0.2)'  },
  { id:'cardano',     symbol:'ADA', name:'Cardano',  icon:'₳', color:'#0033ad', bg:'rgba(0,51,173,0.15)',  border:'rgba(0,51,173,0.25)'   },
  { id:'binancecoin', symbol:'BNB', name:'BNB',      icon:'B', color:'#f3ba2f', bg:'rgba(243,186,47,0.1)', border:'rgba(243,186,47,0.2)'  },
  { id:'ripple',      symbol:'XRP', name:'XRP',      icon:'X', color:'#00aae4', bg:'rgba(0,170,228,0.1)', border:'rgba(0,170,228,0.2)'   },
]

interface Props {
  forecast: ForecastData
  selectedCoin?: string
  onCoinChange?: (coinId: string) => void
}

export function HeroCard({ forecast, selectedCoin = 'bitcoin', onCoinChange }: Props) {
  const { current, weather } = forecast
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  const coin = COINS.find(c => c.id === selectedCoin) ?? COINS[0]
  const changeColor = getChangeColorHex(current.change_24h_pct)
  const condColor = CONDITION_COLORS[weather.condition] ?? '#94a3b8'
  const arrow = current.change_24h_pct > 0 ? '▲' : current.change_24h_pct < 0 ? '▼' : '–'
  const thousands = Math.floor(current.price / 1000)
  const remainder = String(Math.round(current.price % 1000)).padStart(3, '0')
  const isSmallPrice = current.price < 1000

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{
      background:'linear-gradient(150deg,#0e1535 0%,#07102a 60%,#060d20 100%)',
      border:'1px solid rgba(255,255,255,0.09)',borderRadius:22,
      padding:'14px 18px 12px',position:'relative',overflow:'visible',flexShrink:0,
    }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:1,borderRadius:'22px 22px 0 0',
        background:`linear-gradient(90deg,transparent,${condColor}66,rgba(56,189,248,0.3),transparent)` }}/>

      {/* Coin selector + weather icon */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
        <div ref={dropRef} style={{ position:'relative' }}>
          <div onClick={() => setDropOpen(o => !o)} style={{
            display:'flex',alignItems:'center',gap:5,cursor:'pointer',
            background:coin.bg,border:`1px solid ${coin.border}`,
            borderRadius:100,padding:'4px 10px 4px 6px',transition:'all 0.2s',
          }}>
            <div style={{ width:18,height:18,borderRadius:'50%',
              background:`linear-gradient(135deg,${coin.color},${coin.color}cc)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:9,fontWeight:800,color:'#fff' }}>{coin.icon}</div>
            <span style={{ fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.65)' }}>
              {coin.name} · {coin.symbol}/USD
            </span>
            <span style={{ fontSize:9,color:'rgba(255,255,255,0.35)',marginLeft:2 }}>
              {dropOpen?'▲':'▼'}
            </span>
          </div>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity:0,y:-8,scale:0.95 }}
                animate={{ opacity:1,y:0,scale:1 }}
                exit={{ opacity:0,y:-8,scale:0.95 }}
                transition={{ duration:0.15 }}
                style={{ position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:100,
                  background:'rgba(8,14,35,0.98)',border:'1px solid rgba(255,255,255,0.12)',
                  borderRadius:14,overflow:'hidden',minWidth:180,
                  boxShadow:'0 16px 40px rgba(0,0,0,0.6)',backdropFilter:'blur(20px)',
                }}>
                {COINS.map(c => (
                  <div key={c.id}
                    onClick={() => { onCoinChange?.(c.id); setDropOpen(false) }}
                    style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',
                      cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.05)',
                      background:c.id===selectedCoin?'rgba(255,255,255,0.06)':'transparent',
                    }}>
                    <div style={{ width:26,height:26,borderRadius:'50%',
                      background:`linear-gradient(135deg,${c.color},${c.color}aa)`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:12,fontWeight:800,color:'#fff',flexShrink:0 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize:12,fontWeight:600,color:'#fff' }}>{c.name}</div>
                      <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)' }}>{c.symbol}/USD</div>
                    </div>
                    {c.id===selectedCoin && <div style={{ marginLeft:'auto',color:'#fbbf24',fontSize:12 }}>✓</div>}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }}
          transition={{ type:'spring',stiffness:200,damping:15 }}>
          <WeatherIcon condition={weather.condition} size={72}/>
        </motion.div>
      </div>

      {/* Price + condition */}
      <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between' }}>
        <motion.div style={{ display:'flex',flexDirection:'column' }}
          initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          {isSmallPrice ? (
            <div style={{ fontSize:52,fontWeight:200,color:'#fff',lineHeight:1,letterSpacing:'-0.03em' }}>
              {current.price.toFixed(2)}
            </div>
          ) : (
            <div style={{ display:'flex',alignItems:'flex-start',lineHeight:1 }}>
              <span style={{ fontSize:56,fontWeight:200,color:'#fff',letterSpacing:'-0.03em' }}>{thousands}</span>
              <span style={{ fontSize:20,color:'rgba(255,255,255,0.22)',fontWeight:200,marginTop:3 }}>°</span>
              <span style={{ fontSize:32,fontWeight:300,color:'rgba(255,255,255,0.65)',marginLeft:2,marginTop:14 }}>{remainder}</span>
            </div>
          )}
          <div style={{ fontSize:16,fontWeight:700,color:'#fff',marginTop:5,fontFamily:'JetBrains Mono,monospace' }}>
            {formatPrice(current.price)}
          </div>
          <div style={{ fontSize:12,fontWeight:600,color:changeColor,fontFamily:'JetBrains Mono,monospace',marginTop:1 }}>
            {arrow} {formatChange(current.change_24h_pct)} today
          </div>
        </motion.div>

        <motion.div style={{ textAlign:'right' }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <div style={{ fontSize:19,fontWeight:700,color:condColor }}>{CONDITION_LABELS[weather.condition]}</div>
          <div style={{ fontSize:10.5,color:'rgba(255,255,255,0.35)',marginTop:1 }}>{SUBTITLES[weather.condition]}</div>
        </motion.div>
      </div>

      {/* Stats */}
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
