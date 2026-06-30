// frontend/src/components/cards/MarketMetricsCard.tsx
'use client'
import type { MarketMetrics } from '@/types'
import { formatPrice } from '@/lib/utils'

interface Props { metrics: MarketMetrics | null; isLoading: boolean }

export function MarketMetricsCard({ metrics, isLoading }: Props) {
  if (isLoading || !metrics) {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height:80, borderRadius:14, background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.07)', animation:'pulse 1.5s ease-in-out infinite' }}/>
        ))}
      </div>
    )
  }

  const rsiColor = metrics.rsi > 70 ? '#f87171' : metrics.rsi < 30 ? '#34d399' : '#fff'
  const macdColor = metrics.macd_signal === 'bullish' ? '#34d399' : metrics.macd_signal === 'bearish' ? '#f87171' : '#94a3b8'
  const trendColor = metrics.trend === 'up' ? '#34d399' : metrics.trend === 'down' ? '#f87171' : '#94a3b8'
  const trendArrow = metrics.trend === 'up' ? '↑' : metrics.trend === 'down' ? '↓' : '→'

  const cards = [
    {
      title: 'Fear & Greed', badge: { text: 'Greed', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
      content: <><div style={{ fontSize:24,fontWeight:700,color:'#fbbf24',lineHeight:1 }}>74</div>
        <div style={{ height:4,background:'rgba(255,255,255,0.07)',borderRadius:2,margin:'7px 0 4px',overflow:'hidden' }}>
          <div style={{ height:'100%',borderRadius:2,width:'74%',background:'linear-gradient(90deg,#ef4444 0%,#fbbf24 50%,#34d399 100%)' }}/></div>
        <div style={{ fontSize:10,color:'rgba(255,255,255,0.25)' }}>Yesterday: 69</div></>
    },
    {
      title: 'Pressure', badge: { text: 'High', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
      content: <><div style={{ fontSize:16,fontWeight:600,color:'#34d399',marginTop:2 }}>Buying</div>
        <div style={{ fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:6 }}>RSI {metrics.rsi.toFixed(0)} · MACD {metrics.macd_signal}</div>
        <div style={{ fontSize:10,color:'rgba(255,255,255,0.25)',marginTop:2 }}>SMA20 {formatPrice(metrics.sma_20)}</div></>
    },
    {
      title: 'Dominance', badge: null,
      content: <>
        {[['BTC','52.1','#f7931a',52],['ETH','17.4','#627eea',17],['Other','30.5','rgba(255,255,255,0.2)',31]].map(([n,p,c,w]) => (
          <div key={String(n)} style={{ display:'flex',alignItems:'center',gap:6,marginBottom:4 }}>
            <span style={{ fontSize:10,color:'rgba(255,255,255,0.5)',width:28 }}>{n}</span>
            <div style={{ flex:1,height:3,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden' }}>
              <div style={{ height:'100%',borderRadius:2,width:`${w}%`,background:String(c) }}/></div>
            <span style={{ fontSize:10,fontWeight:600,color:'rgba(255,255,255,0.5)',width:34,textAlign:'right' }}>{p}%</span>
          </div>
        ))}
      </>
    },
    {
      title: '24h Volume', badge: null,
      content: <>
        <div style={{ display:'flex',alignItems:'flex-end',gap:2,height:26,margin:'4px 0' }}>
          {[40,55,38,72,60,82,100].map((h,i) => (
            <div key={i} style={{ flex:1,height:`${h}%`,borderRadius:2,
              background:i===6?'#38bdf8':'rgba(56,189,248,0.2)' }}/>
          ))}
        </div>
        <div style={{ fontSize:15,fontWeight:700,color:'#fff' }}>$128.6B</div>
        <div style={{ fontSize:10,color:'#34d399' }}>+12.4% vs yesterday</div>
      </>
    },
  ]

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
      {cards.map(card => (
        <div key={card.title} style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:14, padding:'11px 12px',
        }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
            <span style={{ fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(255,255,255,0.28)' }}>{card.title}</span>
            {card.badge && (
              <span style={{ fontSize:9,padding:'1px 6px',borderRadius:100,fontWeight:600,
                color:card.badge.color,background:card.badge.bg,
                border:`1px solid ${card.badge.color}33` }}>{card.badge.text}</span>
            )}
          </div>
          {card.content}
        </div>
      ))}
    </div>
  )
}
