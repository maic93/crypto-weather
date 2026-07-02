// frontend/src/app/markets/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { BottomNav } from '@/components/layout/BottomNav'

interface CoinData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume: number
  icon: string
}

function formatNum(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(2)}`
}

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(5)}`
}

const COIN_ICONS: Record<string, string> = {
  bitcoin: '₿', ethereum: 'Ξ', solana: '◎', cardano: '₳',
  'binancecoin': 'BNB', ripple: 'XRP',
}

const COIN_COLORS: Record<string, string> = {
  bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff',
  cardano: '#0033ad', binancecoin: '#f3ba2f', ripple: '#00aae4',
}

export default function MarketsPage() {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'marketCap' | 'change24h'>('marketCap')

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,binancecoin,ripple&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',
          { next: { revalidate: 60 } }
        )
        const data = await res.json()
        const ids = ['bitcoin', 'ethereum', 'solana', 'cardano', 'binancecoin', 'ripple']
        const names: Record<string, string> = {
          bitcoin: 'Bitcoin', ethereum: 'Ethereum', solana: 'Solana',
          cardano: 'Cardano', binancecoin: 'BNB', ripple: 'XRP',
        }
        const symbols: Record<string, string> = {
          bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL',
          cardano: 'ADA', binancecoin: 'BNB', ripple: 'XRP',
        }
        setCoins(ids.filter(id => data[id]).map(id => ({
          id,
          symbol: symbols[id],
          name: names[id],
          price: data[id].usd,
          change24h: data[id].usd_24h_change ?? 0,
          marketCap: data[id].usd_market_cap ?? 0,
          volume: data[id].usd_24h_vol ?? 0,
          icon: COIN_ICONS[id] ?? '●',
        })))
      } catch {
        // fallback static data
        setCoins([
          { id:'bitcoin', symbol:'BTC', name:'Bitcoin', price:59000, change24h:-1.2, marketCap:1.16e12, volume:28e9, icon:'₿' },
          { id:'ethereum', symbol:'ETH', name:'Ethereum', price:3100, change24h:-0.8, marketCap:373e9, volume:14e9, icon:'Ξ' },
          { id:'solana', symbol:'SOL', name:'Solana', price:145, change24h:2.1, marketCap:67e9, volume:3.2e9, icon:'◎' },
          { id:'cardano', symbol:'ADA', name:'Cardano', price:0.45, change24h:-0.5, marketCap:16e9, volume:420e6, icon:'₳' },
          { id:'binancecoin', symbol:'BNB', name:'BNB', price:580, change24h:0.3, marketCap:84e9, volume:1.8e9, icon:'B' },
          { id:'ripple', symbol:'XRP', name:'XRP', price:0.52, change24h:1.4, marketCap:29e9, volume:1.1e9, icon:'X' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchCoins()
  }, [])

  const sorted = [...coins].sort((a, b) =>
    sortBy === 'marketCap' ? b.marketCap - a.marketCap : b.change24h - a.change24h
  )

  return (
    <div style={{ height:'100dvh', width:'100vw', display:'flex', alignItems:'center', justifyContent:'center', background:'#000' }}>
      <div style={{ position:'relative', width:'100%', maxWidth:430, height:'100dvh', maxHeight:932,
        overflow:'hidden', display:'flex', flexDirection:'column', background:'#06091a' }}>
        <AnimatedBackground condition="neutral" />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px 0', flexShrink:0, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="rgba(251,191,36,0.15)"/>
              <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fbbf24">₿</text>
            </svg>
            <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em' }}>Markets</span>
          </div>
          {/* Sort toggle */}
          <div style={{ display:'flex', gap:4 }}>
            {(['marketCap', 'change24h'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:100, cursor:'pointer',
                background: sortBy===s ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${sortBy===s ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: sortBy===s ? '#fbbf24' : 'rgba(255,255,255,0.4)',
              }}>
                {s === 'marketCap' ? 'Market Cap' : '24h Change'}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display:'flex', padding:'12px 16px 6px', flexShrink:0, position:'relative', zIndex:1 }}>
          <span style={{ flex:1, fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Asset</span>
          <span style={{ width:80, fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'right' }}>Price</span>
          <span style={{ width:56, fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'right' }}>24h</span>
          <span style={{ width:72, fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'right' }}>Mkt Cap</span>
        </div>

        {/* Coin list */}
        <div style={{ flex:1, minHeight:0, overflowY:'auto', position:'relative', zIndex:1,
          padding:'0 16px', scrollbarWidth:'none' }}>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ height:64, borderRadius:14, background:'rgba(255,255,255,0.04)',
                  animation:'pulse 1.5s ease-in-out infinite' }}/>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6, paddingBottom:16 }}>
              {sorted.map((coin, i) => {
                const color = COIN_COLORS[coin.id] ?? '#94a3b8'
                const changeColor = coin.change24h > 0 ? '#34d399' : coin.change24h < 0 ? '#f87171' : '#94a3b8'
                return (
                  <div key={coin.id} style={{ display:'flex', alignItems:'center',
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:14, padding:'12px 14px', gap:10 }}>
                    {/* Rank + icon */}
                    <div style={{ width:20, fontSize:10, color:'rgba(255,255,255,0.25)', flexShrink:0 }}>{i+1}</div>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:color+'22',
                      border:`1px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, fontWeight:700, color, flexShrink:0 }}>
                      {coin.icon}
                    </div>
                    {/* Name */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{coin.name}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{coin.symbol}</div>
                    </div>
                    {/* Price */}
                    <div style={{ width:80, textAlign:'right' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:'JetBrains Mono,monospace' }}>
                        {formatPrice(coin.price)}
                      </div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>
                        Vol {formatNum(coin.volume)}
                      </div>
                    </div>
                    {/* 24h change */}
                    <div style={{ width:56, textAlign:'right' }}>
                      <div style={{ fontSize:12, fontWeight:600, color:changeColor, fontFamily:'JetBrains Mono,monospace' }}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </div>
                    </div>
                    {/* Market cap */}
                    <div style={{ width:72, textAlign:'right' }}>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontFamily:'JetBrains Mono,monospace' }}>
                        {formatNum(coin.marketCap)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ position:'relative', zIndex:1 }}><BottomNav active="markets" /></div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    </div>
  )
}
