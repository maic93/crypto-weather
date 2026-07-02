// frontend/src/app/news/page.tsx
'use client'
import { useForecast } from '@/hooks/useWeatherData'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { BottomNav } from '@/components/layout/BottomNav'

const NEWS_ITEMS = [
  {
    category: 'Market', time: '2h ago',
    title: 'Bitcoin Tests Key Support Level Amid Market Uncertainty',
    summary: 'BTC consolidates near $59k as traders watch macro data.',
    sentiment: 'neutral', icon: '📊',
  },
  {
    category: 'Adoption', time: '4h ago',
    title: 'Major Bank Announces Bitcoin Custody Services for Institutions',
    summary: 'Another traditional finance player enters the crypto space.',
    sentiment: 'bullish', icon: '🏦',
  },
  {
    category: 'On-chain', time: '6h ago',
    title: 'Bitcoin Long-Term Holders Accumulate at Current Prices',
    summary: 'Whale wallets show net inflows for the third consecutive week.',
    sentiment: 'bullish', icon: '🐋',
  },
  {
    category: 'Macro', time: '8h ago',
    title: 'Fed Minutes Signal Cautious Rate Path Ahead',
    summary: 'Risk assets mixed as investors await inflation data.',
    sentiment: 'neutral', icon: '🏛️',
  },
  {
    category: 'Regulation', time: '12h ago',
    title: 'EU Finalises MiCA Implementation Timeline for Exchanges',
    summary: 'Crypto firms have 18 months to comply with new framework.',
    sentiment: 'neutral', icon: '📋',
  },
  {
    category: 'Mining', time: '1d ago',
    title: 'Bitcoin Hash Rate Hits All-Time High',
    summary: 'Network security at record levels despite price consolidation.',
    sentiment: 'bullish', icon: '⛏️',
  },
]

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: '#34d399', bearish: '#f87171', neutral: '#94a3b8',
}

export default function NewsPage() {
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
            <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em' }}>News</span>
          </div>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Crypto Weather Digest</span>
        </div>

        {/* Scrollable news list */}
        <div style={{ flex:1, minHeight:0, overflowY:'auto', position:'relative', zIndex:1,
          padding:'12px 16px 0', scrollbarWidth:'none' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8, paddingBottom:16 }}>
            {NEWS_ITEMS.map((item, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'14px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:14 }}>{item.icon}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)',
                      textTransform:'uppercase', letterSpacing:'0.08em' }}>{item.category}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:10, padding:'2px 7px', borderRadius:100, fontWeight:600,
                      color: SENTIMENT_COLORS[item.sentiment],
                      background: SENTIMENT_COLORS[item.sentiment] + '18',
                      border: `1px solid ${SENTIMENT_COLORS[item.sentiment]}33` }}>
                      {item.sentiment}
                    </div>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>{item.time}</span>
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.4, marginBottom:5 }}>
                  {item.title}
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
                  {item.summary}
                </div>
              </div>
            ))}

            <div style={{ textAlign:'center', padding:'12px 0', fontSize:11, color:'rgba(255,255,255,0.2)' }}>
              Live news feed coming soon · Data from CoinGecko
            </div>
          </div>
        </div>

        <div style={{ position:'relative', zIndex:1 }}><BottomNav active="news" /></div>
      </div>
    </div>
  )
}
