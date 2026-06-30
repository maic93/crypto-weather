// frontend/src/components/cards/AccuracyCard.tsx
// Kept for tests - not shown in main UI (no DB on Vercel deployment)
'use client'
import type { AccuracyMetrics } from '@/types'

interface Props { accuracy: AccuracyMetrics | null; isLoading: boolean }

export function AccuracyCard({ accuracy, isLoading }: Props) {
  if (isLoading || !accuracy) {
    return <div style={{ height:80, borderRadius:14, background:'rgba(255,255,255,0.04)',
      border:'1px solid rgba(255,255,255,0.07)' }} className="animate-pulse"/>
  }
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:14, padding:'11px 12px' }}>
      <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em',
        color:'rgba(255,255,255,0.28)', marginBottom:6 }}>
        30-Day Forecast Accuracy
        <span style={{ float:'right', color:'rgba(255,255,255,0.2)' }}>{accuracy.total_forecasts} forecasts</span>
      </div>
      <div style={{ fontSize:20, fontWeight:700, color:'#34d399' }}>
        {accuracy.direction_accuracy.toFixed(0)}%
      </div>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Direction accuracy</div>
    </div>
  )
}
