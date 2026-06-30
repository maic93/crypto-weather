// frontend/src/components/layout/BottomNav.tsx
'use client'

const TABS = [
  { id: 'today',   label: 'Today',   icon: '⛅' },
  { id: 'radar',   label: 'Radar',   icon: '📡' },
  { id: 'alerts',  label: 'Alerts',  icon: '🔔' },
  { id: 'news',    label: 'News',    icon: '📰' },
  { id: 'markets', label: 'Markets', icon: '📊' },
]

interface Props { active?: string }

export function BottomNav({ active = 'today' }: Props) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.03)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingTop: 10, paddingBottom: 20,
      flexShrink: 0,
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <div key={tab.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, cursor: 'pointer',
          }}>
            <div style={{ fontSize: 18, color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>
              {tab.icon}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 500,
              color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.25)',
            }}>
              {tab.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
