// frontend/src/components/layout/BottomNav.tsx
'use client'
import Link from 'next/link'

const TABS = [
  { id: 'today',   label: 'Today',   icon: '⛅', href: '/'        },
  { id: 'radar',   label: 'Radar',   icon: '📡', href: '/radar'   },
  { id: 'alerts',  label: 'Alerts',  icon: '🔔', href: '/alerts'  },
  { id: 'news',    label: 'News',    icon: '📰', href: '/news'    },
  { id: 'markets', label: 'Markets', icon: '📊', href: '/markets' },
]

interface Props { active?: string }

export function BottomNav({ active = 'today' }: Props) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(6,9,26,0.95)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingTop: 10, paddingBottom: 20,
      flexShrink: 0,
      backdropFilter: 'blur(20px)',
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <Link key={tab.id} href={tab.href} style={{ flex:1, textDecoration:'none' }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3, cursor: 'pointer',
            }}>
              <div style={{
                fontSize: 20,
                color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                filter: isActive ? 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' : 'none',
                transition: 'all 0.2s',
              }}>
                {tab.icon}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 500,
                color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.2s',
              }}>
                {tab.label}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
