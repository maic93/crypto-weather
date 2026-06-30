// frontend/src/components/ui/WeatherIcon.tsx
'use client'
import type { WeatherCondition } from '@/types'

interface Props { condition: WeatherCondition; size?: number }

export function WeatherIcon({ condition, size = 80 }: Props) {
  const id = condition
  const isBullish = condition === 'strong_bullish'
  const isPartBullish = condition === 'bullish'
  const isNeutral = condition === 'neutral'
  const isBearish = condition === 'bearish'
  const isStorm = condition === 'strong_bearish'

  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 96" fill="none">
      <defs>
        <radialGradient id={`sun-${id}`} cx="55%" cy="40%" r="50%">
          <stop offset="0%" stopColor={isNeutral ? '#94a3b8' : '#fde68a'}/>
          <stop offset="100%" stopColor={isNeutral ? '#64748b' : '#f59e0b'}/>
        </radialGradient>
        <radialGradient id={`cloud-${id}`} cx="40%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#e2e8f0"/><stop offset="100%" stopColor="#cbd5e1"/>
        </radialGradient>
      </defs>

      {isBullish && ['60,6,60,0','80,12,84,7','92,28,98,26','88,46,95,50','40,12,36,7','28,28,22,26'].map((pts,i) => {
        const [x1,y1,x2,y2] = pts.split(',')
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      })}

      {isPartBullish && ['78,6,78,0','94,14,98,9','102,30,108,28','98,48,104,52','86,60,90,66'].map((pts,i) => {
        const [x1,y1,x2,y2] = pts.split(',')
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      })}

      {(isBullish || isPartBullish || isNeutral) && (
        <>
          <circle cx={isBullish ? 60 : isPartBullish ? 75 : 72} cy={isBullish ? 42 : isPartBullish ? 33 : 30} r="22" fill={`url(#sun-${id})`}/>
          <text x={isBullish ? 60 : isPartBullish ? 75 : 72} y={isBullish ? 49 : isPartBullish ? 40 : 37} textAnchor="middle" fontSize="18" fontWeight="800" fill="rgba(255,255,255,0.92)">₿</text>
        </>
      )}

      {(isPartBullish || isNeutral) && (
        <>
          <ellipse cx="40" cy="64" rx="31" ry="22" fill={`url(#cloud-${id})`}/>
          <ellipse cx="24" cy="70" rx="19" ry="15" fill={`url(#cloud-${id})`}/>
          <ellipse cx="58" cy="69" rx="22" ry="16" fill={`url(#cloud-${id})`}/>
          <ellipse cx="40" cy="76" rx="31" ry="13" fill={`url(#cloud-${id})`}/>
        </>
      )}

      {isBearish && (
        <>
          <ellipse cx="52" cy="38" rx="34" ry="22" fill="#334155"/>
          <ellipse cx="34" cy="44" rx="22" ry="17" fill="#334155"/>
          <ellipse cx="70" cy="44" rx="20" ry="16" fill="#334155"/>
          <ellipse cx="52" cy="52" rx="34" ry="13" fill="#475569"/>
          {[['44','64','40','76'],['54','68','50','80'],['64','64','60','76']].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
        </>
      )}

      {isStorm && (
        <>
          <ellipse cx="55" cy="38" rx="36" ry="24" fill="#1e293b"/>
          <ellipse cx="36" cy="44" rx="22" ry="17" fill="#1e293b"/>
          <ellipse cx="74" cy="44" rx="20" ry="16" fill="#1e293b"/>
          <ellipse cx="55" cy="52" rx="36" ry="14" fill="#334155"/>
          {[['44','63','40','75'],['54','67','50','79'],['64','63','60','75']].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
          <path d="M60 54 L54 66 L58 66 L52 78 L65 63 L61 63 Z" fill="#fbbf24"/>
        </>
      )}
    </svg>
  )
}
