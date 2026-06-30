// frontend/src/components/layout/ErrorScreen.tsx
'use client'

export function ErrorScreen({ error }: { error?: string }) {
  return (
    <div style={{ height:'100dvh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', background:'#06091a', gap:12, padding:24 }}>
      <div style={{ fontSize:48 }}>⛈️</div>
      <h2 style={{ fontSize:17, fontWeight:600, color:'#fff' }}>Connection Error</h2>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textAlign:'center', maxWidth:280 }}>
        {error ?? 'Unable to reach the forecast service.'}
      </p>
      <button onClick={() => window.location.reload()}
        style={{ marginTop:8, padding:'8px 20px', borderRadius:12, border:'1px solid rgba(255,255,255,0.15)',
          background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', fontSize:13, cursor:'pointer' }}>
        Try again
      </button>
    </div>
  )
}
